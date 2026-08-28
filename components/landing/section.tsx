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
 * LE SYSTEME DE COLONNES DE LA PAGE
 *
 * POURQUOI CES CONSTANTES EXISTENT
 *
 * Les sections Enterprise ont d'abord ete ecrites une par une, chacune avec la
 * proportion qui « tombait bien » pour son contenu : 1.05fr/1fr au heros,
 * 0.9fr/1.1fr a la fiabilite, 0.85fr/1.15fr a l'analyse, 1.15fr/0.85fr aux
 * integrations. Cinq decoupages differents sur une meme page.
 *
 * Le defaut n'est visible sur aucune section prise isolement — il l'est sur la
 * page entiere : AUCUNE ligne verticale ne la traverse. Le bord d'un bloc ne
 * repond a rien de ce qui le precede ni de ce qui le suit, et dix-huit
 * sections se lisent alors comme un empilement plutot que comme un document.
 *
 * LA REGLE, EN UNE PHRASE
 *
 * Douze colonnes, une gouttiere de 24px, et TOUT bloc de droite commence a la
 * colonne 7. C'est la seule ligne a verifier, et elle se verifie a l'oeil.
 *
 * POURQUOI LES GRILLES DE CARTES N'ONT PAS BESOIN DE CES CONSTANTES
 *
 * Une piste de `grid-cols-3` vaut exactement une portee de 4 colonnes sur 12 —
 * a condition que la gouttiere soit la meme :
 *
 *     largeur = 12t + 11g   =>   (largeur - 2g)/3 = 4t + 3g
 *
 * Autrement dit `grid-cols-2`, `-3`, `-4` et `-6` retombent d'eux-memes sur les
 * lignes de la grille de douze. C'est pour cela qu'une seule chose compte
 * vraiment ici : que la gouttiere soit partout la meme, 24px — soit trois fois
 * la base de 8px du rythme vertical. Une valeur de 20px (`gap-5`) suffit a
 * decaler toute une rangee de cartes hors du systeme.
 */

/** Grille asymetrique : texte a gauche, visuel a droite, colonne 6 laissee vide. */
export const splitGrid = 'grid gap-y-10 lg:grid-cols-12 lg:gap-x-6';

/** Colonnes 1 a 5 — le texte, volontairement plus etroit que le visuel. */
export const splitMain = 'lg:col-span-5';

/**
 * Colonnes 7 a 12 — le visuel.
 *
 * La colonne 6 reste vide : c'est elle qui donne l'air entre les deux blocs.
 * Un `gap` plus large aurait produit le meme espace a l'oeil, mais decale le
 * bord droit hors des lignes de la grille — et c'est exactement le probleme
 * que ces constantes corrigent.
 */
export const splitAside = 'lg:col-start-7 lg:col-span-6';

/**
 * Grille symetrique, deux blocs de meme poids.
 *
 * `grid-cols-2` avec la meme gouttiere vaut colonnes 1-6 et 7-12 : le bloc de
 * droite commence donc a la colonne 7, comme dans `splitAside`. Les deux mises
 * en page partagent la meme ligne, ce qui est tout l'objet du systeme.
 */
export const pairGrid = 'grid gap-6 lg:grid-cols-2';
