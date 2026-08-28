'use client';

import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useFocusTrap } from './use-focus-trap';

/**
 * Fenetre modale.
 *
 * Ecrite a la main plutot qu'importee : le projet n'embarque qu'un seul
 * primitif Radix, et une modale correcte tient en une soixantaine de lignes.
 * Ce qui compte, c'est le contrat d'accessibilite  la raison pour laquelle une
 * modale maison est habituellement ratee :
 *
 *   `aria-modal` accompagne d'un VRAI piege a focus, sinon la promesse est
 *   fausse : les lecteurs d'ecran annoncent un dialogue qui capture le focus
 *   alors que Tab continue de parcourir la page derriere ;
 *   Echap ferme, et le focus revient a l'element declencheur ;
 *   le fond ne defile pas tant que la modale est ouverte ;
 *   le titre est rattache par `aria-labelledby`, sans quoi le dialogue
 *   s'annonce sans nom.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useFocusTrap(panelRef, open);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          'overlay animate-overlay-in relative flex w-full max-w-lg flex-col',
          className,
        )}
      >
        <div className="border-border flex items-start justify-between gap-4 border-b px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-semibold text-pretty">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="text-muted-foreground mt-1 text-sm text-pretty">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="focus-ring hover:bg-surface-subtle -mt-1 -mr-1 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {children && <div className="max-h-[60vh] overflow-y-auto px-5 py-4">{children}</div>}

        {footer && (
          <div className="border-border flex flex-wrap items-center justify-end gap-2 border-t px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
