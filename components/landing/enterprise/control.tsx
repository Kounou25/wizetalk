import { Check, SlidersHorizontal, Users } from 'lucide-react';

import { Reveal } from '@/components/reveal';
import type { Dictionary } from '@/lib/i18n';
import { Section, SectionHeading } from '../section';

/**
 * Gouvernance — ce que l'organisation garde en main.
 *
 * DEUX COLONNES PLUTOT QU'UNE LISTE, ET C'EST TOUT L'ENJEU
 *
 * Le brief demandait d'annoncer, dans une meme liste, les sources de
 * connaissance, le ton, les sujets autorises, les regles d'escalade et le
 * transfert humain. Or la premiere moitie se regle aujourd'hui depuis le
 * tableau de bord, et l'autre n'existe pas encore comme reglage produit : le
 * prompt systeme est fixe dans lib/rag.ts, et la table `bots` ne porte ni ton,
 * ni sujets, ni regles d'escalade.
 *
 * Les melanger aurait produit une liste dont la moitie serait tombee au
 * premier essai. Les separer transforme la meme information en methode de
 * travail : voila ce que vous reglez seul, voila ce que nous reglons ensemble.
 * C'est plus credible, et c'est vrai.
 *
 * A DEPLACER LE JOUR OU CE SERA LIVRE : une ligne passe de `setup` a `now`
 * quand le reglage correspondant existe dans le produit, pas avant.
 */
export function EnterpriseControl({ dict }: { dict: Dictionary }) {
  const t = dict.enterprise.control;

  return (
    <Section tone="muted">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        <Reveal>
          <div className="bg-card h-full rounded-2xl border p-6 md:p-7">
            <div className="flex items-center gap-2.5">
              <span className="bg-brand-soft text-brand flex size-8 items-center justify-center rounded-lg">
                <SlidersHorizontal className="size-4" aria-hidden />
              </span>
              <p className="font-semibold text-balance">{t.nowTitle}</p>
            </div>

            <ul className="mt-5 flex flex-col gap-3">
              {t.now.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm">
                  <Check className="text-brand mt-0.5 size-4 shrink-0" aria-hidden />
                  <span className="text-pretty">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={100}>
          {/* Bordure en tirets : la meme convention que les emplacements vides
              du tableau de bord. Elle dit « a definir », la ou une bordure
              pleine dirait « livre ». */}
          <div className="bg-card h-full rounded-2xl border border-dashed p-6 md:p-7">
            <div className="flex items-center gap-2.5">
              <span className="bg-muted text-muted-foreground flex size-8 items-center justify-center rounded-lg">
                <Users className="size-4" aria-hidden />
              </span>
              <p className="font-semibold text-balance">{t.setupTitle}</p>
            </div>

            <ul className="mt-5 flex flex-col gap-3">
              {t.setup.map((item) => (
                <li
                  key={item}
                  className="text-muted-foreground flex items-start gap-2.5 text-sm"
                >
                  <span
                    className="bg-muted-foreground/40 mt-2 size-1.5 shrink-0 rounded-full"
                    aria-hidden
                  />
                  <span className="text-pretty">{item}</span>
                </li>
              ))}
            </ul>

            <p className="text-muted-foreground mt-6 border-t pt-4 text-xs leading-relaxed text-pretty">
              {t.setupNote}
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
