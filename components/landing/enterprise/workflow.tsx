import Image from 'next/image';

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
import { EnterpriseCta } from './cta';

/**
 * Le deroule d'un deploiement, en cinq etapes.
 *
 * C'est la section qui vend reellement l'offre Enterprise.
 *
 * Un acheteur de banque ou d'assurance n'achete pas une fonctionnalite, il
 * achete un risque maitrise : il doit pouvoir expliquer en comite comment le
 * projet se deroule, ou il s'arrete si les resultats ne suivent pas, et ce
 * qu'il aura vu avant de s'engager plus loin. L'etape 03 — le pilote sur
 * perimetre controle — est la reponse a cette question, et c'est la raison
 * pour laquelle la page ne promet aucun chiffre ailleurs : le pilote est
 * l'endroit ou le chiffre se mesure, chez lui.
 *
 * DEUX COLONNES, ET UNE PHOTOGRAPHIE PLUTOT QU'UN PICTOGRAMME
 *
 * Ces cinq etapes decrivent du travail fait par des gens : un cadrage, un
 * atelier, une revue de conversations. Une colonne de texte seule les faisait
 * lire comme les conditions generales d'un contrat. La photographie dit ce que
 * la liste ne dit pas — qu'il y a quelqu'un en face, et que le deploiement est
 * accompagne, ce qui est precisement ce qu'achete une grande organisation.
 *
 * L'image est `sticky` sur grand ecran : elle reste en vis-a-vis pendant que
 * les etapes defilent, au lieu de disparaitre des la deuxieme.
 *
 * Elle illustre une seance de travail, sans legende ni nom : ce ne sont ni des
 * employes de Deezy ni des clients identifies. Voir
 * public/enterprise/SOURCES.md.
 */
export function EnterpriseWorkflow({ dict }: { dict: Dictionary }) {
  const t = dict.enterprise.workflow;

  return (
    <Section tone="muted">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

      <div className={cn(splitGrid, 'mt-14')}>
        <Reveal className={splitMain}>
          <div className="relative h-72 overflow-hidden rounded-2xl sm:h-96 lg:sticky lg:top-28 lg:h-[30rem]">
            <Image
              src="/enterprise/working-session.jpg"
              alt={t.photoAlt}
              fill
              className="object-cover"
              sizes="(min-width: 1152px) 440px, (min-width: 1024px) 40vw, 100vw"
            />
          </div>
        </Reveal>

        <ol className={cn(splitAside, 'relative')}>
          {/* Le fil : il s'arrete a la derniere pastille, sinon il pend sous la
              liste comme une etape manquante. */}
          <span
            className="bg-border absolute top-5 bottom-5 left-[19px] w-px md:left-[23px]"
            aria-hidden
          />

          {t.steps.map((step, index) => (
            <li key={step.index} className="relative pb-8 last:pb-0">
              <Reveal delay={index * 80}>
                <div className="flex gap-5">
                  <span className="bg-brand text-brand-foreground relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold md:size-12 md:text-sm">
                    {step.index}
                  </span>
                  <div className="pt-1.5 md:pt-2.5">
                    <p className="text-lg font-semibold">{step.title}</p>
                    <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed text-pretty">
                      {step.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>

      <Reveal delay={200}>
        <div className="mt-12 flex justify-center">
          {/* Apres le workflow, c'est l'echange commercial qui prime : le
              lecteur veut parler du sien, pas voir une demo generique. */}
          <EnterpriseCta
            size="default"
            demoLabel={dict.enterprise.hero.ctaPrimary}
            contactLabel={t.cta}
            lead="contact"
          />
        </div>
      </Reveal>
    </Section>
  );
}
