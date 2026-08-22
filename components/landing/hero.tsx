import Link from 'next/link';
import { ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';
import { TiltCard } from '@/components/tilt-card';
import type { Dictionary, Locale } from '@/lib/i18n';
import { WidgetMockup } from './widget-preview';

export function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section className="relative overflow-hidden">
      {/* Lavis colore en haut de page, quadrillage estompe, puis deux masses
          floues en mouvement lent : de la profondeur sans une seule image. */}
      <div
        aria-hidden
        className="from-brand-soft pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px] bg-gradient-to-b via-transparent to-transparent"
      />
      <div
        aria-hidden
        className="bg-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000,transparent)]"
      />
      <div
        aria-hidden
        className="bg-brand/15 animate-float pointer-events-none absolute -top-24 right-[6%] -z-10 size-72 rounded-full blur-3xl"
      />
      <div
        aria-hidden
        className="animate-float-delayed pointer-events-none absolute top-44 left-[2%] -z-10 size-56 rounded-full bg-sky-400/15 blur-3xl"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:py-28">
        <Reveal>
          <span className="animate-pulse-ring border-brand/15 bg-brand-soft text-brand inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium">
            <ShieldCheck className="size-3.5" aria-hidden />
            {dict.hero.badge}
          </span>

          {/* Le titre doit dire ce qu'EST le produit : un visiteur qui arrive
              doit comprendre en une lecture, sans faire defiler. */}
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-[3.6rem] lg:leading-[1.04]">
            {dict.hero.titleStart}{' '}
            <span className="text-gradient-animate">{dict.hero.titleHighlight}</span>
          </h1>

          <p className="text-muted-foreground mt-6 max-w-lg text-lg leading-relaxed text-pretty">
            {dict.hero.subtitleStart}
            <strong className="text-foreground font-semibold">
              {dict.hero.subtitleStrong}
            </strong>
            {dict.hero.subtitleEnd}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="bg-brand hover:bg-brand/90 text-brand-foreground group h-12 px-6 text-base"
            >
              <Link href={`/${locale}/signup`}>
                {dict.hero.ctaPrimary}
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
              <a href="#fonctionnement">{dict.hero.ctaSecondary}</a>
            </Button>
          </div>

          {/* Leve les freins juste sous l'appel a l'action, la ou l'hesitation
              se produit — pas plus bas dans la page. */}
          <p className="text-muted-foreground mt-4 text-sm">{dict.hero.reassurance}</p>

          {/*
            L'extrait de code a ete retire d'ici : il rassure un developpeur et
            fait fuir un commercant. La promesse « une seule ligne » se dit
            aussi bien en francais ; le code reste visible plus bas, dans la
            section compatibilite, pour ceux que ca interesse.
          */}
          <p className="mt-6 flex items-center gap-2 text-sm font-medium">
            <span className="bg-brand-soft text-brand flex size-6 shrink-0 items-center justify-center rounded-full">
              <Check className="size-3.5" aria-hidden />
            </span>
            {dict.hero.installNote}
          </p>

          <ul className="text-muted-foreground mt-6 flex flex-col gap-2.5 text-sm sm:flex-row sm:gap-6">
            {dict.hero.proofs.map((proof) => (
              <li key={proof} className="flex items-center gap-1.5">
                <Check className="text-brand size-4" aria-hidden />
                {proof}
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Le produit, tout de suite : on ne fait pas defiler pour comprendre. */}
        <Reveal delay={150} className="relative">
          <TiltCard className="mx-auto w-full max-w-md">
            <WidgetMockup dict={dict} />
          </TiltCard>

          <div className="bg-card absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium shadow-lg ring-1 ring-black/5">
            <span className="relative flex size-2" aria-hidden>
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            {dict.hero.liveBadge}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
