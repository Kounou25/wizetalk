import Link from 'next/link';

import { cn } from '@/lib/utils';

export interface TabItem {
  /** Valeur du parametre d'URL qui active cet onglet. */
  id: string;
  label: string;
  href: string;
}

/**
 * Barre d'onglets adossee a l'URL.
 *
 * PAS DE `role="tab"`, ET C'EST VOLONTAIRE
 *
 * Le motif ARIA des onglets suppose que les panneaux coexistent dans le meme
 * document et qu'on bascule entre eux sans navigation : il impose alors
 * `aria-controls`, la gestion des fleches et un focus roulant. Ici, chaque
 * onglet est une vraie URL qui recharge son contenu cote serveur — ce sont des
 * liens de navigation, pas des onglets au sens ARIA. Les annoncer comme tels
 * promettrait un comportement clavier que la page n'a pas.
 *
 * `<nav>` et `aria-current` disent exactement ce qui se passe, et donnent au
 * passage ce que les onglets ARIA ne donnent pas : une adresse partageable, un
 * rafraichissement qui retombe au bon endroit, et un bouton retour qui marche.
 */
export function TabNav({
  items,
  active,
  label,
}: {
  items: TabItem[];
  active: string;
  /** Ce que cette barre permet de parcourir, pour l'assistance technique. */
  label: string;
}) {
  return (
    <nav aria-label={label} className="border-border -mb-px flex gap-1 overflow-x-auto border-b">
      {items.map((item) => {
        const current = item.id === active;

        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={current ? 'page' : undefined}
            scroll={false}
            className={cn(
              'focus-ring -mb-px shrink-0 rounded-t-lg border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
              current
                ? 'border-brand text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:border-border-strong border-transparent',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
