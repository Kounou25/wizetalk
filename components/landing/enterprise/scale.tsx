import { Layers } from 'lucide-react';

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
 * Passage a l'echelle.
 *
 * VOLONTAIREMENT COURTE
 *
 * Le brief demandait de ne pas la surcharger de details techniques, et c'est
 * aussi ce que la prudence impose : plusieurs assistants et plusieurs sites
 * sont livres — les plafonds par palier existent — mais « plusieurs equipes »
 * suppose des organisations et des roles, et la table `bots` ne porte qu'un
 * seul proprietaire.
 *
 * Six mots poses cote a cote disent la direction sans rien promettre sur le
 * mecanisme. Detailler aurait oblige a decrire une gestion d'equipes qui
 * n'existe pas ; la phrase de conclusion ramene, elle, au deploiement
 * progressif decrit juste apres par le workflow.
 */
export function EnterpriseScale({ dict }: { dict: Dictionary }) {
  const t = dict.enterprise.scale;

  return (
    <Section>
      <div className={cn(splitGrid, 'items-center')}>
        <div className={splitMain}>
          <SectionHeading
            eyebrow={t.eyebrow}
            title={t.title}
            lead={t.lead}
            align="left"
          />

          <Reveal delay={120}>
            <p className="mt-7 text-lg font-medium text-pretty">{t.payoff}</p>
          </Reveal>
        </div>

        <Reveal delay={150} className={splitAside}>
          <div className="bg-card rounded-2xl border p-6 md:p-8">
            <span className="bg-brand-soft text-brand flex size-10 items-center justify-center rounded-xl">
              <Layers className="size-5" aria-hidden />
            </span>

            <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {t.items.map((item) => (
                <span
                  key={item}
                  className="bg-muted/50 rounded-lg border px-3.5 py-2.5 text-sm font-medium"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
