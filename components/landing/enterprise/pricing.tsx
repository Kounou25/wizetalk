import { ArrowRight, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';
import type { Dictionary } from '@/lib/i18n';
import { Section, SectionHeading } from '../section';

/**
 * Tarification Enterprise — sans tarif.
 *
 * Un « a partir de 999 $ » ecarterait les organisations dont le perimetre
 * justifie davantage, et ancrerait un prix plancher dans toutes les
 * negociations suivantes. La liste montre CE QUI DETERMINE le prix, ce qui
 * permet au lecteur d'estimer son ordre de grandeur.
 *
 * Corollaire : le balisage schema.org de cette page ne declare aucune `offers`
 * chiffree. Annoncer un prix aux moteurs quand la page n'en montre pas serait
 * une fausse declaration.
 */
export function EnterprisePricing({ dict }: { dict: Dictionary }) {
  const t = dict.enterprise.pricing;

  return (
    <Section id="tarifs-enterprise">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

      <Reveal delay={120}>
        <div className="bg-card mx-auto mt-12 max-w-2xl rounded-2xl border p-7 shadow-xl md:p-9">
          <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
            {t.includesTitle}
          </p>

          <ul className="mt-5 flex flex-col gap-3">
            {t.includes.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm">
                <Check className="text-brand mt-0.5 size-4 shrink-0" aria-hidden />
                <span className="text-pretty">{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-7 border-t pt-6">
            <Button
              asChild
              size="lg"
              className="bg-brand hover:bg-brand/90 text-brand-foreground group h-12 w-full px-6 text-base"
            >
              <a href="#contact">
                {t.cta}
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </a>
            </Button>

            <p className="text-muted-foreground mt-4 text-xs leading-relaxed text-pretty">
              {t.note}
            </p>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
