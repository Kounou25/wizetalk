import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * Marque Deezy.
 *
 * Le fichier porte deja son fond bleu et ses coins arrondis : on ne l'enveloppe
 * donc dans aucun conteneur colore. `next/image` se charge du redimensionnement
 * et du format — la source fait 1254 px pour un affichage a 28 px, la servir
 * telle quelle couterait pres d'un mega-octet a chaque page.
 */
export function Logo({ className = 'size-7' }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt=""
      width={64}
      height={64}
      className={cn('object-contain', className)}
      aria-hidden
    />
  );
}

/**
 * Bulle de discussion blanche, pour les en-tetes de widget sur fond colore.
 *
 * Ce n'est volontairement PAS la marque Deezy : cet en-tete represente
 * l'assistant du client, sur son site a lui. Y placer notre logo serait a la
 * fois hors sujet et illisible — du bleu sur du bleu.
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
