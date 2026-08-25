'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

/** Classe partagee des entrees, exportee pour les cas qui doivent rendre un
 *  element particulier — un bouton d'envoi dans un <form>, par exemple. */
export const dropdownItemClass =
  'focus-ring hover:bg-surface-subtle flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors outline-none focus-visible:bg-surface-subtle';

/**
 * Fermeture du menu, exposee aux entrees.
 *
 * Le menu se fermait auparavant sur tout clic recu par son conteneur. C'etait
 * commode, et faux : une entree qui soumet un formulaire etait demontee par ce
 * clic AVANT que le navigateur ne declenche l'envoi, qui n'arrivait donc
 * jamais. C'est ce qui rendait la deconnexion inoperante.
 *
 * Chaque entree decide desormais elle-meme. Un lien ferme tout de suite ; une
 * entree qui declenche une action serveur laisse le menu ouvert, ce qui a le
 * bon gout de garder son indicateur de chargement visible.
 */
const DropdownContext = createContext<(() => void) | null>(null);

export function useDropdownClose(): () => void {
  return useContext(DropdownContext) ?? (() => {});
}

/**
 * Menu attache a un bouton.
 *
 * Ecrit a la main plutot qu'importe : le projet n'embarque qu'un seul
 * primitif Radix, et un menu correct tient en une centaine de lignes. Ce qu'il
 * faut respecter, c'est le contrat clavier — c'est la seule raison pour
 * laquelle un menu maison est habituellement rate :
 *   Entree/Espace/Fleche bas ouvrent et posent le focus sur la premiere entree,
 *   les fleches circulent, Debut/Fin vont aux extremites,
 *   Echap ferme et rend le focus au bouton,
 *   Tab ferme sans avaler la navigation.
 */
export function DropdownMenu({
  label,
  trigger,
  triggerClassName,
  align = 'end',
  className,
  children,
}: {
  /** Nom du menu pour l'assistance technique. */
  label: string;
  trigger: React.ReactNode;
  triggerClassName?: string;
  align?: 'start' | 'end';
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const items = () =>
    Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  // Le focus part sur la premiere entree des l'ouverture : sans cela le menu
  // s'ouvre mais reste inatteignable au clavier.
  useEffect(() => {
    if (open) items()[0]?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    // Le menu se ferme aussi au defilement : ancre en position absolue, il
    // suivrait sinon le bouton hors de l'ecran.
    const onScroll = () => setOpen(false);

    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open]);

  const onMenuKeyDown = (event: React.KeyboardEvent) => {
    const list = items();
    const index = list.indexOf(document.activeElement as HTMLElement);

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        close();
        break;
      case 'Tab':
        setOpen(false);
        break;
      case 'ArrowDown':
        event.preventDefault();
        list[(index + 1) % list.length]?.focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        list[(index - 1 + list.length) % list.length]?.focus();
        break;
      case 'Home':
        event.preventDefault();
        list[0]?.focus();
        break;
      case 'End':
        event.preventDefault();
        list[list.length - 1]?.focus();
        break;
    }
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' && !open) {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className={cn('focus-ring cursor-pointer', triggerClassName)}
      >
        {trigger}
      </button>

      {open && (
        <DropdownContext.Provider value={() => setOpen(false)}>
          <div
            ref={menuRef}
            role="menu"
            aria-label={label}
            onKeyDown={onMenuKeyDown}
            className={cn(
              'overlay animate-overlay-in absolute top-[calc(100%+6px)] z-50 min-w-56 p-1.5',
              align === 'end' ? 'right-0' : 'left-0',
              className,
            )}
          >
            {children}
          </div>
        </DropdownContext.Provider>
      )}
    </div>
  );
}

export function DropdownItem({
  href,
  onSelect,
  icon: Icon,
  tone = 'default',
  children,
}: {
  href?: string;
  onSelect?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: 'default' | 'danger';
  children: React.ReactNode;
}) {
  const close = useDropdownClose();

  const className = cn(
    dropdownItemClass,
    tone === 'danger' ? 'text-red-600 hover:bg-red-500/10' : 'text-foreground',
  );

  const content = (
    <>
      {Icon && <Icon className="text-muted-foreground size-4 shrink-0" aria-hidden />}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} role="menuitem" className={className} onClick={close}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      role="menuitem"
      className={className}
      onClick={() => {
        onSelect?.();
        close();
      }}
    >
      {content}
    </button>
  );
}

export function DropdownLabel({ children }: { children: React.ReactNode }) {
  return <div className="px-2.5 py-1.5">{children}</div>;
}

export function DropdownSeparator() {
  return <div role="separator" className="bg-border -mx-1.5 my-1.5 h-px" />;
}
