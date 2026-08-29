'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, Trash2 } from 'lucide-react';

import { removeBotLogo, setBotLogo } from '@/app/dashboard/actions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { createClient } from '@/lib/supabase/client';
import {
  isAcceptedLogoMime,
  LOGO_ACCEPT,
  LOGO_BUCKET,
  MAX_LOGO_BYTES,
} from '@/lib/bot-logo';
import type { Dictionary } from '@/lib/i18n';

/** Le navigateur ne renseigne pas toujours `file.type` : on retombe sur l'extension. */
const MIME_BY_EXTENSION: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

/**
 * Logo de l'assistant.
 *
 * IL S'APPLIQUE SEUL, SANS ATTENDRE « ENREGISTRER »
 *
 * Les autres champs partent ensemble a la soumission. Un fichier, lui,
 * s'envoie au moment ou on le choisit : le faire attendre le bouton
 * obligerait a garder le binaire en memoire, et le perdrait au moindre
 * rechargement. L'apercu se met donc a jour immediatement.
 *
 * L'envoi va directement au stockage via une URL signee, comme les documents —
 * le fichier ne traverse jamais nos fonctions.
 */
export function LogoField({
  botId,
  logoUrl,
  dict,
}: {
  botId: string;
  logoUrl: string | null;
  dict: Dictionary;
}) {
  const t = dict.dashboard.settings;
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [removing, startRemoving] = useTransition();
  const [error, setError] = useState<string | null>(null);

  /*
   * Apercu local, affiche pendant que le fichier part.
   *
   * Sans lui, le logo n'apparait qu'apres l'aller-retour serveur et le
   * rafraichissement de la page — deux secondes pendant lesquelles le client
   * croit que rien ne s'est passe et reclique.
   */
  const [preview, setPreview] = useState<string | null>(null);
  const shown = preview ?? logoUrl;

  async function upload(file: File) {
    setError(null);

    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    const mimeType = file.type || MIME_BY_EXTENSION[extension] || '';

    if (!isAcceptedLogoMime(mimeType)) {
      setError(t.logoErrorFormat);
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setError(t.logoErrorTooLarge);
      return;
    }

    setUploading(true);
    const local = URL.createObjectURL(file);
    setPreview(local);

    try {
      const signed = await fetch('/api/bot-logo/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId, mimeType, size: file.size }),
      });
      const slot = (await signed.json()) as {
        path?: string;
        token?: string;
        error?: string;
      };
      if (!slot.path || !slot.token) throw new Error(slot.error ?? t.logoErrorFailed);

      const sent = await createClient()
        .storage.from(LOGO_BUCKET)
        .uploadToSignedUrl(slot.path, slot.token, file);
      if (sent.error) throw new Error(sent.error.message);

      await setBotLogo(botId, slot.path);
      router.refresh();
    } catch (cause) {
      setPreview(null);
      setError(cause instanceof Error ? cause.message : t.logoErrorFailed);
    } finally {
      // L'apercu local est libere par le navigateur ; l'URL distante prend le
      // relais au rafraichissement.
      URL.revokeObjectURL(local);
      setUploading(false);
    }
  }

  const busy = uploading || removing;

  return (
    <div className="flex flex-col gap-2">
      <Label>{t.logoLabel}</Label>

      <div className="flex items-center gap-4">
        <span className="bg-surface-subtle border-border flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border">
          {shown ? (
            /* Balise `img` et non `next/image` : la source vient du stockage
               Supabase, un domaine que l'optimiseur devrait etre autorise a
               chercher — et l'image fait au plus 1 Mo, affichee a 56 px. */
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt="" className="size-full object-contain" />
          ) : (
            <ImagePlus className="text-muted-foreground size-5" aria-hidden />
          )}
        </span>

        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              {uploading && <Spinner className="size-3.5" />}
              {uploading ? t.logoUploading : shown ? t.logoReplace : t.logoAdd}
            </Button>

            {shown && !uploading && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() =>
                  startRemoving(async () => {
                    setError(null);
                    setPreview(null);
                    await removeBotLogo(botId);
                    router.refresh();
                  })
                }
              >
                {removing ? <Spinner className="size-3.5" /> : <Trash2 />}
                {t.logoRemove}
              </Button>
            )}
          </div>

          <p className="text-muted-foreground text-xs text-pretty">
            {shown ? t.logoHint : t.logoEmpty}
          </p>
        </div>
      </div>

      {/* Sans `name` : le champ vit dans le <form> de reglages sans partir
          avec l'enregistrement, son travail etant deja fait. */}
      <input
        ref={inputRef}
        type="file"
        accept={LOGO_ACCEPT}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          // Remis a zero pour que choisir deux fois le meme fichier declenche
          // bien un second `change`.
          event.target.value = '';
          if (file) void upload(file);
        }}
      />

      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
