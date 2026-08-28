'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Trash2, TriangleAlert, Upload } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import type { Dictionary, Locale } from '@/lib/i18n';
import { Spinner } from '@/components/ui/spinner';
import { UpgradeDialog, type UpgradeOffer } from '@/components/dashboard/upgrade-dialog';

export interface DocumentRow {
  id: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
}

const ACCEPT = '.pdf,.docx,.txt,.md';
const MAX_BYTES = 10 * 1024 * 1024;

const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
  md: 'text/markdown',
};

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
  return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
}

interface Pending {
  name: string;
  stage: 'uploading' | 'reading';
}

export function DocumentsCard({
  botId,
  documents,
  locale,
  dict,
}: {
  botId: string;
  documents: DocumentRow[];
  locale: Locale;
  dict: Dictionary;
}) {
  const t = dict.dashboard.documents;
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [pending, setPending] = useState<Pending | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgrade, setUpgrade] = useState<UpgradeOffer | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  /**
   * Envoi puis traitement, fichier par fichier.
   *
   * Le fichier part directement vers le stockage via une URL signee : il ne
   * transite jamais par nos fonctions, qui plafonnent a 4,5 Mo par requete.
   */
  async function handleFiles(files: FileList | null) {
    if (!files?.length || pending) return;
    setError(null);
    setNotice(null);

    const supabase = createClient();

    for (const file of Array.from(files)) {
      const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
      const mimeType = MIME_BY_EXTENSION[extension];

      if (!mimeType) {
        setError(t.errorFormat);
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError(`${file.name}  ${t.errorTooLarge}`);
        continue;
      }

      try {
        setPending({ name: file.name, stage: 'uploading' });

        const signed = await fetch('/api/documents/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ botId, fileName: file.name, mimeType, size: file.size }),
        });
        const slot = (await signed.json()) as { path?: string; token?: string; error?: string };
        if (!slot.path || !slot.token) throw new Error(slot.error ?? 'Envoi impossible.');

        const upload = await supabase.storage
          .from('documents')
          .uploadToSignedUrl(slot.path, slot.token, file);
        if (upload.error) throw new Error(upload.error.message);

        setPending({ name: file.name, stage: 'reading' });

        const processed = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ botId, path: slot.path, fileName: file.name, mimeType }),
        });
        const result = (await processed.json()) as {
          truncated?: boolean;
          error?: string;
          code?: string;
          upgrade?: UpgradeOffer;
        };

        /*
         * Plafond atteint : on ouvre la proposition au lieu d'afficher un
         * refus. Et on interrompt la boucle  insister sur les fichiers
         * suivants produirait le meme blocage autant de fois.
         */
        if (result.code === 'document_limit' && result.upgrade) {
          setUpgrade(result.upgrade);
          break;
        }

        if (!processed.ok) throw new Error(result.error ?? 'Lecture impossible.');

        if (result.truncated) setNotice(`${file.name}  ${t.truncated}`);
      } catch (cause) {
        setError(`${file.name}  ${cause instanceof Error ? cause.message : 'Erreur.'}`);
      } finally {
        setPending(null);
      }
    }

    if (inputRef.current) inputRef.current.value = '';
    router.refresh();
  }

  async function remove(id: string) {
    await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <section className="panel p-5">
      <h2 className="text-sm font-semibold">{t.title}</h2>
      <p className="text-muted-foreground mt-1 max-w-xl text-sm text-pretty">{t.lead}</p>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void handleFiles(event.dataTransfer.files);
        }}
        className={`mt-5 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragging ? 'border-brand bg-brand-soft' : 'hover:border-foreground/20'
        }`}
      >
        {pending ? (
          <div className="flex flex-col items-center gap-2">
            <Spinner className="text-brand size-5" />
            <p className="text-sm font-medium">{pending.name}</p>
            <p className="text-muted-foreground text-xs">
              {pending.stage === 'uploading' ? t.uploading : t.reading}
            </p>
          </div>
        ) : (
          <>
            <span className="bg-muted text-muted-foreground mx-auto flex size-11 items-center justify-center rounded-full">
              <Upload className="size-5" aria-hidden />
            </span>
            <p className="mt-3 text-sm font-medium">{t.drop}</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-brand mt-1 cursor-pointer text-sm hover:underline"
            >
              {t.browse}
            </button>
            <p className="text-muted-foreground mt-3 text-xs">{t.accepted}</p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={(event) => void handleFiles(event.target.files)}
        />
      </div>

      <UpgradeDialog
        offer={upgrade}
        open={Boolean(upgrade)}
        onClose={() => setUpgrade(null)}
        locale={locale}
        dict={dict}
      />

      {error && (
        <p role="alert" className="mt-3 flex items-start gap-2 text-sm text-red-600">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="text-muted-foreground mt-3 text-sm">
          {notice}
        </p>
      )}

      {documents.length > 0 ? (
        <ul className="mt-5 flex flex-col gap-2">
          {documents.map((document) => (
            <li
              key={document.id}
              className="flex items-center gap-3 rounded-lg border px-3.5 py-2.5"
            >
              <FileText className="text-muted-foreground size-4 shrink-0" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{document.fileName}</p>
                <p className="text-muted-foreground text-xs">
                  {formatSize(document.fileSize)} · {t.addedOn}{' '}
                  {new Date(document.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void remove(document.id)}
                aria-label={t.remove}
                title={t.remove}
                className="text-muted-foreground hover:bg-accent flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors hover:text-red-600"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        !pending && <p className="text-muted-foreground mt-5 text-sm">{t.empty}</p>
      )}
    </section>
  );
}
