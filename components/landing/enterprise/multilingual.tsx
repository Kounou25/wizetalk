import { Globe } from 'lucide-react';

import { Reveal } from '@/components/reveal';
import type { Dictionary } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
  Section,
  SectionHeading,
  splitAside,
  splitGrid,
  splitMain,
} from '../section';

/**
 * Multilingue.
 *
 * La consigne systeme de lib/rag.ts impose de repondre dans la langue de la
 * question, et la recherche vectorielle traverse les langues.
 *
 * La note en bas n'est pas une precaution de style : la recherche lexicale est
 * configuree en `french` (migration 0001), donc sur un corpus dans une autre
 * langue seul le bras vectoriel travaille vraiment. Les reponses restent
 * bonnes, leur precision suit celle de la source.
 */
export function EnterpriseMultilingual({ dict }: { dict: Dictionary }) {
  const t = dict.enterprise.multilingual;

  /* Trois formulations de la meme question. Les langues affichees sont celles
     que sert deja le produit, pas un drapeau decoratif. */
  const samples = [
    { lang: 'FR', text: 'Quels sont vos horaires d’ouverture ?' },
    { lang: 'EN', text: 'What are your opening hours?' },
    { lang: 'AR', text: 'ما هي ساعات العمل لديكم؟', rtl: true },
  ];

  return (
    <Section tone="muted">
      <div className={cn(splitGrid, 'items-center')}>
        <div className={splitMain}>
          <SectionHeading
            eyebrow={t.eyebrow}
            title={t.title}
            lead={t.lead}
            align="left"
          />

          <Reveal delay={100}>
            <p className="text-muted-foreground mt-8 text-xs font-semibold tracking-widest uppercase">
              {t.audienceTitle}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {t.audience.map((item) => (
                <span
                  key={item}
                  className="bg-card text-muted-foreground rounded-full border px-3 py-1.5 text-xs"
                >
                  {item}
                </span>
              ))}
            </div>

            <p className="text-muted-foreground border-brand/30 mt-7 border-l-2 pl-4 text-sm leading-relaxed text-pretty">
              {t.note}
            </p>
          </Reveal>
        </div>

        <Reveal delay={150} className={splitAside}>
          <div className="bg-card rounded-2xl border p-6 shadow-xl md:p-7">
            <div className="flex flex-col gap-3">
              {samples.map((sample) => (
                <div key={sample.lang} className="flex items-center gap-3">
                  <span className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold">
                    {sample.lang}
                  </span>
                  <p
                    className="bg-muted/60 flex-1 rounded-xl border px-3.5 py-2.5 text-sm"
                    dir={sample.rtl ? 'rtl' : undefined}
                    lang={sample.lang.toLowerCase()}
                  >
                    {sample.text}
                  </p>
                </div>
              ))}
            </div>

            {/* La convergence, dessinee : trois questions, un seul socle. */}
            <div className="mt-5 flex justify-center">
              <span className="bg-border h-6 w-px" aria-hidden />
            </div>

            <div className="border-brand/25 bg-brand-soft flex items-center gap-3 rounded-xl border px-4 py-3.5">
              <Globe className="text-brand size-5 shrink-0" aria-hidden />
              <p className="text-brand text-sm font-semibold text-pretty">{t.payoff}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
