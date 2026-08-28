import { ArrowRight, Check } from 'lucide-react';

import { Reveal } from '@/components/reveal';
import { Badge } from '@/components/ui/badge';
import type { Dictionary } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
  Section,
  SectionHeading,
  splitAside,
  splitGrid,
  splitMain,
} from '../section';

/**
 * L'analyse des conversations, presentee comme du renseignement plutot que
 * comme un ecran de plus.
 *
 * LA MENTION « DONNEES DE DEMONSTRATION » N'EST PAS NEGOCIABLE
 *
 * Cette maquette affiche 12 480 conversations et 87 % de taux de reponse. Ces
 * valeurs sont inventees, et elles doivent le rester : nous n'avons pas de
 * mesure publiable, et presenter un chiffre fabrique comme une performance de
 * Deezy serait un argument de vente faux.
 *
 * D'ou l'etiquette dans l'en-tete du panneau ET la legende sous le panneau.
 * Deux mentions, parce qu'une capture d'ecran de cette section circulera sans
 * la legende — et l'etiquette, elle, est dans l'image.
 *
 * Si un jour une mesure reelle existe, elle remplacera ces valeurs ET
 * l'etiquette. Pas l'une sans l'autre.
 */
export function EnterpriseAnalytics({ dict }: { dict: Dictionary }) {
  const t = dict.enterprise.analytics;
  const d = t.dashboard;

  return (
    <Section tone="muted">
      <div className={cn(splitGrid, 'items-start')}>
        <div className={splitMain}>
          <SectionHeading
            eyebrow={t.eyebrow}
            title={t.title}
            lead={t.lead}
            align="left"
          />

          <Reveal delay={100}>
            <ul className="mt-8 flex flex-col gap-2.5">
              {t.items.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm">
                  <Check className="text-brand mt-0.5 size-4 shrink-0" aria-hidden />
                  <span className="text-pretty">{item}</span>
                </li>
              ))}
            </ul>

            <p className="mt-8 flex items-start gap-2.5 text-base font-medium text-pretty">
              <ArrowRight className="text-brand mt-1 size-4 shrink-0" aria-hidden />
              {t.payoff}
            </p>
          </Reveal>
        </div>

        <Reveal delay={150} className={splitAside}>
          <div className="bg-card overflow-hidden rounded-2xl border shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <p className="text-sm font-semibold">{d.title}</p>
                <span className="text-muted-foreground text-xs">{d.period}</span>
              </div>
              <Badge variant="warning">{d.demoBadge}</Badge>
            </div>

            <div className="grid grid-cols-2 divide-x divide-y sm:grid-cols-4 sm:divide-y-0">
              {d.metrics.map((metric) => (
                <div key={metric.label} className="px-5 py-4">
                  <p className="text-muted-foreground text-xs">{metric.label}</p>
                  <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums">
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t px-5 py-4">
              <p className="text-sm font-semibold">{d.topTitle}</p>

              {/* Classees par frequence : la premiere ligne est celle qui
                  occupe le plus les equipes du client. */}
              <ul className="mt-3 divide-y">
                {d.top.map((row) => (
                  <li
                    key={row.question}
                    className="flex items-center justify-between gap-4 py-2.5"
                  >
                    <span className="text-sm text-pretty">{row.question}</span>
                    <span className="bg-brand-soft text-brand shrink-0 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums">
                      {row.count}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-muted-foreground mt-3 text-xs leading-relaxed text-pretty">
            {d.caption}
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
