import { ArrowRight, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';
import type { Dictionary } from '@/lib/i18n';
import { Section, SectionHeading } from '../section';

/**
 * Tarification Enterprise — sans tarif.
 *
 * POURQUOI AUCUN MONTANT N'APPARAIT ICI
 *
 * Un « a partir de 999 $ » ferait deux degats a la fois : il ecarterait les
 * organisations dont le perimetre justifie davantage, et il ancrerait un prix
 * plancher dans toutes les negociations suivantes. La page de tarifs de Deezy
 * Business affiche des prix parce qu'ils sont fixes chez le prestataire de
 * paiement ; ici, rien n'est fixe avant le cadrage.
 *
 * La liste remplace la grille : elle montre CE QUI DETERMINE le prix, ce qui
 * permet au lecteur d'estimer seul son ordre de grandeur et de venir avec les
 * bonnes informations. C'est plus utile qu'un montant qu'il faudrait
 * renegocier des le premier appel.
 *
 * Consequence a ne pas oublier : le balisage schema.org de cette page ne
 * declare aucune `offers` chiffree. Annoncer un prix aux moteurs alors que la
 * page n'en montre pas serait une fausse declaration.
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
