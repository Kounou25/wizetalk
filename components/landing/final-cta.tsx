import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';
import type { Dictionary, Locale } from '@/lib/i18n';

/**
 * Dernier appel a l'action.
 *
 * Une question, pas une promesse : le lecteur qui arrive ici a tout compris,
 * ce qu'il lui manque c'est une raison d'agir maintenant. Lui faire compter ce
 * qu'il a deja perdu est plus efficace que lui redire ce qu'il gagnerait.
 *
 * Un seul bouton : a ce stade, proposer une alternative revient a offrir une
 * porte de sortie.
 */
export function FinalCta({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.finalCta;

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
            {t.title}
          </h2>
          <p className="text-muted-foreground mx-auto mt-5 max-w-lg text-lg text-pretty">
            {t.lead}
          </p>

          <div className="mt-8 flex justify-center">
            <Button
              asChild
              size="lg"
              className="bg-brand hover:bg-brand/90 text-brand-foreground group h-12 px-7 text-base"
            >
              <Link href={`/${locale}/signup`}>
                {t.cta}
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>

          <p className="text-muted-foreground mt-4 text-sm">{t.microcopy}</p>
        </Reveal>
      </div>
    </section>
  );
}
