import { Check, Minus, X } from 'lucide-react';

import { Reveal } from '@/components/reveal';
import type { Dictionary } from '@/lib/i18n';

type Cell = boolean | 'partial';

/**
 * Tableau comparatif des approches.
 *
 * On ne compare pas des concurrents nommes, mais des APPROCHES. Nommer des
 * produits tiers obligerait a defendre chaque case, et la comparaison
 * vieillirait au premier changement de leur cote.
 *
 * L'etat `partial` existe pour rester juste : un robot a scenarios utilise
 * bien votre contenu, mais seulement celui que vous avez saisi a la main. Tout
 * ramener a oui/non forcerait a mentir dans un sens ou dans l'autre — et une
 * comparaison ou le produit maison coche tout, seul, se lit comme une
 * publicite, pas comme un argument.
 *
 * Seule bande sombre de la page : elle marque le creux du recit, et le retour
 * au clair juste apres fait office de soulagement.
 */
export function Comparison({ dict }: { dict: Dictionary }) {
  const t = dict.comparison;

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div
        aria-hidden
        className="bg-grid-dark pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000,transparent)]"
      />
      <div
        aria-hidden
        className="animate-float pointer-events-none absolute -top-32 right-1/4 size-[32rem] rounded-full bg-sky-500/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-5xl px-6 py-20 md:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-widest text-sky-400 uppercase">
            {t.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance md:text-4xl">
            {t.title}
          </h2>
          <p className="mt-5 text-lg text-slate-400 text-pretty">{t.lead}</p>
        </Reveal>

        {/* Au-dela de `md`, le tableau : cinq colonnes se comparent d'un coup
            d'oeil. En dessous, il deviendrait un ruban a faire defiler, donc
            on bascule sur des cartes — meme information, lecture verticale. */}
        <Reveal className="mt-14 hidden md:block">
          <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th scope="col" className="px-5 py-4 text-left font-medium text-slate-400">
                    <span className="sr-only">Approche</span>
                  </th>
                  {t.columns.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="px-3 py-4 text-center text-xs font-semibold text-slate-300"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {t.rows.map((row, index) => {
                  const highlighted = index === t.highlightRow;

                  return (
                    <tr
                      key={row.label}
                      className={
                        highlighted
                          ? 'bg-brand/10 border-t border-white/10'
                          : 'border-t border-white/10'
                      }
                    >
                      <th scope="row" className="px-5 py-4 text-left align-top">
                        <span
                          className={
                            highlighted
                              ? 'font-bold text-white'
                              : 'font-medium text-slate-300'
                          }
                        >
                          {row.label}
                        </span>
                        <span className="mt-1 block max-w-xs text-xs font-normal text-slate-500">
                          {row.note}
                        </span>
                      </th>

                      {row.values.map((value, column) => (
                        <td key={column} className="px-3 py-4 text-center align-top">
                          <Mark value={value as Cell} legend={t.legend} />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Reveal>

        <div className="mt-12 flex flex-col gap-4 md:hidden">
          {t.rows.map((row, index) => {
            const highlighted = index === t.highlightRow;

            return (
              <Reveal key={row.label} delay={index * 60}>
                <div
                  className={`rounded-2xl p-5 ring-1 ${
                    highlighted ? 'bg-brand/10 ring-brand/40' : 'bg-white/[0.03] ring-white/10'
                  }`}
                >
                  <p
                    className={
                      highlighted ? 'font-bold text-white' : 'font-medium text-slate-200'
                    }
                  >
                    {row.label}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{row.note}</p>

                  <ul className="mt-4 flex flex-col gap-2">
                    {row.values.map((value, column) => (
                      <li key={column} className="flex items-center gap-2.5 text-sm">
                        <Mark value={value as Cell} legend={t.legend} />
                        <span className="text-slate-300">{t.columns[column]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/**
 * Marque d'une case. Icone, forme et libelle masque varient ensemble : la
 * couleur seule ne doit jamais porter l'information.
 */
function Mark({
  value,
  legend,
}: {
  value: Cell;
  legend: { yes: string; partial: string; no: string };
}) {
  if (value === 'partial') {
    return (
      <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
        <Minus className="size-3.5 text-amber-400" aria-hidden />
        <span className="sr-only">{legend.partial}</span>
      </span>
    );
  }

  if (value) {
    return (
      <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
        <Check className="size-3.5 text-emerald-400" aria-hidden />
        <span className="sr-only">{legend.yes}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-red-500/15">
      <X className="size-3.5 text-red-400" aria-hidden />
      <span className="sr-only">{legend.no}</span>
    </span>
  );
}
