import { ArrowDown } from 'lucide-react';
import { Reveal } from '@/components/reveal';
import type { Dictionary } from '@/lib/i18n';

/**
 * Section d'agitation, entre le probleme et la solution.
 *
 * Seule bande sombre de la page : la rupture de contraste marque le creux du
 * recit, et le retour au clair juste apres fait office de soulagement.
 * La persuasion passe ici par la precision, pas par l'emphase — chaque
 * alternative est nommee, avec ce qui se produit reellement.
 */
export function Frustration({ dict }: { dict: Dictionary }) {
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

      <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal className="max-w-3xl">
          <p className="text-sm font-semibold tracking-widest text-sky-400 uppercase">
            {dict.frustration.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance md:text-5xl md:leading-[1.1]">
            {dict.frustration.title}
          </h2>
          <p className="mt-5 text-lg text-slate-400 text-pretty">{dict.frustration.lead}</p>
        </Reveal>

        <ul className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-2">
          {dict.frustration.attempts.map((attempt) => (
            <li
              key={attempt.label}
              className="bg-slate-950 p-6 transition-colors hover:bg-slate-900 md:p-8"
            >
              <p className="flex items-center gap-2.5 font-medium text-slate-300">
                <span
                  className="flex size-5 shrink-0 items-center justify-center rounded-full bg-red-500/15"
                  aria-hidden
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgb(248 113 113)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </span>
                {attempt.label}
              </p>
              <p className="mt-3 pl-[1.9rem] text-sm leading-relaxed text-slate-400 text-pretty">
                {attempt.reality}
              </p>
            </li>
          ))}
        </ul>

        <Reveal className="mt-14 flex flex-col items-center text-center">
          <p className="max-w-xl text-xl font-semibold text-balance md:text-2xl">
            {dict.frustration.pivotStart}
            <br />
            <span className="text-slate-400">{dict.frustration.pivotEnd}</span>
          </p>
          <ArrowDown className="mt-8 size-5 animate-bounce text-sky-400" aria-hidden />
        </Reveal>
      </div>
    </section>
  );
}
