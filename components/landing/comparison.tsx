import { Check, X } from 'lucide-react';
import { Reveal } from '@/components/reveal';
import type { Dictionary } from '@/lib/i18n';

/**
 * Tableau comparatif des approches.
 *
 * Remplace l'ancienne bande d'agitation : le tableau dit la meme chose — les
 * alternatives echouent chacune sur un point precis — mais il le montre au
 * lieu de l'affirmer, et le lecteur verifie d'un coup d'oeil.
 *
 * Seule bande sombre de la page : elle marque le creux du recit, et le retour
 * au clair juste apres fait office de soulagement.
 *
 * On ne compare pas des concurrents nommes, mais des APPROCHES. Nommer des
 * produits tiers obligerait a defendre chaque case, et la comparaison
 * vieillirait au premier changement de leur cote.
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

      <div className="relative mx-auto max-w-5xl px-6 py-24 md:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-widest text-sky-400 uppercase">
            {t.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance md:text-4xl">
            {t.title}
          </h2>
          <p className="mt-5 text-lg text-slate-400 text-pretty">{t.lead}</p>
        </Reveal>

        <Reveal className="mt-14">
          {/* Le tableau deborde sur mobile : il defile dans son propre cadre
              plutot que d'elargir la page entiere. */}
          <div className="overflow-x-auto rounded-2xl ring-1 ring-white/10">
            <table className="w-full min-w-[36rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th scope="col" className="px-5 py-4 text-left font-medium text-slate-400">
                    <span className="sr-only">Approche</span>
                  </th>
                  {t.columns.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="px-4 py-4 text-center text-xs font-semibold text-slate-300"
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
                            highlighted ? 'font-bold text-white' : 'font-medium text-slate-300'
                          }
                        >
                          {row.label}
                        </span>
                        <span className="mt-1 block max-w-xs text-xs font-normal text-slate-500">
                          {row.note}
                        </span>
                      </th>

                      {row.values.map((value, column) => (
                        <td key={column} className="px-4 py-4 text-center align-top">
                          {value ? (
                            <span
                              className="inline-flex size-6 items-center justify-center rounded-full bg-emerald-500/15"
                              /* Icone ET libelle masque : la couleur seule ne
                                 doit jamais porter l'information. */
                            >
                              <Check className="size-3.5 text-emerald-400" aria-hidden />
                              <span className="sr-only">oui</span>
                            </span>
                          ) : (
                            <span className="inline-flex size-6 items-center justify-center rounded-full bg-red-500/15">
                              <X className="size-3.5 text-red-400" aria-hidden />
                              <span className="sr-only">non</span>
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
