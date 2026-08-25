import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';
import { PUBLIC_APP_URL } from '@/lib/public-url';
import type { Dictionary, Locale } from '@/lib/i18n';
import { Section, SectionHeading } from './section';

/**
 * La mise en route, en trois etapes.
 *
 * Le message a faire passer est « c'est facile », pas « voici la
 * documentation ». D'ou une seule ligne de code montree, sans onglets par
 * plateforme ni options : le detail technique appartient au tableau de bord,
 * une fois le compte cree.
 */
export function Install({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.install;

  return (
    <Section id="installation">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

      <div className="mt-14 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <ol className="flex flex-col gap-7">
          {t.steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 90} className="flex gap-4">
              <span className="bg-brand-soft text-brand flex size-10 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold tabular-nums">
                {step.step}
              </span>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-balance">{step.title}</h3>
                <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed text-pretty">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={150}>
          <div className="overflow-hidden rounded-2xl bg-slate-950 shadow-xl ring-1 ring-white/10">
            {/* Barre de fenetre : elle signale « du code » en un coup d'oeil,
                sans qu'il faille lire quoi que ce soit. */}
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <span className="size-2.5 rounded-full bg-red-400/70" aria-hidden />
              <span className="size-2.5 rounded-full bg-amber-400/70" aria-hidden />
              <span className="size-2.5 rounded-full bg-emerald-400/70" aria-hidden />
              <p className="ml-2 truncate text-xs text-slate-400">{t.codeLabel}</p>
            </div>

            <pre className="overflow-x-auto px-4 py-5 font-mono text-[13px] leading-relaxed text-slate-300">
              <code>
                <span className="text-slate-500">&lt;</span>
                <span className="text-sky-400">script</span>{' '}
                <span className="text-violet-400">src</span>
                <span className="text-slate-500">=</span>
                <span className="text-emerald-400">&quot;{PUBLIC_APP_URL}/widget.js&quot;</span>
                {'\n        '}
                <span className="text-violet-400">data-bot</span>
                <span className="text-slate-500">=</span>
                <span className="text-emerald-400">&quot;votre-assistant&quot;</span>{' '}
                <span className="text-sky-400">defer</span>
                <span className="text-slate-500">&gt;&lt;/</span>
                <span className="text-sky-400">script</span>
                <span className="text-slate-500">&gt;</span>
              </code>
            </pre>
          </div>

          <div className="mt-7 text-center lg:text-left">
            <Button
              asChild
              size="lg"
              className="bg-brand hover:bg-brand/90 text-brand-foreground group h-12 px-6 text-base"
            >
              <Link href={`/${locale}/signup`}>
                {t.cta}
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
