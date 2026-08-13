import { Check } from 'lucide-react';
import { Reveal } from '@/components/reveal';
import { Spotlight } from '@/components/spotlight';
import type { Dictionary } from '@/lib/i18n';
import { DashboardPreview } from './dashboard-preview';

export function Solution({ dict }: { dict: Dictionary }) {
  const mocks = [
    <MockInput key="input" />,
    <MockAnalysis key="analysis" lines={dict.solution.analysis} />,
    <MockSnippet key="snippet" />,
  ];

  return (
    <section id="solution" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
          {dict.solution.eyebrow}
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance md:text-5xl">
          {dict.solution.title}
        </h2>
        <p className="text-muted-foreground mt-5 text-lg text-pretty">{dict.solution.lead}</p>
      </Reveal>

      <ol className="mt-16 grid gap-6 md:grid-cols-3">
        {dict.solution.steps.map((step, index) => (
          <Step key={step.title} index={index + 1} title={step.title} body={step.body}>
            {mocks[index]}
          </Step>
        ))}
      </ol>

      <Reveal className="mt-20">
        <DashboardPreview dict={dict} />
      </Reveal>
    </section>
  );
}

function Step({
  index,
  title,
  body,
  children,
}: {
  index: number;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Reveal delay={(index - 1) * 110}>
        <Spotlight className="bg-card hover:ring-brand/25 flex h-full flex-col rounded-2xl p-6 shadow-sm ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg md:p-7 dark:ring-white/10">
          <div className="flex items-center gap-3">
            <span className="bg-brand text-brand-foreground inline-flex size-8 items-center justify-center rounded-lg font-mono text-sm font-bold tabular-nums">
              {String(index).padStart(2, '0')}
            </span>
            <h3 className="font-semibold">{title}</h3>
          </div>

          <p className="text-muted-foreground mt-4 flex-1 text-sm leading-relaxed text-pretty">
            {body}
          </p>

          <div className="mt-6">{children}</div>
        </Spotlight>
      </Reveal>
    </li>
  );
}

/* --- Petites maquettes, une par etape ------------------------------------ */
/* Statiques et purement illustratives : elles rendent l'etape concrete
   sans promettre une demo interactive.                                      */

function MockInput() {
  return (
    <div className="bg-muted/60 flex items-center gap-2 rounded-lg border px-3 py-2.5">
      <span className="text-muted-foreground text-xs">https://</span>
      <span className="text-sm font-medium">monentreprise.com</span>
      <span className="bg-brand ml-auto inline-block h-4 w-px animate-pulse" aria-hidden />
    </div>
  );
}

function MockAnalysis({ lines }: { lines: string[] }) {
  return (
    <div className="bg-muted/60 flex flex-col gap-2 rounded-lg border p-3">
      {lines.map((label, index) => (
        <p key={label} className="flex items-center gap-2 text-xs">
          {index < lines.length - 1 ? (
            <Check className="text-brand size-3.5 shrink-0" aria-hidden />
          ) : (
            <span
              className="border-brand/40 border-t-brand size-3.5 shrink-0 animate-spin rounded-full border-2"
              aria-hidden
            />
          )}
          <span
            className={index < lines.length - 1 ? 'text-muted-foreground' : 'font-medium'}
          >
            {label}
          </span>
        </p>
      ))}
    </div>
  );
}

function MockSnippet() {
  return (
    <pre className="overflow-x-auto rounded-lg bg-slate-950 px-3 py-2.5 font-mono text-[11px] leading-relaxed">
      <code>
        <span className="text-slate-500">&lt;</span>
        <span className="text-sky-400">script</span>{' '}
        <span className="text-violet-300">src</span>
        <span className="text-slate-500">=</span>
        <span className="text-emerald-300">&quot;…&quot;</span>{' '}
        <span className="text-violet-300">data-bot</span>
        <span className="text-slate-500">=</span>
        <span className="text-emerald-300">&quot;…&quot;</span>
        <span className="text-slate-500">&gt;&lt;/</span>
        <span className="text-sky-400">script</span>
        <span className="text-slate-500">&gt;</span>
      </code>
    </pre>
  );
}
