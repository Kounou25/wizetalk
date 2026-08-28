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
 * C'est la section qui vend l'offre Enterprise : un acheteur de banque ou
 * d'assurance n'achete pas une fonctionnalite, il achete un risque maitrise.
 * L'etape 03  le pilote sur perimetre controle  est la reponse a « ou est-ce
 * que ca s'arrete si les resultats ne suivent pas ». C'est aussi pourquoi la
 * page ne promet aucun chiffre ailleurs : le pilote est l'endroit ou le
 * chiffre se mesure, chez le client.
 *
 * L'image est `sticky` sur grand ecran : elle reste en vis-a-vis pendant que
 * les etapes defilent. Elle illustre une seance de travail, sans legende ni
 * nom  voir public/enterprise/SOURCES.md.
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
          {/* Le fil s'arrete a la derniere pastille, sinon il pend sous la
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

      <Reveal delay={180}>
        <div className="mt-14 border-t pt-10">
          <p className="text-center text-lg font-medium text-balance">
            {dict.enterprise.scale.payoff}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {dict.enterprise.scale.items.map((item) => (
              <span
                key={item}
                className="bg-card text-muted-foreground rounded-full border px-3 py-1.5 text-xs"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </Reveal>

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
