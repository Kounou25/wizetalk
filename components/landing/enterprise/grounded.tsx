import { Check } from 'lucide-react';

import { Reveal } from '@/components/reveal';
import type { Dictionary } from '@/lib/i18n';
import { Section, SectionHeading } from '../section';

/**
 * Fiabilite des reponses — la section decisive de la page.
 *
 * CE QU'ELLE NE DIT PAS, ET POURQUOI
 *
 * Aucune promesse d'exactitude, aucun « zero hallucination ». Une organisation
 * qui evalue serieusement un assistant sait qu'une telle garantie n'existe
 * pas ; l'ecrire ferait douter de tout le reste de la page.
 *
 * Ce qui est affirme ici est verifiable et deja livre : les sources sont
 * choisies par le client, la reponse affiche sa provenance, et sous le seuil
 * de similarite l'assistant refuse de repondre au lieu d'improviser (voir
 * `minCosine` dans lib/search.ts et le refus dans lib/rag.ts).
 *
 * La note finale assume la limite a voix haute. C'est le passage que relira un
 * responsable conformite, et le seul endroit de la page ou reconnaitre une
 * limite rapporte plus que la masquer.
 */
export function EnterpriseGrounded({ dict }: { dict: Dictionary }) {
  const t = dict.enterprise.grounded;

  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
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

        <div className="grid gap-4 sm:grid-cols-2">
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
