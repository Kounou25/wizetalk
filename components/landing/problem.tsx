import Link from 'next/link';
import { ArrowRight, Clock, DoorOpen, EyeOff, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';
import { Spotlight } from '@/components/spotlight';
import type { Dictionary, Locale } from '@/lib/i18n';
import { Section, SectionHeading } from './section';

/** Les icones restent ici : elles ne se traduisent pas, l'ordre les apparie. */
const ICONS = [DoorOpen, Clock, Users, EyeOff];

export function Problem({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.problem;

  return (
    <Section id="probleme">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

      {/*
        Le trajet du visiteur perdu, avant les quatre situations.
        Il pose la scene en une ligne : c'est la meme sequence que le lecteur
        va reconnaitre chez lui. Le trajet inverse  celui ou Deezy rattrape —
        appartient a la section « recovery » ; le montrer ici aussi affaiblirait
        les deux.
      */}
      <Reveal delay={90} className="mt-12">
        <div className="border-border bg-muted/30 rounded-2xl border border-dashed p-5 md:p-6">
          <p className="text-muted-foreground text-center text-xs font-semibold tracking-widest uppercase">
            {t.flow.label}
          </p>

          <ol className="mt-5 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-center">
            {t.flow.steps.map((step, index) => {
              const isLast = index === t.flow.steps.length - 1;

              return (
                <li key={step} className="flex items-center gap-2 sm:contents">
                  <span
                    className={`flex-1 rounded-xl border px-3.5 py-2.5 text-center text-sm font-medium sm:flex-none ${
                      isLast
                        ? 'border-red-500/25 bg-red-500/10 text-red-600'
                        : 'bg-background border-border text-foreground'
                    }`}
                  >
                    {step}
                  </span>
                  {!isLast && (
                    <ArrowRight
                      className="text-muted-foreground/50 size-4 shrink-0 rotate-90 sm:rotate-0"
                      aria-hidden
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </Reveal>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {t.items.map((pain, index) => {
          const Icon = ICONS[index % ICONS.length] ?? DoorOpen;

          return (
            <Reveal key={pain.title} delay={(index % 2) * 90}>
              <Spotlight className="group hover:ring-brand/25 h-full rounded-2xl p-6 ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg md:p-8 dark:ring-white/10">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground/25 group-hover:text-brand/40 font-mono text-4xl leading-none font-bold tabular-nums transition-colors">
                    {pain.step}
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

      <Reveal delay={120} className="mt-10 text-center">
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
      </Reveal>
    </Section>
  );
}
