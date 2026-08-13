import { Clock, FileText, MousePointerClick, Search } from 'lucide-react';
import { Reveal } from '@/components/reveal';
import { Spotlight } from '@/components/spotlight';
import type { Dictionary } from '@/lib/i18n';

/** Les icones restent ici : elles ne se traduisent pas, l'ordre les apparie. */
const ICONS = [Search, MousePointerClick, Clock, FileText];

export function Problem({ dict }: { dict: Dictionary }) {
  return (
    <section id="probleme" className="mx-auto max-w-6xl px-6 py-24 md:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
          {dict.problem.eyebrow}
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance md:text-5xl">
          {dict.problem.title}
        </h2>
        <p className="text-muted-foreground mt-5 text-lg text-pretty">{dict.problem.lead}</p>
      </Reveal>

      <div className="mt-14 grid gap-5 md:grid-cols-2">
        {dict.problem.items.map((pain, index) => {
          const Icon = ICONS[index % ICONS.length] ?? Search;

          return (
            <Reveal key={pain.title} delay={(index % 2) * 90}>
              <Spotlight className="group hover:ring-brand/25 h-full rounded-2xl p-6 ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg md:p-8 dark:ring-white/10">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground/25 group-hover:text-brand/40 font-mono text-4xl leading-none font-bold tabular-nums transition-colors">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="bg-muted text-muted-foreground group-hover:bg-brand-soft group-hover:text-brand flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors">
                    <Icon className="size-5" aria-hidden />
                  </span>
                </div>

                <h3 className="mt-6 text-lg font-semibold text-balance">{pain.title}</h3>
                <p className="text-muted-foreground mt-2.5 text-sm leading-relaxed text-pretty">
                  {pain.body}
                </p>
              </Spotlight>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
