'use client';

import { useTransition } from 'react';

import { setDemoRequestStatus } from '@/app/admin/actions';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

/**
 * Avancement d'une demande Enterprise.
 *
 * QUATRE ETATS EN LIGNE, PAS UN MENU DEROULANT
 *
 * Le suivi commercial se fait en balayant la liste : voir d'un coup d'oeil ou
 * en est chaque demande vaut plus que de gagner quelques pixels. Un menu
 * obligerait a ouvrir chaque ligne pour lire son etat suivant.
 *
 * L'etat courant reste affiche par l'etiquette a cote — ces boutons ne le
 * repetent pas, ils proposent la suite.
 */
const FLOW: { value: string; label: string }[] = [
  { value: 'new', label: 'Nouvelle' },
  { value: 'contacted', label: 'Contactée' },
  { value: 'qualified', label: 'Qualifiée' },
  { value: 'closed', label: 'Close' },
];

export function DemoStatusActions({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1">
      {pending && <Spinner className="size-3.5" />}

      {FLOW.filter((step) => step.value !== status).map((step) => (
        <button
          key={step.value}
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await setDemoRequestStatus(id, step.value);
            })
          }
          className={cn(
            'focus-ring text-muted-foreground hover:bg-surface-subtle hover:text-foreground',
            'cursor-pointer rounded-md border border-transparent px-1.5 py-0.5 text-[11px] font-medium transition-colors',
            'disabled:pointer-events-none disabled:opacity-50',
          )}
        >
          {step.label}
        </button>
      ))}
    </div>
  );
}
