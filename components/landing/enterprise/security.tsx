import { Lock } from 'lucide-react';

import { Reveal } from '@/components/reveal';
import type { Dictionary } from '@/lib/i18n';
import { Section, SectionHeading } from '../section';

/**
 * Securite et confidentialite.
 *
 * NE PAS AJOUTER DE BADGE DE CONFORMITE SANS L'ATTESTATION EN MAIN.
 *
 * SOC 2, ISO 27001, RGPD, PCI DSS : la premiere organisation qui demande
 * l'attestation decouvrirait qu'elle n'existe pas, et l'affaire s'arreterait
 * la. Ce qui est affirme ici tient a l'architecture  l'assistant public ne
 * connait que les contenus indexes, le perimetre est decide par le client —
 * et se verifie dans le code.
 */
export function EnterpriseSecurity({ dict }: { dict: Dictionary }) {
  const t = dict.enterprise.security;

  return (
    <Section id="securite" tone="dark">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} lead={t.lead} tone="dark" />

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {t.points.map((point, index) => (
          <Reveal key={point.title} delay={index * 70}>
            <div className="h-full rounded-xl border border-white/10 bg-white/5 p-5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-white/10">
                <Lock className="size-4" aria-hidden />
              </span>
              <p className="mt-3.5 font-semibold text-balance">{point.title}</p>
              <p className="text-background/70 mt-2 text-sm leading-relaxed text-pretty">
                {point.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={220}>
        <p className="text-background/70 mx-auto mt-10 max-w-3xl border-t border-white/10 pt-6 text-center text-sm leading-relaxed text-pretty">
          {t.note}
        </p>
      </Reveal>
    </Section>
  );
}
