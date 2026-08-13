'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw, SendHorizontal, Sparkles, TriangleAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Dictionary } from '@/lib/i18n';

interface TickResult {
  status: string;
  pagesFound: number;
  pagesDone: number;
  chunksDone: number;
  done: boolean;
  error?: string;
}

interface BotWorkspaceProps {
  botId: string;
  status: string;
  lastSyncedAt: string | null;
  chunkCount: number;
  dict: Dictionary;
}

export function BotWorkspace({
  botId,
  status,
  lastSyncedAt,
  chunkCount,
  dict,
}: BotWorkspaceProps) {
  const t = dict.dashboard.knowledge;
  const phases: Record<string, string> = t.phases;
  const [progress, setProgress] = useState<TickResult | null>(null);
  const [running, setRunning] = useState(false);

  const analyze = useCallback(async () => {
    setRunning(true);
    setProgress(null);

    try {
      const startResponse = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId }),
      });
      const started = (await startResponse.json()) as { jobId?: string; error?: string };
      if (!started.jobId) throw new Error(started.error ?? 'Analyse impossible.');

      // L'onglet joue le role d'ordonnanceur : chaque appel avance le job d'un
      // cran, jusqu'a ce que le serveur reponde done. C'est ce qui permet de
      // tenir dans les limites de duree du serverless sans file d'attente.
      let done = false;
      while (!done) {
        const tickResponse = await fetch('/api/crawl/tick', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId: started.jobId }),
        });
        const result = (await tickResponse.json()) as TickResult;
        setProgress(result);
        if (result.error) return;
        done = result.done;
      }

      window.location.reload();
    } catch (error) {
      setProgress({
        status: 'error',
        pagesFound: 0,
        pagesDone: 0,
        chunksDone: 0,
        done: true,
        error: error instanceof Error ? error.message : 'Erreur inconnue.',
      });
    } finally {
      setRunning(false);
    }
  }, [botId]);

  const isReady = status === 'ready' && chunkCount > 0;

  return (
    <div className="flex flex-col gap-6">
      <section className="bg-background rounded-xl p-6 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold">{t.title}</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {lastSyncedAt
                ? `${t.lastSync} ${new Date(lastSyncedAt).toLocaleString()}`
                : t.never}
            </p>
          </div>

          <Button
            onClick={analyze}
            disabled={running}
            className="bg-brand hover:bg-brand/90 text-brand-foreground"
          >
            {lastSyncedAt ? <RefreshCw className={running ? 'animate-spin' : ''} /> : <Sparkles />}
            {running ? t.running : lastSyncedAt ? t.sync : t.analyse}
          </Button>
        </div>

        {progress && (
          <div className="bg-muted/60 mt-5 rounded-lg p-4">
            {progress.error ? (
              <p className="flex items-start gap-2 text-sm text-red-600">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                {progress.error}
              </p>
            ) : (
              <>
                <p className="text-sm font-medium">
                  {phases[progress.status] ?? progress.status}
                </p>
                <p className="text-muted-foreground mt-1 text-sm tabular-nums">
                  {progress.pagesDone}{' '}
                  {progress.pagesDone > 1 ? t.pagesDoneMany : t.pagesDoneOne}
                  {progress.chunksDone > 0 && ` · ${progress.chunksDone} ${t.sections}`}
                </p>
                <div className="bg-muted mt-3 h-1.5 overflow-hidden rounded-full">
                  <div
                    className="bg-brand h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        progress.pagesFound > 0
                          ? Math.min(100, (progress.pagesDone / progress.pagesFound) * 100)
                          : 8
                      }%`,
                    }}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {!lastSyncedAt && !progress && (
          <p className="text-muted-foreground mt-4 text-sm">{t.hint}</p>
        )}
      </section>

      {isReady && <TestChat botId={botId} dict={dict} />}
    </div>
  );
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: { url: string; title: string }[];
}

function TestChat({ botId, dict }: { botId: string; dict: Dictionary }) {
  const t = dict.dashboard.test;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Une session de test par montage du composant.
  const sessionId = useRef(`test-${crypto.randomUUID()}`);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const ask = useCallback(
    async (question: string) => {
      if (!question || pending) return;

      setInput('');
      setPending(true);
      setMessages((current) => [
        ...current,
        { role: 'user', content: question },
        { role: 'assistant', content: '' },
      ]);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ botId, sessionId: sessionId.current, message: question }),
        });

        const reader = response.body?.getReader();
        if (!reader) throw new Error('Réponse illisible.');

        const decoder = new TextDecoder();
        let buffer = '';

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split('\n\n');
          buffer = events.pop() ?? '';

          for (const raw of events) {
            if (!raw.startsWith('data: ')) continue;
            const payload = JSON.parse(raw.slice(6)) as {
              type: string;
              text?: string;
              sources?: { url: string; title: string }[];
              message?: string;
            };

            setMessages((current) => {
              const next = [...current];
              const last = next[next.length - 1];
              if (!last || last.role !== 'assistant') return current;

              if (payload.type === 'delta') {
                next[next.length - 1] = {
                  ...last,
                  content: last.content + (payload.text ?? ''),
                };
              } else if (payload.type === 'done') {
                next[next.length - 1] = { ...last, sources: payload.sources };
              } else if (payload.type === 'error') {
                next[next.length - 1] = { ...last, content: payload.message ?? 'Erreur.' };
              }
              return next;
            });
          }
        }
      } finally {
        setPending(false);
      }
    },
    [botId, pending],
  );

  return (
    <section className="bg-background rounded-xl p-6 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
      <h2 className="font-semibold">{t.title}</h2>
      <p className="text-muted-foreground mt-1 text-sm">{t.lead}</p>

      {messages.length === 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {t.suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => ask(suggestion)}
              className="bg-muted/70 hover:bg-brand-soft hover:text-brand cursor-pointer rounded-full px-3 py-1.5 text-sm transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : (
        <div ref={scrollRef} className="mt-5 max-h-96 overflow-y-auto pr-1">
          <div className="flex flex-col gap-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    message.role === 'user'
                      ? 'bg-brand text-brand-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.content ||
                    (pending && index === messages.length - 1 ? (
                      <span className="text-muted-foreground">…</span>
                    ) : null)}

                  {message.sources && message.sources.length > 0 && (
                    <span className="mt-2 flex flex-col gap-0.5 border-t pt-2 text-xs opacity-70">
                      {message.sources.slice(0, 3).map((source) => (
                        <a
                          key={source.url}
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="truncate hover:underline"
                        >
                          {source.url}
                        </a>
                      ))}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void ask(input.trim());
        }}
        className="mt-5 flex gap-2"
      >
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={t.placeholder}
          disabled={pending}
          maxLength={1000}
        />
        <Button
          type="submit"
          disabled={pending || !input.trim()}
          className="bg-brand hover:bg-brand/90 text-brand-foreground"
          aria-label={t.send}
        >
          <SendHorizontal />
        </Button>
      </form>
    </section>
  );
}
