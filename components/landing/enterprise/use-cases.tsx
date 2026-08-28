import Image from 'next/image';
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
 * stethoscope a la banque. Meme regle pour la photographie, dont le nom de
 * fichier derive de la cle.
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
 * Les photographies montrent des PERSONNES EN SITUATION, jamais un lieu
 * identifiable : une devanture de banque reelle sur cette page laisserait
 * entendre que cette banque est cliente. Toute photo portant une enseigne est
 * ecartee — voir public/enterprise/SOURCES.md.
 *
 * Les deux avertissements du bas sont des engagements, pas des mentions
 * decoratives : une banque qui lit « assistant IA » pense d'abord acces aux
 * comptes, un etablissement de sante pense conseil medical. Ils repondent a
 * ces craintes sous les cartes qui les provoquent, plutot que dans une FAQ que
 * la moitie des lecteurs n'atteindra pas.
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
              <article className="bg-card panel-interactive flex h-full flex-col overflow-hidden rounded-xl border">
                {/* Hauteur fixe : six cadrages differents aligneraient sinon
                    les titres a six hauteurs differentes. */}
                <div className="bg-muted relative h-40 shrink-0">
                  <Image
                    src={`/enterprise/sector-${item.key}.jpg`}
                    alt={item.photoAlt}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 352px, (min-width: 640px) 50vw, 100vw"
                  />
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <span className="bg-brand-soft text-brand flex size-10 items-center justify-center rounded-xl">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed text-pretty">
                    {item.body}
                  </p>
                </div>
              </article>
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
