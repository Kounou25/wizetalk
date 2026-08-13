import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';
import { Spotlight } from '@/components/spotlight';
import type { Dictionary, Locale } from '@/lib/i18n';

/**
 * Grille tarifaire — valeurs a ajuster avant mise en ligne publique.
 * Aucun paiement n'est branche : tous les boutons menent a l'inscription.
 *
 * Le palier mis en avant est designe par son rang, pas par son nom : le nom
 * change d'une langue a l'autre, pas la position.
 */
const HIGHLIGHTED_INDEX = 1;

export function Pricing({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section id="tarifs" className="bg-muted/40 border-y">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
            {dict.pricing.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance md:text-4xl">
            {dict.pricing.title}
          </h2>
          <p className="text-muted-foreground mt-4 text-pretty">{dict.pricing.lead}</p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-4">
          {dict.pricing.plans.map((plan, index) => {
            const highlighted = index === HIGHLIGHTED_INDEX;
            const isCustom = index === dict.pricing.plans.length - 1;

            return (
              <Reveal key={plan.name} delay={index * 80} className="h-full">
                <Spotlight
                  className={`bg-background relative flex h-full flex-col rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                    highlighted
                      ? 'ring-brand shadow-lg ring-2'
                      : 'hover:ring-brand/25 ring-1 ring-black/5 dark:ring-white/10'
                  }`}
                >
                  {highlighted && (
                    <span className="bg-brand text-brand-foreground absolute -top-3 left-6 rounded-full px-3 py-1 text-xs font-medium">
                      {dict.pricing.popular}
                    </span>
                  )}

                  <h3 className="font-semibold">{plan.name}</h3>
                  <p className="text-muted-foreground mt-1 text-sm text-pretty">
                    {plan.description}
                  </p>

                  <p className="mt-5 flex items-baseline gap-1">
                    <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
                    {!isCustom && (
                      <span className="text-muted-foreground text-sm">
                        {dict.pricing.perMonth}
                      </span>
                    )}
                  </p>

                  <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-2.5 text-sm">
                        <svg
                          className="text-brand mt-0.5 shrink-0"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    className={`mt-7 w-full ${
                      highlighted ? 'bg-brand hover:bg-brand/90 text-brand-foreground' : ''
                    }`}
                    variant={highlighted ? 'default' : 'outline'}
                  >
                    <Link href={`/${locale}/signup`}>{plan.cta}</Link>
                  </Button>
                </Spotlight>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
