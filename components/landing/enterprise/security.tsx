import { Lock } from 'lucide-react';

import { Reveal } from '@/components/reveal';
import type { Dictionary } from '@/lib/i18n';
import { Section, SectionHeading } from '../section';

/**
 * Securite et confidentialite.
 *
 * AUCUN BADGE DE CONFORMITE, ET LA NOTE LE DIT
 *
 * C'est la section ou la tentation d'aligner SOC 2, ISO 27001, RGPD et PCI DSS
 * est la plus forte, et ou le mensonge coute le plus cher : la premiere
 * organisation qui demande l'attestation decouvre qu'elle n'existe pas, et
 * l'affaire s'arrete la — avec un souvenir durable.
 *
 * Ce qui est affirme ici tient a l'architecture du produit, pas a un audit :
 * l'assistant public ne connait que les contenus indexes, il n'a aucun acces
 * aux systemes du client, et le perimetre indexe est decide par le client. Ces
 * trois faits sont verifiables dans le code et suffisent a repondre a la
 * crainte reelle du lecteur.
 *
 * La note transforme l'absence de certification en position : nous ne
 * revendiquons rien que nous n'ayons. C'est la seule phrase de la page qu'un
 * concurrent ne peut pas recopier sans risque.
 *
 * NE PAS AJOUTER DE BADGE ICI SANS L'ATTESTATION CORRESPONDANTE EN MAIN.
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
