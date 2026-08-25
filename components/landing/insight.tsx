import { ArrowRight, TrendingUp } from 'lucide-react';

import { Reveal } from '@/components/reveal';
import type { Dictionary } from '@/lib/i18n';
import { Section, SectionHeading } from './section';

/**
 * Le rapport des questions sans reponse, presente comme du renseignement
 * commercial plutot que comme un ecran du produit.
 *
 * La difference est tout l'argument : un tableau de bord se compare a d'autres
 * tableaux de bord ; une liste de ce qui bloque vos ventes ne se compare a
 * rien.
 */
export function Insight({ dict }: { dict: Dictionary }) {
  const t = dict.insight;

  return (
    <Section>
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            eyebrow={t.eyebrow}
            title={t.title}
            lead={t.lead}
            align="left"
          />

          <Reveal delay={100}>
            <p className="mt-7 flex items-start gap-2.5 text-base font-medium">
              <ArrowRight className="text-brand mt-1 size-4 shrink-0" aria-hidden />
              {t.payoff}
            </p>
            <p className="text-muted-foreground border-brand/30 mt-5 border-l-2 pl-4 text-sm leading-relaxed text-pretty">
              {t.note}
            </p>
          </Reveal>
        </div>

        <Reveal delay={150}>
          <div className="bg-card rounded-2xl p-5 shadow-xl ring-1 ring-black/5 md:p-6 dark:ring-white/10">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-brand size-4" aria-hidden />
              <p className="text-sm font-semibold">{t.listTitle}</p>
            </div>

            {/* Classees par frequence : la premiere ligne est celle qui coute
                le plus cher au client. */}
            <ul className="mt-4 divide-y">
              {t.items.map((item) => (
                <li
                  key={item.question}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <span className="text-sm text-pretty">{item.question}</span>
                  <span className="bg-brand-soft text-brand shrink-0 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums">
                    {item.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
