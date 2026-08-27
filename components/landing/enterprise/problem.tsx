import { ArrowRight, ChevronRight } from 'lucide-react';

import { Reveal } from '@/components/reveal';
import type { Dictionary } from '@/lib/i18n';
import { Section, SectionHeading } from '../section';

/**
 * Le probleme, vu du visiteur puis vu de l'organisation.
 *
 * L'ordre compte. Le parcours que subit le visiteur est montre d'abord, sous
 * forme de chaine : c'est ce que le lecteur reconnait immediatement pour
 * l'avoir vecu ailleurs. Les consequences ne viennent qu'ensuite, parce
 * qu'elles ne coutent quelque chose que si l'on a d'abord accepte le parcours.
 *
 * Aucun chiffre. Un « 68 % des visiteurs abandonnent » non source serait la
 * ligne la plus attaquable de la page, et la premiere qu'un acheteur
 * demanderait a justifier.
 */
export function EnterpriseProblem({ dict }: { dict: Dictionary }) {
  const t = dict.enterprise.problem;

  return (
    <Section id="probleme-enterprise">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

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

      <Reveal delay={120}>
        <p className="text-muted-foreground mt-12 text-center text-sm font-semibold tracking-widest uppercase">
          {t.costsTitle}
        </p>
      </Reveal>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {t.costs.map((cost, index) => (
          <Reveal key={cost.title} delay={140 + index * 70}>
            <div className="bg-card h-full rounded-xl border p-5">
              <p className="font-semibold">{cost.title}</p>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed text-pretty">
                {cost.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={200}>
        <p className="mx-auto mt-12 flex max-w-2xl items-start justify-center gap-2.5 text-center text-lg font-medium text-balance">
          <ArrowRight className="text-brand mt-1.5 size-5 shrink-0" aria-hidden />
          {t.payoff}
        </p>
      </Reveal>
    </Section>
  );
}
