import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';
import type { Dictionary, Locale } from '@/lib/i18n';

export function FinalCta({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section className="border-t">
      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="bg-brand/10 animate-float pointer-events-none absolute -bottom-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full blur-3xl"
        />
        <div
          aria-hidden
          className="bg-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_100%,#000,transparent)]"
        />

        <Reveal className="relative mx-auto max-w-3xl px-6 py-24 text-center md:py-28">
          <h2 className="text-3xl font-bold tracking-tight text-balance md:text-5xl">
            {dict.finalCta.titleStart}
            <br />
            <span className="text-gradient-animate">{dict.finalCta.titleHighlight}</span>
          </h2>
          <p className="text-muted-foreground mx-auto mt-5 max-w-lg text-lg text-pretty">
            {dict.finalCta.lead}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-brand hover:bg-brand/90 text-brand-foreground group h-12 px-6 text-base"
            >
              <Link href={`/${locale}/signup`}>
                {dict.finalCta.primary}
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
              <Link href={`/${locale}/login`}>{dict.finalCta.secondary}</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
