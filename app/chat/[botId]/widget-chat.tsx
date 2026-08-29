'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { RichText } from '@/components/rich-text';
import type { Dictionary } from '@/lib/i18n';

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
  /** Logo televerse par le proprietaire. `null` = pastille d'initiale. */
  logoUrl: string | null;
  /** Faux quand le palier du proprietaire retire la mention Deezy. */
  showBranding: boolean;
  appUrl: string;
  /** Vocabulaire dans la langue du visiteur, resolu cote serveur. */
  t: Dictionary['widget'];
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
  logoUrl,
  showBranding,
  appUrl,
  t,
}: WidgetChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  /** Une seule adresse par session : on ne redemande pas a chaque refus. */
  const [leadCaptured, setLeadCaptured] = useState(false);
  const sessionId = useSessionId(botId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastQuestion = useRef('');

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, leadCaptured]);

  /*
   * Le curseur se place dans le champ a l'ouverture du panneau.
   *
   * widget.js envoyait deja `deezy:opened` — personne ne l'ecoutait. Le
   * visiteur devait donc cliquer une seconde fois pour ecrire.
   *
   * Pas sur mobile : y placer le curseur leve le clavier par-dessus la
   * conversation, avant meme que le visiteur ait lu le message d'accueil.
   */
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'deezy:opened') return;
      if (window.matchMedia('(min-width: 481px)').matches) inputRef.current?.focus();
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  /** Le champ grandit avec le texte, jusqu'a quatre lignes environ. */
  const resize = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  }, []);

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
      requestAnimationFrame(resize);
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

        if (!response.ok || !response.body) throw new Error(t.unavailable);

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
                  content: t.error,
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
              content: t.error,
            };
          }
          return next;
        });
      } finally {
        setPending(false);
      }
    },
    [botId, input, pending, sessionId, resize, t],
  );

  const showLeadForm =
    !leadCaptured && !pending && messages[messages.length - 1]?.leadCapture === true;

  const initial = (name.trim()[0] ?? 'D').toUpperCase();

  return (
    <div className="flex h-dvh flex-col bg-white text-slate-900">
      <header
        className="relative flex shrink-0 items-center gap-3 px-4 py-3 text-white"
        style={{ backgroundColor: primaryColor }}
      >
        {/*
          Voile clair pose sur la couleur du client.
          Il donne du relief a n'importe quelle teinte, sans avoir a la
          recalculer : un degrade calcule demanderait de convertir un
          hexadecimal arbitraire, et raterait les couleurs tres claires.
        */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 to-transparent"
        />

        {/*
          Le logo prend la place de l'initiale quand il existe.

          Fond blanc et `object-contain` : un logo est dessine pour du blanc,
          et le poser sur la couleur de marque du client le rendrait souvent
          illisible — un logo bleu sur un en-tete bleu disparait. `contain`
          plutot que `cover` parce qu'un logo se recadre mal : on prefere des
          marges au rognage d'un mot.

          `alt=""` : le nom de l'assistant est juste a cote, en texte. Le
          repeter ferait entendre deux fois la meme chose a un lecteur d'ecran.
        */}
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt=""
            className="relative size-9 shrink-0 rounded-xl bg-white object-contain p-1"
          />
        ) : (
          <span className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-sm font-bold">
            {initial}
          </span>
        )}

        <div className="relative min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="flex items-center gap-1.5 text-[11px] text-white/80">
            <span className="size-1.5 shrink-0 rounded-full bg-emerald-300" aria-hidden />
            <span className="truncate">
              {t.online} · {t.replyTime}
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={close}
          aria-label={t.close}
          className="relative flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-white/20"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </header>

      {/* `log` + `aria-live` : sans eux, un lecteur d'ecran n'annonce jamais la
          reponse qui vient d'arriver. */}
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        className="flex-1 overflow-y-auto overscroll-contain px-4 py-4"
      >
        <div className="flex flex-col">
          <Bubble role="assistant" color={primaryColor}>
            <RichText text={welcomeMessage} />
          </Bubble>

          {messages.map((message, index) => (
            <Bubble
              key={index}
              role={message.role}
              color={primaryColor}
              // Deux messages du meme cote se resserrent : c'est ce qui les
              // fait lire comme un seul tour de parole.
              grouped={
                index === 0
                  ? message.role === 'assistant'
                  : messages[index - 1]?.role === message.role
              }
            >
              {/* La question du visiteur reste du texte brut : personne n'ecrit
                  en markdown dans un champ de discussion, et l'interpreter
                  transformerait ses etoiles en mise en forme involontaire. */}
              {message.content ? (
                message.role === 'assistant' ? (
                  <RichText text={message.content} />
                ) : (
                  message.content
                )
              ) : pending && index === messages.length - 1 ? (
                <span className="flex items-center gap-1 py-0.5">
                  <Dot delay="0ms" />
                  <Dot delay="200ms" />
                  <Dot delay="400ms" />
                </span>
              ) : (
                ''
              )}

              {message.sources && message.sources.length > 0 && (
                <span className="mt-2.5 flex flex-wrap gap-1.5 border-t border-slate-200 pt-2.5">
                  {message.sources.slice(0, 3).map((source) => (
                    <a
                      key={source.url}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex max-w-full items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] text-slate-500 ring-1 ring-slate-200 transition-colors hover:text-slate-900"
                    >
                      <svg
                        width="9"
                        height="9"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="shrink-0"
                        aria-hidden
                      >
                        <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5" />
                        <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7L12 19" />
                      </svg>
                      <span className="truncate">{source.title || source.url}</span>
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
              t={t}
              onDone={() => setLeadCaptured(true)}
            />
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-200 p-3">
        {/*
          Champ et bouton dans un meme contenant arrondi : l'ancien duo
          rectangle + carre separes datait le widget a lui seul.
        */}
        <form
          onSubmit={send}
          className="flex items-end gap-2 rounded-2xl border border-slate-300 bg-white py-1.5 pr-1.5 pl-3 transition-colors focus-within:border-slate-400"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              resize();
            }}
            /* Entree envoie, Maj+Entree passe a la ligne : la convention de
               toutes les messageries. L'ancien <input> interdisait le
               multiligne, donc toute question un peu longue partait d'un bloc. */
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                send(event);
              }
            }}
            rows={1}
            placeholder={t.placeholder}
            disabled={pending}
            maxLength={1000}
            className="max-h-24 min-w-0 flex-1 resize-none bg-transparent py-1.5 text-sm leading-relaxed outline-none disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={pending || !input.trim()}
            aria-label={t.send}
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-xl text-white transition-all disabled:cursor-not-allowed disabled:opacity-30"
            style={{ backgroundColor: primaryColor }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 2-7 20-4-9-9-4Z" />
            </svg>
          </button>
        </form>
      </div>

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
          className="block shrink-0 border-t border-slate-100 py-1.5 text-center text-[10px] text-slate-400 transition-colors hover:text-slate-600"
        >
          {t.branding}
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
  t,
  onDone,
}: {
  botId: string;
  sessionId: string;
  question: string;
  color: string;
  t: Dictionary['widget'];
  onDone: () => void;
}) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="mt-3 flex items-start gap-2 rounded-2xl bg-emerald-50 px-3.5 py-3 text-xs leading-relaxed text-emerald-800 ring-1 ring-emerald-100">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-0.5 shrink-0"
          aria-hidden
        >
          <path d="m20 6-11 11-5-5" />
        </svg>
        {t.leadThanks}
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
            setError(result.error ?? t.leadFailed);
            return;
          }
          setSent(true);
          onDone();
        } catch {
          setError(t.leadOffline);
        } finally {
          setSending(false);
        }
      }}
      className="mt-3 rounded-2xl bg-slate-50 p-3.5 ring-1 ring-slate-200"
    >
      <p className="text-xs leading-relaxed text-slate-600">{t.leadLead}</p>

      <div className="mt-2.5 flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t.leadPlaceholder}
          required
          disabled={sending}
          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs outline-none transition-colors focus:border-slate-400"
        />
        <button
          type="submit"
          disabled={sending || !email.trim()}
          className="shrink-0 cursor-pointer rounded-xl px-3.5 text-xs font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: color }}
        >
          {sending ? '…' : t.send}
        </button>
      </div>

      {error && <p className="mt-2 text-[11px] text-red-600">{error}</p>}
    </form>
  );
}

/**
 * Une bulle de conversation.
 *
 * Le coin du cote de l'expediteur est moins arrondi que les trois autres :
 * c'est ce qui donne a la bulle une direction, sans dessiner de queue.
 */
function Bubble({
  role,
  color,
  grouped = false,
  children,
}: {
  role: 'user' | 'assistant';
  color: string;
  /** Le message precedent vient du meme cote : on resserre l'ecart. */
  grouped?: boolean;
  children: React.ReactNode;
}) {
  const isUser = role === 'user';

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${grouped ? 'mt-1' : 'mt-3'} first:mt-0`}
    >
      <div
        className={`max-w-[85%] px-3.5 py-2.5 text-sm ${
          isUser
            ? 'rounded-2xl rounded-br-md whitespace-pre-wrap'
            : 'rounded-2xl rounded-bl-md leading-relaxed'
        }`}
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
      className="deezy-typing-dot inline-block size-1.5 rounded-full bg-slate-400"
      style={{ animationDelay: delay }}
    />
  );
}
