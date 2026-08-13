import { EmbedTabs } from '@/components/embed-tabs';
import { Reveal } from '@/components/reveal';
import { Spotlight } from '@/components/spotlight';
import { TechLogo } from '@/components/tech-logos';
import type { Dictionary } from '@/lib/i18n';

/**
 * Grille de compatibilite.
 *
 * Huit plateformes en deux rangees de quatre : celles ou se trouvent
 * reellement les sites vitrines et les boutiques, plus le cas « site sur
 * mesure ». Les noms sont des marques, donc jamais traduits — seuls les
 * indices « ou coller » viennent du dictionnaire.
 */
const PLATFORMS = [
  'WordPress',
  'Shopify',
  'Wix',
  'Squarespace',
  'Webflow',
  'Framer',
  'Next.js',
  'HTML',
];

export function Platforms({ dict, appUrl }: { dict: Dictionary; appUrl: string }) {
  return (
    <section id="compatibilite" className="bg-muted/40 border-t">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
            {dict.platforms.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance md:text-4xl">
            {dict.platforms.title}
          </h2>
          <p className="text-muted-foreground mt-4 text-pretty">
            {dict.platforms.leadStart}
            <code className="bg-background rounded px-1.5 py-0.5 font-mono text-[0.9em]">
              &lt;/body&gt;
            </code>
            {dict.platforms.leadEnd}
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-2 gap-5 sm:grid-cols-4">
          {PLATFORMS.map((name, index) => (
            <Reveal key={name} delay={(index % 4) * 80}>
              <Spotlight className="bg-background hover:ring-brand/30 group flex h-full flex-col items-center gap-3 rounded-2xl p-6 text-center shadow-sm ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:ring-white/10">
                {/* Pastille volontairement claire : les marques sombres
                    (Next.js, Squarespace) restent lisibles en theme sombre. */}
                <span className="flex size-12 items-center justify-center rounded-xl bg-zinc-50 ring-1 ring-zinc-200/70 transition-transform duration-200 group-hover:scale-105">
                  <TechLogo name={name} />
                </span>
                <span className="text-sm font-semibold">{name}</span>
                <span className="text-muted-foreground -mt-1.5 font-mono text-[11px]">
                  {dict.platforms.hints[name]}
                </span>
              </Spotlight>
            </Reveal>
          ))}
        </div>

        {/* Les exemples concrets repondent a la question que la grille laisse
            ouverte : « concretement, ca donne quoi chez moi ? » */}
        <Reveal className="mx-auto mt-12 max-w-3xl">
          <EmbedTabs botId="VOTRE_ID" fallbackOrigin={appUrl} className="shadow-2xl" />
        </Reveal>

        <Reveal>
          <p className="text-muted-foreground mt-8 text-center text-sm">
            {dict.platforms.fallback}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
