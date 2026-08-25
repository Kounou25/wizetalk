import { Clock, Eye, Languages, Layers, Lock, Palette } from 'lucide-react';

import { Reveal } from '@/components/reveal';
import { Spotlight } from '@/components/spotlight';
import type { Dictionary } from '@/lib/i18n';
import { Section, SectionHeading } from './section';

const ICONS = [Clock, Languages, Palette, Layers, Eye, Lock];

/**
 * Les benefices d'usage, places tard dans la page.
 *
 * A ce stade, le lecteur a deja decide si le produit l'interesse. Cette
 * section repond a la question suivante — « et concretement, qu'est-ce que ca
 * donne chez moi ? » — sans avoir a reconvaincre.
 */
export function Benefits({ dict }: { dict: Dictionary }) {
  const t = dict.benefits;

  return (
    <Section>
      <SectionHeading eyebrow={t.eyebrow} title={t.title} />

      <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {t.items.map((item, index) => {
          const Icon = ICONS[index % ICONS.length] ?? Clock;

          return (
            <Reveal key={item.title} delay={(index % 3) * 80}>
              <Spotlight className="hover:ring-brand/25 h-full rounded-2xl p-6 ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:ring-white/10">
                <span className="bg-brand-soft text-brand flex size-10 items-center justify-center rounded-xl">
                  <Icon className="size-4.5" aria-hidden />
                </span>
                <h3 className="mt-4 font-semibold text-balance">{item.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed text-pretty">
                  {item.body}
                </p>
              </Spotlight>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
