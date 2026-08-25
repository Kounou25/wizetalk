import { Check, Link2, X } from 'lucide-react';

import { Reveal } from '@/components/reveal';
import type { Dictionary } from '@/lib/i18n';
import { Section, SectionHeading } from './section';

/**
 * La meme scene, jouee deux fois.
 *
 * C'est la section qui doit se comprendre sans etre lue : deux colonnes, la
 * meme question a gauche et a droite, deux issues opposees en bas. Si le
 * lecteur ne retient qu'une image de la page, ce devrait etre celle-ci.
 */
export function BeforeAfter({ dict }: { dict: Dictionary }) {
  const t = dict.beforeAfter;

  return (
    <Section tone="muted">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} />

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        <Reveal>
          <div className="bg-background flex h-full flex-col rounded-2xl p-5 opacity-90 ring-1 ring-black/5 md:p-6 dark:ring-white/10">
            <div className="flex items-center gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600">
                <X className="size-3.5" aria-hidden />
              </span>
              <p className="text-muted-foreground text-sm font-semibold">
                {t.without.label}
              </p>
            </div>

            <div className="mt-5 flex flex-1 flex-col gap-3">
              {t.without.turns.map((turn) => (
                <div key={turn.question} className="flex flex-col gap-1.5">
                  <Bubble from="visitor">{turn.question}</Bubble>
                  {/* La reponse type d'un site sans assistant : polie, et
                      parfaitement inutile a qui veut acheter maintenant. */}
                  <Bubble muted>{turn.answer}</Bubble>
                </div>
              ))}
            </div>

            <p className="mt-5 rounded-lg bg-red-500/10 px-3 py-2.5 text-center text-sm font-semibold text-red-600">
              {t.without.outcome}
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="bg-background ring-brand/25 flex h-full flex-col rounded-2xl p-5 shadow-lg ring-1 md:p-6">
            <div className="flex items-center gap-2">
              <span className="bg-brand-soft text-brand flex size-6 shrink-0 items-center justify-center rounded-full">
                <Check className="size-3.5" aria-hidden />
              </span>
              <p className="text-brand text-sm font-semibold">{t.with.label}</p>
            </div>

            <div className="mt-5 flex flex-1 flex-col gap-3">
              {t.with.turns.map((turn, index) => (
                <div key={turn.question} className="flex flex-col gap-1.5">
                  <Bubble from="visitor">{turn.question}</Bubble>
                  <Bubble>{turn.answer}</Bubble>

                  {/* La source, sous la premiere reponse seulement : la
                      repeter a chaque tour alourdirait sans rien prouver de
                      plus. */}
                  {index === 0 && (
                    <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 pl-1 text-[11px]">
                      <Link2 className="size-3 shrink-0" aria-hidden />
                      {t.with.sourceLabel} ·{' '}
                      <span className="font-medium">{t.with.sourceName}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>

            <p className="bg-brand text-brand-foreground mt-5 rounded-lg px-3 py-2.5 text-center text-sm font-semibold">
              {t.with.outcome}
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

function Bubble({
  children,
  from = 'bot',
  muted = false,
}: {
  children: React.ReactNode;
  from?: 'bot' | 'visitor';
  /** Reponse creuse du site sans assistant : grisee, sans identite. */
  muted?: boolean;
}) {
  if (from === 'visitor') {
    return (
      <div className="flex justify-end">
        <p className="bg-brand text-brand-foreground max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed">
          {children}
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <p
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
          muted
            ? 'text-muted-foreground border border-dashed italic'
            : 'bg-muted text-foreground/80'
        }`}
      >
        {children}
      </p>
    </div>
  );
}
