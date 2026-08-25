import {
  Clock,
  FileText,
  Globe,
  Link2,
  Mail,
  Sparkles,
  Zap,
} from 'lucide-react';

import { Reveal } from '@/components/reveal';
import type { Dictionary } from '@/lib/i18n';
import { Section, SectionHeading } from './section';

/** Un pictogramme par capacite, dans l'ordre du dictionnaire. */
const ICONS = [Sparkles, FileText, Zap, Globe, Clock, Mail, Link2];

/**
 * Le basculement : de ce que le visiteur perd a ce que Deezy change.
 *
 * Sept capacites presentees a plat, sans hierarchie ni numerotation : c'est un
 * inventaire, pas une methode. Le detail de chacune viendra plus bas, quand le
 * lecteur aura decide qu'il veut savoir.
 */
export function Change({ dict }: { dict: Dictionary }) {
  const t = dict.change;

  return (
    <Section id="fonctionnement" tone="muted">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

      <div className="mt-14 grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
        {t.items.map((item, index) => {
          const Icon = ICONS[index % ICONS.length] ?? Sparkles;

          return (
            <Reveal key={item.title} delay={(index % 3) * 70} className="flex gap-3.5">
              <span className="bg-background text-brand ring-brand/10 flex size-10 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1">
                <Icon className="size-4.5" aria-hidden />
              </span>
              <div className="min-w-0">
                <h3 className="font-semibold text-balance">{item.title}</h3>
                <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed text-pretty">
                  {item.body}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
