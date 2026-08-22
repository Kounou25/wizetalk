import { Check } from 'lucide-react';
import { Reveal } from '@/components/reveal';
import type { Dictionary } from '@/lib/i18n';
import { Logo } from './logo';

/**
 * Rangees alternees texte / visuel.
 *
 * Motif dominant des landings SaaS mures : chaque rangee defend un benefice et
 * le montre. L'alternance gauche/droite evite l'effet de liste et donne au
 * regard un point d'accroche a chaque changement de sens.
 *
 * Les quatre visuels sont statiques et volontairement inertes : ils illustrent
 * un resultat, ils ne promettent pas une demo interactive.
 */
export function Showcase({ dict }: { dict: Dictionary }) {
  const t = dict.showcase;
  const visuals = [
    <CrawlVisual key="crawl" t={t.visuals} />,
    <ConfidenceVisual key="confidence" t={t.visuals} />,
    <LeadVisual key="lead" t={t.visuals} />,
    <GapsVisual key="gaps" t={t.visuals} />,
  ];

  return (
    <section id="fonctionnement" className="mx-auto max-w-6xl px-6 py-24 md:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
          {t.eyebrow}
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance md:text-4xl">
          {t.title}
        </h2>
        <p className="text-muted-foreground mt-5 text-lg text-pretty">{t.lead}</p>
      </Reveal>

      <div className="mt-20 flex flex-col gap-20 md:gap-28">
        {t.rows.map((row, index) => {
          const visualFirst = index % 2 === 1;

          return (
            <Reveal key={row.title}>
              <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <div className={visualFirst ? 'lg:order-last' : undefined}>
                  <p className="text-brand text-sm font-semibold tracking-widest uppercase">
                    {row.eyebrow}
                  </p>
                  <h3 className="mt-3 text-2xl font-bold tracking-tight text-balance md:text-3xl">
                    {row.title}
                  </h3>
                  <p className="text-muted-foreground mt-4 leading-relaxed text-pretty">
                    {row.body}
                  </p>

                  <ul className="mt-6 flex flex-col gap-2.5">
                    {row.points.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-sm">
                        <span className="bg-brand-soft text-brand mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
                          <Check className="size-3" aria-hidden />
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={visualFirst ? 'lg:order-first' : undefined}>
                  {visuals[index]}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

type Visuals = Dictionary['showcase']['visuals'];

/** Cadre commun : meme profondeur et meme rayon pour les quatre visuels. */
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl p-5 shadow-xl ring-1 ring-black/5 dark:ring-white/10">
      {children}
    </div>
  );
}

function CrawlVisual({ t }: { t: Visuals }) {
  return (
    <Frame>
      <p className="text-muted-foreground font-mono text-xs">{t.crawlTitle}</p>

      <div className="mt-4 flex flex-col gap-3">
        {t.crawlLines.map((line, index) => (
          <div key={line} className="flex items-center gap-3">
            {index < t.crawlLines.length - 1 ? (
              <span className="bg-brand-soft text-brand flex size-6 shrink-0 items-center justify-center rounded-full">
                <Check className="size-3.5" aria-hidden />
              </span>
            ) : (
              <span
                className="border-brand/30 border-t-brand size-6 shrink-0 animate-spin rounded-full border-2"
                aria-hidden
              />
            )}
            <span className="text-sm font-medium">{line}</span>
          </div>
        ))}
      </div>

      {/* Barres decroissantes : suggerent le volume traite sans avancer de chiffre. */}
      <div className="mt-5 flex flex-col gap-1.5" aria-hidden>
        {[100, 75, 45].map((width) => (
          <div key={width} className="bg-muted h-1.5 overflow-hidden rounded-full">
            <div className="bg-brand/60 h-full rounded-full" style={{ width: `${width}%` }} />
          </div>
        ))}
      </div>
    </Frame>
  );
}

function ConfidenceVisual({ t }: { t: Visuals }) {
  return (
    <Frame>
      <div className="flex justify-end">
        <p className="bg-brand text-brand-foreground max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px]">
          {t.confidenceQuestion}
        </p>
      </div>

      <div className="mt-3 flex justify-start">
        <p className="bg-muted text-foreground/80 max-w-[90%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed">
          {t.confidenceAnswer}
        </p>
      </div>

      {/*
        Le produit calcule un score de similarite, mais un nombre sur 1 ne dit
        rien a un commercant. On montre ce qu'il signifie pour lui : la reponse
        vient d'une page precise de son site.
      */}
      <div className="mt-5 flex items-center gap-3 rounded-xl border p-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
          <Check className="size-4 text-emerald-600" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-emerald-700">{t.verifiedLabel}</p>
          <p className="text-muted-foreground truncate text-xs">
            {t.sourceLabel} <span className="text-foreground font-medium">{t.sourceName}</span>
          </p>
        </div>
      </div>
    </Frame>
  );
}

function LeadVisual({ t }: { t: Visuals }) {
  return (
    <Frame>
      <div className="flex justify-end">
        <p className="bg-brand text-brand-foreground max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px]">
          {t.leadQuestion}
        </p>
      </div>

      <div className="mt-3 flex justify-start">
        <p className="bg-muted text-foreground/80 max-w-[90%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed">
          {t.leadRefusal}
        </p>
      </div>

      <div className="bg-muted/60 mt-4 flex gap-2 rounded-xl p-2.5">
        <div className="bg-background text-muted-foreground flex-1 rounded-lg border px-3 py-2 text-xs">
          {t.leadPlaceholder}
        </div>
        <span className="bg-brand text-brand-foreground flex items-center rounded-lg px-3 text-xs font-medium">
          {t.leadSend}
        </span>
      </div>
    </Frame>
  );
}

function GapsVisual({ t }: { t: Visuals }) {
  return (
    <Frame>
      <div className="flex items-center gap-2">
        <Logo className="size-5" />
        <p className="text-sm font-semibold">{t.gapsTitle}</p>
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {t.gaps.map((gap, index) => (
          <li
            key={gap.question}
            className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
          >
            <span className="truncate text-[13px]">{gap.question}</span>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
                index === 0 ? 'bg-amber-500/15 text-amber-700' : 'bg-muted text-muted-foreground'
              }`}
            >
              {gap.count}
            </span>
          </li>
        ))}
      </ul>
    </Frame>
  );
}
