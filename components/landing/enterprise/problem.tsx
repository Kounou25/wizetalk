import Image from 'next/image';
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
 *
 * LA PHOTOGRAPHIE PORTE CE QUE LE TEXTE NE PEUT PAS DIRE
 *
 * Le reste de la section est une mecanique : une chaine d'etapes, quatre
 * consequences. Elle explique le probleme, elle ne le fait pas ressentir. La
 * bande photographique remet la personne au debut du raisonnement — c'est
 * quelqu'un qui cherche une reponse sur son telephone, pas un « visiteur ».
 *
 * Elle illustre un CLIENT du lecteur, jamais un client de Deezy : aucune
 * legende, aucun nom, aucune marque d'entreprise identifiable a l'image.
 * Voir public/enterprise/SOURCES.md.
 */
export function EnterpriseProblem({ dict }: { dict: Dictionary }) {
  const t = dict.enterprise.problem;

  return (
    <Section id="probleme-enterprise">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

      <Reveal delay={60}>
        {/* Bande large plutot que vignette : a cette place, l'image ouvre la
            section, elle ne la decore pas. Le degrade en pied fond la photo
            dans la page au lieu de la poser dessus comme un autocollant. */}
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

      {/*
        Les quatre cartes « ce que cela produit » ont ete retirees : elles
        redisaient la chaine ci-dessus en la commentant. Frustration, abandon,
        demandes repetitives et opportunites perdues sont ce que le lecteur
        DEDUIT en lisant les cinq etapes — le lui expliquer ensuite le prenait
        pour un lecteur distrait, et ajoutait une rangee de blocs a une page
        deja trop longue. Les textes restent dans le dictionnaire.
      */}
      <Reveal delay={200}>
        <p className="mx-auto mt-12 flex max-w-2xl items-start justify-center gap-2.5 text-center text-lg font-medium text-balance">
          <ArrowRight className="text-brand mt-1.5 size-5 shrink-0" aria-hidden />
          {t.payoff}
        </p>
      </Reveal>
    </Section>
  );
}
