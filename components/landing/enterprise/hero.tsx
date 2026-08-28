import { Globe, Link2, ShieldCheck } from 'lucide-react';

import { Reveal } from '@/components/reveal';
import type { Dictionary } from '@/lib/i18n';
import { ChatGlyph } from '../logo';
import { EnterpriseCta } from './cta';

/**
 * Heros de l'offre Enterprise.
 *
 * Plus sobre que celui de la landing : le lecteur va comparer des prestataires
 * et faire relire la page par sa direction juridique. Le degrade anime et le
 * badge qui pulse de Deezy Business le rendraient mefiant — le titre reste
 * noir, la promesse porte seule.
 */
export function EnterpriseHero({ dict }: { dict: Dictionary }) {
  const t = dict.enterprise.hero;

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="from-brand-soft pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-gradient-to-b via-transparent to-transparent"
      />
      <div
        aria-hidden
        className="bg-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000,transparent)]"
      />

      {/* La gouttiere verticale est plus large que l'horizontale : empiles sur
          telephone, les deux blocs ont besoin de se detacher. */}
      <div className="mx-auto grid max-w-6xl items-center gap-x-6 gap-y-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
        <Reveal>
          <span className="border-brand/20 bg-brand-soft text-brand inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide uppercase">
            {t.badge}
          </span>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-[3.25rem] lg:leading-[1.06]">
            {t.title}
          </h1>

          <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed text-pretty">
            {t.subtitle}
          </p>

          <EnterpriseCta
            className="mt-8"
            demoLabel={t.ctaPrimary}
            contactLabel={t.ctaSecondary}
            lead="demo"
          />

          {/* La phrase qui leve le frein propre a cette cible : « est-ce que je
              perds la main sur ce que dit ce truc sur mon site ». */}
          <p className="text-muted-foreground mt-5 flex items-center gap-2 text-sm">
            <ShieldCheck className="text-brand size-4 shrink-0" aria-hidden />
            {t.reassurance}
          </p>
        </Reveal>

        <Reveal delay={120}>
          <HeroMockup dict={dict} />
        </Reveal>
      </div>
    </section>
  );
}

/**
 * Maquette du widget, version Enterprise. Inerte : aucun appel reseau depuis
 * une page de vente.
 */
function HeroMockup({ dict }: { dict: Dictionary }) {
  const t = dict.enterprise.hero.mockup;

  return (
    <div className="bg-card overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
      <div className="bg-brand text-brand-foreground flex items-center gap-2.5 px-4 py-3.5">
        <ChatGlyph className="size-7" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{t.title}</p>
          <p className="flex items-center gap-1.5 text-[11px] text-white/70">
            <span className="size-1.5 rounded-full bg-emerald-300" aria-hidden />
            {t.online}
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium">
          <Globe className="size-3" aria-hidden />
          {t.languages}
        </span>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex justify-end">
          <p className="bg-brand text-brand-foreground max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed">
            {t.question}
          </p>
        </div>

        <div className="flex justify-start">
          <p className="bg-muted text-foreground/80 max-w-[92%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed">
            {t.answer}
          </p>
        </div>

        <p className="text-muted-foreground flex items-center gap-1.5 border-t pt-2.5 text-[11px]">
          <Link2 className="size-3 shrink-0" aria-hidden />
          {t.sourceLabel} · <span className="font-medium">{t.sourceName}</span>
        </p>
      </div>

      <div className="flex items-center gap-2 border-t p-3">
        <div className="text-muted-foreground bg-muted/60 flex-1 rounded-lg border px-3 py-2 text-xs">
          {t.placeholder}
        </div>
        <span className="bg-brand text-brand-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="m22 2-7 20-4-9-9-4Z" />
          </svg>
        </span>
      </div>
    </div>
  );
}
