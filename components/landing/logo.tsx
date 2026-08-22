import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * Logo Deezy.
 *
 * Logotype : le nom fait partie de l'image. On ne lui accole donc JAMAIS un
 * texte « Deezy » — il apparaitrait deux fois.
 *
 * Rapport 3:1. La hauteur pilote l'affichage (`h-7 w-auto`) : c'est elle qui
 * doit s'aligner sur le texte voisin, pas la largeur. `next/image` se charge
 * du redimensionnement — la source fait 2172 px de large pour un affichage a
 * une centaine de pixels.
 */
export function Logo({ className = 'h-7' }: { className?: string }) {
  return (
    <Image
      src="/new-logo.png"
      alt="Deezy"
      width={2172}
      height={724}
      priority
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
