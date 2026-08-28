import {
  Building2,
  GraduationCap,
  Landmark,
  Info,
  ShieldCheck,
  Signal,
  Stethoscope,
} from 'lucide-react';

import { Reveal } from '@/components/reveal';
import type { Dictionary } from '@/lib/i18n';
import { Section, SectionHeading } from '../section';

/**
 * Les secteurs vises.
 *
 * L'icone est choisie par cle metier, pas par position dans le tableau :
 * reordonner les cartes dans le dictionnaire ne doit pas donner un
 * stethoscope a la banque.
 */
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  banking: Landmark,
  insurance: ShieldCheck,
  telecom: Signal,
  education: GraduationCap,
  healthcare: Stethoscope,
  enterprise: Building2,
};

/**
 * Cartes sectorielles.
 *
 * LES DEUX AVERTISSEMENTS EN BAS SONT DES ENGAGEMENTS, PAS DES MENTIONS
 * LEGALES DECORATIVES
 *
 * Une banque qui lit « assistant IA » pense d'abord acces aux comptes ; un
 * etablissement de sante pense conseil medical. Les deux lignes repondent a
 * ces deux craintes a l'endroit exact ou elles naissent — sous les cartes qui
 * les provoquent — plutot que dans une FAQ que la moitie des lecteurs
 * n'atteindra pas.
 */
export function EnterpriseUseCases({ dict }: { dict: Dictionary }) {
  const t = dict.enterprise.useCases;

  return (
    <Section id="cas-usage">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {t.items.map((item, index) => {
          const Icon = ICONS[item.key] ?? Building2;

          return (
            <Reveal key={item.key} delay={index * 70}>
              <div className="bg-card panel-interactive h-full rounded-xl border p-6">
                <span className="bg-brand-soft text-brand flex size-10 items-center justify-center rounded-xl">
                  <Icon className="size-5" />
                </span>
                <p className="mt-4 text-lg font-semibold">{item.title}</p>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed text-pretty">
                  {item.body}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={200}>
        <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-2.5">
          {t.disclaimers.map((line) => (
            <p
              key={line}
              className="text-muted-foreground flex items-start gap-2.5 text-xs leading-relaxed text-pretty"
            >
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              {line}
            </p>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
