import Image from 'next/image';
import { ArrowRight, ChevronRight } from 'lucide-react';

import { Reveal } from '@/components/reveal';
import type { Dictionary } from '@/lib/i18n';
import { Section, SectionHeading } from '../section';

/**
 * Le probleme, vu du visiteur puis vu de l'organisation.
 *
 * Le parcours subi est montre en chaine : c'est ce que le lecteur reconnait
 * pour l'avoir vecu ailleurs.
 *
 * Aucun chiffre. Un « 68 % des visiteurs abandonnent » non source serait la
 * ligne la plus attaquable de la page.
 */
export function EnterpriseProblem({ dict }: { dict: Dictionary }) {
  const t = dict.enterprise.problem;

  return (
    <Section id="probleme-enterprise">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

      <Reveal delay={60}>
        <div className="relative mt-12 h-48 overflow-hidden rounded-2xl sm:h-60 md:h-72">
          <Image
            src="/enterprise/customer-question.jpg"
            alt={t.photoAlt}
            fill
            className="object-cover"
            sizes="(min-width: 1152px) 1104px, 100vw"
          />
          <div
            aria-hidden
            className="from-background/70 absolute inset-0 bg-gradient-to-t via-transparent to-transparent"
          />
        </div>
      </Reveal>

      {/* La chaine des etapes : chaque maillon est une occasion d'abandonner. */}
      <Reveal delay={80}>
        <ol className="mt-12 flex flex-wrap items-center justify-center gap-x-1 gap-y-3">
          {t.steps.map((step, index) => (
            <li key={step} className="flex items-center gap-1">
              <span className="bg-card text-muted-foreground rounded-full border px-4 py-2 text-sm">
                {step}
              </span>
              {index < t.steps.length - 1 && (
                <ChevronRight
                  className="text-muted-foreground/40 size-4 shrink-0"
                  aria-hidden
                />
              )}
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal delay={200}>
        <p className="mx-auto mt-12 flex max-w-2xl items-start justify-center gap-2.5 text-center text-lg font-medium text-balance">
          <ArrowRight className="text-brand mt-1.5 size-5 shrink-0" aria-hidden />
          {t.payoff}
        </p>
      </Reveal>
    </Section>
  );
}
