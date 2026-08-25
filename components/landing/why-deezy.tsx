import { Building2, Mail, Search, ShieldCheck } from 'lucide-react';

import { Reveal } from '@/components/reveal';
import { Spotlight } from '@/components/spotlight';
import type { Dictionary } from '@/lib/i18n';
import { Section, SectionHeading } from './section';

const ICONS = [Building2, ShieldCheck, Mail, Search];

/**
 * Les quatre raisons de choisir Deezy plutot qu'un assistant generique.
 *
 * Elles arrivent apres la demonstration, jamais avant : une liste d'avantages
 * lue avant d'avoir vu le produit ne vaut que ce que vaut la confiance du
 * lecteur — c'est-a-dire rien, a ce stade de la page.
 */
export function WhyDeezy({ dict }: { dict: Dictionary }) {
  const t = dict.why;

  return (
    <Section>
      <SectionHeading eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

      <div className="mt-14 grid gap-5 sm:grid-cols-2">
        {t.cards.map((card, index) => {
          const Icon = ICONS[index % ICONS.length] ?? Building2;

          return (
            <Reveal key={card.title} delay={(index % 2) * 90}>
              <Spotlight className="group hover:ring-brand/25 h-full rounded-2xl p-6 ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg md:p-7 dark:ring-white/10">
                <span className="bg-brand-soft text-brand flex size-11 shrink-0 items-center justify-center rounded-xl">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-balance">{card.title}</h3>
                <p className="text-muted-foreground mt-2.5 text-sm leading-relaxed text-pretty">
                  {card.body}
                </p>
              </Spotlight>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
