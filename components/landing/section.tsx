import { Reveal } from '@/components/reveal';
import { cn } from '@/lib/utils';

/**
 * Cadre commun a toutes les sections de la landing.
 *
 * Le rythme vertical d'une page de vente est un argument a lui seul : des
 * sections qui respirent inegalement se lisent comme un assemblage, pas comme
 * un raisonnement. Une seule definition ici garantit le meme souffle du haut
 * en bas de la page.
 */
export function Section({
  id,
  tone = 'default',
  className,
  children,
}: {
  id?: string;
  /** `muted` marque une rupture de fond, `dark` le creux du recit. */
  tone?: 'default' | 'muted' | 'dark';
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        'scroll-mt-20',
        tone === 'muted' && 'bg-muted/40 border-y',
        tone === 'dark' && 'bg-foreground text-background',
        className,
      )}
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = 'center',
  tone = 'default',
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: 'center' | 'left';
  tone?: 'default' | 'dark';
}) {
  return (
    <Reveal
      className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}
    >
      {eyebrow && (
        <p
          className={cn(
            'text-sm font-semibold tracking-widest uppercase',
            tone === 'dark' ? 'text-background/60' : 'text-muted-foreground',
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          'text-3xl font-bold tracking-tight text-balance md:text-[2.75rem] md:leading-[1.1]',
          eyebrow && 'mt-3',
        )}
      >
        {title}
      </h2>
      {lead && (
        <p
          className={cn(
            'mt-5 text-lg leading-relaxed text-pretty',
            tone === 'dark' ? 'text-background/70' : 'text-muted-foreground',
          )}
        >
          {lead}
        </p>
      )}
    </Reveal>
  );
}

/**
 * Systeme de colonnes des pages publiques.
 *
 * Douze colonnes, gouttiere de 24px, et TOUT bloc de droite commence a la
 * colonne 7 : c'est la seule ligne a verifier.
 *
 * Les grilles de cartes n'ont pas besoin de ces constantes. Une piste de
 * `grid-cols-3` vaut exactement une portee de 4 colonnes sur 12 des lors que
 * la gouttiere est la meme — `largeur = 12t + 11g` donne `(largeur - 2g)/3 =
 * 4t + 3g`. Seule compte donc l'uniformite de la gouttiere : 24px partout,
 * soit trois fois la base de 8px du rythme vertical. Un `gap-5` (20px) suffit
 * a sortir une rangee entiere du systeme.
 */

/** Grille asymetrique : texte a gauche, visuel a droite, colonne 6 vide. */
export const splitGrid = 'grid gap-y-10 lg:grid-cols-12 lg:gap-x-6';

/** Colonnes 1 a 5 — le texte. */
export const splitMain = 'lg:col-span-5';

/**
 * Colonnes 7 a 12 — le visuel.
 *
 * La colonne 6 reste vide : c'est elle qui donne l'air entre les deux blocs.
 * Un `gap` plus large produirait le meme espace a l'oeil, mais decalerait le
 * bord droit hors des lignes de la grille.
 */
export const splitAside = 'lg:col-start-7 lg:col-span-6';

/** Grille symetrique : colonnes 1-6 et 7-12, donc la meme ligne que splitAside. */
export const pairGrid = 'grid gap-6 lg:grid-cols-2';
