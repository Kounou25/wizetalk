'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: { url: string; title: string }[];
  /** Vrai quand l'assistant a admis ne pas savoir et qu'on peut proposer un rappel. */
  leadCapture?: boolean;
}

interface WidgetChatProps {
  botId: string;
  name: string;
  welcomeMessage: string;
  primaryColor: string;
  /** Faux quand le palier du proprietaire retire la mention Deezy. */
  showBranding: boolean;
  appUrl: string;
}

/** Identifiant de visiteur, stable tant que l'onglet reste ouvert. */
function useSessionId(botId: string) {
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    const key = `deezy:${botId}`;
    let existing = sessionStorage.getItem(key);
    if (!existing) {
      existing = crypto.randomUUID();
      sessionStorage.setItem(key, existing);
    }
    setSessionId(existing);
  }, [botId]);

  return sessionId;
}

export function WidgetChat({
  botId,
  name,
  welcomeMessage,
  primaryColor,
  showBranding,
  appUrl,
}: WidgetChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  /** Une seule adresse par session : on ne redemande pas a chaque refus. */
  const [leadCaptured, setLeadCaptured] = useState(false);
  const sessionId = useSessionId(botId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastQuestion = useRef('');

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, leadCaptured]);

  const close = useCallback(() => {
    window.parent.postMessage({ type: 'deezy:close' }, '*');
  }, []);

  const send = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      const question = input.trim();
      if (!question || pending || !sessionId) return;

      lastQuestion.current = question;
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
          body: JSON.stringify({ botId, sessionId, message: question }),
        });

        if (!response.ok || !response.body) throw new Error('Réponse indisponible.');

        const reader = response.body.getReader();
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
              leadCapture?: boolean;
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
                next[next.length - 1] = {
                  ...last,
                  sources: payload.sources,
                  leadCapture: payload.leadCapture,
                };
              } else if (payload.type === 'error') {
                next[next.length - 1] = {
                  ...last,
                  content: 'Désolé, une erreur est survenue. Réessayez dans un instant.',
                };
              }
              return next;
            });
          }
        }
      } catch {
        setMessages((current) => {
          const next = [...current];
          const last = next[next.length - 1];
          if (last && last.role === 'assistant' && !last.content) {
            next[next.length - 1] = {
              ...last,
              content: 'Désolé, une erreur est survenue. Réessayez dans un instant.',
            };
          }
          return next;
        });
      } finally {
        setPending(false);
      }
    },
    [botId, input, pending, sessionId],
  );

  const showLeadForm =
    !leadCaptured && !pending && messages[messages.length - 1]?.leadCapture === true;

  return (
    <div className="flex h-dvh flex-col bg-white text-slate-900">
      <header
        className="flex items-center justify-between px-4 py-3 text-white"
        style={{ backgroundColor: primaryColor }}
      >
        <p className="text-sm font-semibold">{name}</p>
        <button
          type="button"
          onClick={close}
          aria-label="Fermer"
          className="cursor-pointer rounded p-1 leading-none opacity-80 transition-opacity hover:opacity-100"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-3">
          <Bubble role="assistant" color={primaryColor}>
            {welcomeMessage}
          </Bubble>

          {messages.map((message, index) => (
            <Bubble key={index} role={message.role} color={primaryColor}>
              {message.content ||
                (pending && index === messages.length - 1 ? (
                  <span className="inline-flex gap-1">
                    <Dot delay="0ms" />
                    <Dot delay="150ms" />
                    <Dot delay="300ms" />
                  </span>
                ) : (
                  ''
                ))}
              {message.sources && message.sources.length > 0 && (
                <span className="mt-2 flex flex-col gap-0.5 border-t border-slate-200 pt-2 text-[11px] text-slate-500">
                  {message.sources.slice(0, 3).map((source) => (
                    <a
                      key={source.url}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate hover:underline"
                    >
                      {source.title || source.url}
                    </a>
                  ))}
                </span>
              )}
            </Bubble>
          ))}

          {showLeadForm && (
            <LeadForm
              botId={botId}
              sessionId={sessionId}
              question={lastQuestion.current}
              color={primaryColor}
              onDone={() => setLeadCaptured(true)}
            />
          )}
        </div>
      </div>

      <form onSubmit={send} className="flex gap-2 border-t border-slate-200 p-3">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Écrivez votre message…"
          disabled={pending}
          maxLength={1000}
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400"
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          aria-label="Envoyer"
          className="shrink-0 cursor-pointer rounded-lg px-3 text-white transition-opacity disabled:opacity-40"
          style={{ backgroundColor: primaryColor }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m22 2-7 20-4-9-9-4Z" />
          </svg>
        </button>
      </form>

      {/*
        Mention de marque.
        
        C'est elle que le palier le plus haut permet de retirer : sans elle, cet
        avantage vendrait le retrait de quelque chose qui n'existe pas. Placee
        sous le champ de saisie et en petit — elle doit se voir sans gener la
        conversation, qui appartient au client.
      */}
      {showBranding && (
        <a
          href={`${appUrl}?utm_source=widget`}
          target="_blank"
          rel="noreferrer noopener"
          className="block border-t border-slate-100 py-1.5 text-center text-[10px] text-slate-400 transition-colors hover:text-slate-600"
        >
          Propulsé par Deezy
        </a>
      )}
    </div>
  );
}

/**
 * Formulaire de rappel, propose juste apres un refus.
 *
 * C'est le seul moment ou demander une adresse est legitime : l'assistant
 * vient d'admettre qu'il ne sait pas, et la question est deja ecrite — le
 * visiteur n'a rien a reformuler.
 */
function LeadForm({
  botId,
  sessionId,
  question,
  color,
  onDone,
}: {
  botId: string;
  sessionId: string;
  question: string;
  color: string;
  onDone: () => void;
}) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="rounded-xl bg-emerald-50 px-3.5 py-3 text-xs leading-relaxed text-emerald-800">
        Merci, c&apos;est noté. Nous revenons vers vous par e-mail.
      </div>
    );
  }

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        if (sending) return;
        setSending(true);
        setError(null);

        try {
          const response = await fetch('/api/lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ botId, sessionId, email: email.trim(), question }),
          });
          const result = (await response.json()) as { ok?: boolean; error?: string };

          if (!response.ok || !result.ok) {
            setError(result.error ?? "L'enregistrement a échoué.");
            return;
          }
          setSent(true);
          onDone();
        } catch {
          setError('Connexion impossible. Réessayez.');
        } finally {
          setSending(false);
        }
      }}
      className="rounded-xl bg-slate-50 p-3.5"
    >
      <p className="text-xs leading-relaxed text-slate-600">
        Laissez-nous votre e-mail, nous vous répondons directement.
      </p>

      <div className="mt-2.5 flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="vous@exemple.com"
          required
          disabled={sending}
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs outline-none focus:border-slate-400"
        />
        <button
          type="submit"
          disabled={sending || !email.trim()}
          className="shrink-0 cursor-pointer rounded-lg px-3 text-xs font-medium text-white transition-opacity disabled:opacity-40"
          style={{ backgroundColor: color }}
        >
          {sending ? '…' : 'Envoyer'}
        </button>
      </div>

      {error && <p className="mt-2 text-[11px] text-red-600">{error}</p>}
    </form>
  );
}

function Bubble({
  role,
  color,
  children,
}: {
  role: 'user' | 'assistant';
  color: string;
  children: React.ReactNode;
}) {
  const isUser = role === 'user';

  return (
    <div className={isUser ? 'flex justify-end' : 'flex justify-start'}>
      <div
        className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap"
        style={
          isUser
            ? { backgroundColor: color, color: '#fff' }
            : { backgroundColor: '#f1f5f9' }
        }
      >
        {children}
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="inline-block size-1.5 animate-bounce rounded-full bg-slate-400"
      style={{ animationDelay: delay }}
    />
  );
}
