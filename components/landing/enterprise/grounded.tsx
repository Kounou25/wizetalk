import { Check } from 'lucide-react';

import { Reveal } from '@/components/reveal';
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
 * Fiabilite des reponses  la section decisive de la page.
 *
 * Aucune promesse d'exactitude, aucun « zero hallucination » : une garantie
 * pareille n'existe pas, et l'ecrire ferait douter du reste de la page. Ce qui
 * est affirme ici est livre et verifiable  sources choisies par le client,
 * provenance affichee, et refus de repondre sous le seuil de similarite (voir
 * `minCosine` dans lib/search.ts).
 */
export function EnterpriseGrounded({ dict }: { dict: Dictionary }) {
  const t = dict.enterprise.grounded;

  return (
    <Section>
      <div className={splitGrid}>
        <div className={splitMain}>
          <SectionHeading
            eyebrow={t.eyebrow}
            title={t.title}
            lead={t.lead}
            align="left"
          />

          <Reveal delay={120}>
            <p className="text-muted-foreground border-brand/30 mt-8 border-l-2 pl-4 text-sm leading-relaxed text-pretty">
              {t.note}
            </p>
          </Reveal>
        </div>

        <div className={cn(splitAside, 'grid gap-6 sm:grid-cols-2')}>
          {t.points.map((point, index) => (
            <Reveal key={point.title} delay={index * 80}>
              <div className="bg-card h-full rounded-xl border p-5">
                <span className="bg-brand-soft text-brand flex size-8 items-center justify-center rounded-lg">
                  <Check className="size-4" aria-hidden />
                </span>
                <p className="mt-3.5 font-semibold text-balance">{point.title}</p>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed text-pretty">
                  {point.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
