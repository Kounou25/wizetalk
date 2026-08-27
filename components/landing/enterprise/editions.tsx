import Link from 'next/link';
import { ArrowRight, Building2, Check, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';
import type { Dictionary, Locale } from '@/lib/i18n';
import { Section, SectionHeading } from '../section';

/**
 * Business ou Enterprise : le visiteur choisit son parcours.
 *
 * PLACEE AVANT LA FAQ, PAS APRES LE HEROS
 *
 * Tot dans la page, cette comparaison inviterait a partir vers l'offre en
 * libre-service avant d'avoir compris ce que l'Enterprise apporte. Ici, le
 * lecteur a tout lu : soit il se reconnait dans le cadrage accompagne, soit il
 * realise qu'une PME comme la sienne sera servie plus vite par Deezy Business
 * — et dans ce cas, le renvoyer est un service rendu aux deux parties.
 *
 * C'est aussi la seule section de la page ou « Commencer gratuitement »
 * apparait. Ailleurs, ce libelle contredirait l'offre vendue.
 */
export function EnterpriseEditions({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const t = dict.enterprise.editions;

  return (
    <Section tone="muted">
      <SectionHeading title={t.title} lead={t.lead} />

      <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
        <Reveal>
          <div className="bg-card flex h-full flex-col rounded-2xl border p-6 md:p-7">
            <span className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-xl">
              <Zap className="size-5" aria-hidden />
            </span>

            <p className="mt-4 text-lg font-semibold">{t.business.name}</p>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed text-pretty">
              {t.business.body}
            </p>

            <ul className="mt-5 flex flex-col gap-2.5">
              {t.business.items.map((item) => (
                <li
                  key={item}
                  className="text-muted-foreground flex items-start gap-2.5 text-sm"
                >
                  <Check className="mt-0.5 size-4 shrink-0" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-6">
              <Button asChild variant="outline" className="h-11 w-full">
                <Link href={`/${locale}/signup`}>{t.business.cta}</Link>
              </Button>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          {/* La bordure de marque designe l'offre de cette page. Sans elle, les
              deux cartes se valent et le lecteur repart sur la moins chere par
              defaut, sans avoir choisi. */}
          <div className="bg-card border-brand/40 flex h-full flex-col rounded-2xl border-2 p-6 shadow-lg md:p-7">
            <span className="bg-brand-soft text-brand flex size-10 items-center justify-center rounded-xl">
              <Building2 className="size-5" aria-hidden />
            </span>

            <p className="mt-4 text-lg font-semibold">{t.enterprise.name}</p>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed text-pretty">
              {t.enterprise.body}
            </p>

            <ul className="mt-5 flex flex-col gap-2.5">
              {t.enterprise.items.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm">
                  <Check className="text-brand mt-0.5 size-4 shrink-0" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-6">
              <Button
                asChild
                className="bg-brand hover:bg-brand/90 text-brand-foreground group h-11 w-full"
              >
                <a href="#contact">
                  {t.enterprise.cta}
                  <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                </a>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
