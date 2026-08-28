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
 * POURQUOI CES PHOTOGRAPHIES ONT MIS DU TEMPS A EXISTER
 *
 * Une premiere recherche avait ete abandonnee : les photos de banque, de
 * telecom et d'universite disponibles montraient presque toutes une enseigne
 * reelle — HSBC, ING, Ecobank, BBVA, Leeds Beckett University. Sur une page
 * qui s'adresse aux banques, une devanture HSBC laisserait entendre que HSBC
 * est cliente de Deezy : exactement le genre d'affirmation que le reste de la
 * page se refuse a faire.
 *
 * Les six retenues montrent donc des PERSONNES EN SITUATION, jamais un lieu
 * identifiable : quelqu'un consulte un dossier, deux collegues regardent un
 * telephone, des eleves rejoignent leur etablissement. Aucune enseigne, aucun
 * logo, aucune legende qui pretendrait a une relation client.
 *
 * L'ICONE RESTE, SOUS LA PHOTO
 *
 * Elle survit a un fichier manquant, elle porte la couleur de marque, et elle
 * donne a la grille une regularite que six photographies d'origines
 * differentes n'auraient pas produite seules.
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
              <article className="bg-card panel-interactive flex h-full flex-col overflow-hidden rounded-xl border">
                {/* Hauteur fixe : six cadrages differents aligneraient sinon
                    leurs titres a six hauteurs differentes, et la grille
                    perdrait la regularite qui la rend lisible d'un coup. */}
                <div className="bg-muted relative h-40 shrink-0">
                  <Image
                    src={`/enterprise/sector-${item.key}.jpg`}
                    alt={item.photoAlt}
                    fill
                    className="object-cover"
                    // Trois colonnes au-dela de lg, deux a partir de sm, une
                    // seule en dessous : sans cette indication, le navigateur
                    // telecharge la variante pleine largeur sur un telephone.
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
