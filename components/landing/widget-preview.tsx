import type { Dictionary } from '@/lib/i18n';
import { ChatGlyph } from './logo';

/**
 * Maquette du widget, telle qu'elle apparait sur le site d'un client.
 *
 * Volontairement inerte : aucun appel API depuis la landing. L'objectif est de
 * montrer le resultat, pas de faire une demo interactive.
 */
export function WidgetMockup({ dict }: { dict: Dictionary }) {
  const t = dict.hero.mockup;

  return (
    <div className="bg-card overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/5">
      <div className="bg-brand text-brand-foreground flex items-center gap-2.5 px-4 py-3.5">
        <ChatGlyph className="size-7" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{t.title}</p>
          <p className="flex items-center gap-1.5 text-[11px] text-white/70">
            <span className="size-1.5 rounded-full bg-emerald-300" aria-hidden />
            {t.online}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <Bubble>{t.welcome}</Bubble>
        <Bubble from="visitor">{t.question}</Bubble>
        <Bubble>{t.answer}</Bubble>

        <div className="text-muted-foreground border-t pt-2.5 text-[11px]">
          <p className="flex items-center gap-1.5">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5" />
              <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7L12 19" />
            </svg>
            monentreprise.com/livraison
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t p-3">
        <div className="text-muted-foreground bg-muted/60 flex-1 rounded-lg border px-3 py-2 text-xs">
          {t.placeholder}
        </div>
        <span className="bg-brand text-brand-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="m22 2-7 20-4-9-9-4Z" />
          </svg>
        </span>
      </div>
    </div>
  );
}

function Bubble({
  children,
  from = 'bot',
}: {
  children: React.ReactNode;
  from?: 'bot' | 'visitor';
}) {
  const isVisitor = from === 'visitor';

  return (
    <div className={isVisitor ? 'flex justify-end' : 'flex justify-start'}>
      <p
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
          isVisitor ? 'bg-brand text-brand-foreground' : 'bg-muted text-foreground/80'
        }`}
      >
        {children}
      </p>
    </div>
  );
}
