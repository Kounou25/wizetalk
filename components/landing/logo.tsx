import Image from 'next/image';

import { cn } from '@/lib/utils';

/**
 * Deux gravures du meme logotype.
 *
 * `navbar` porte un peu plus de marge autour du dessin : posee dans une barre
 * de 56 px, elle respire au lieu de toucher les filets. `full` est recadree au
 * plus pres, pour les usages ou le logo est seul et doit occuper sa place.
 * A hauteur egale, le dessin de `navbar` parait donc legerement plus petit —
 * c'est voulu, pas un defaut de calage.
 */
const VARIANTS = {
  navbar: { src: '/dezzy-navbar.png', width: 778, height: 249 },
  full: { src: '/deezy-logo.png', width: 648, height: 207 },
} as const;

export type LogoVariant = keyof typeof VARIANTS;

/**
 * Logo Deezy.
 *
 * Logotype : le nom fait partie de l'image. On ne lui accole donc JAMAIS un
 * texte « Deezy »  il apparaitrait deux fois.
 *
 * Rapport ~3:1. La hauteur pilote l'affichage (`h-7 w-auto`) : c'est elle qui
 * doit s'aligner sur le texte voisin, pas la largeur.
 */
export function Logo({
  className = 'h-7',
  variant = 'navbar',
  priority = true,
}: {
  className?: string;
  variant?: LogoVariant;
  /** A couper quand le logo est sous la ligne de flottaison (pied de page) :
   *  il disputerait sinon la bande passante au contenu visible. */
  priority?: boolean;
}) {
  const { src, width, height } = VARIANTS[variant];

  return (
    <Image
      src={src}
      alt="Deezy"
      width={width}
      height={height}
      priority={priority}
      className={cn('w-auto object-contain', className)}
    />
  );
}

/**
 * Bulle de discussion blanche, pour les en-tetes de widget sur fond colore.
 *
 * Ce n'est volontairement PAS la marque Deezy : cet en-tete represente
 * l'assistant du client, sur son site a lui. Y placer notre logo serait a la
 * fois hors sujet et illisible.
 */
export function ChatGlyph({ className = 'size-7' }: { className?: string }) {
  return (
    <span
      className={cn(
        'flex items-center justify-center rounded-lg bg-white/20 text-white',
        className,
      )}
      aria-hidden
    >
      <svg
        width="60%"
        height="60%"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    </span>
  );
}
