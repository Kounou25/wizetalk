import type { Dictionary } from '@/lib/i18n';

/**
 * Bandeau de logos defilant.
 *
 * ⚠ MARQUES FICTIVES — espace reserve au design.
 * Un bandeau de logos se lit comme un mur de clients. Ces noms sont inventes :
 * remplacez-les par de vraies entreprises, ou retirez la section, avant toute
 * mise en ligne publique.
 *
 * Rendus en simples mots plutot qu'en glyphes : a cette opacite, un nom bien
 * dessine se lit deja comme un logo, et rien n'est charge depuis un tiers.
 */
const BRANDS = [
  'Novalis',
  'Ateliom',
  'Brikko',
  'Verdano',
  'Solveo',
  'Kappri',
  'Lunaris',
  'Fabrik',
];

export function LogoMarquee({ dict }: { dict: Dictionary }) {
  return (
    <section className="border-y py-10">
      <p className="text-muted-foreground/70 text-center text-xs font-medium tracking-widest uppercase">
        {dict.logos.label}
      </p>

      <div className="relative mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)]">
        <ul className="animate-marquee flex w-max items-center gap-16 hover:[animation-play-state:paused]">
          {/* Liste rendue deux fois : la seconde prend le relais a -50 %. */}
          {[...BRANDS, ...BRANDS].map((name, index) => (
            <li
              key={`${name}-${index}`}
              className="text-muted-foreground/35 hover:text-muted-foreground shrink-0 text-xl font-bold tracking-tight transition-colors"
              aria-hidden={index >= BRANDS.length}
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
