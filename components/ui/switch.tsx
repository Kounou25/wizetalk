'use client';

import { cn } from '@/lib/utils';

/**
 * Interrupteur accessible sans dependance.
 *
 * `role="switch"` + `aria-checked` : les lecteurs d'ecran annoncent l'etat, et
 * un <button> repond deja a Espace et Entree sans code supplementaire.
 */
export function Switch({
  checked,
  onCheckedChange,
  disabled,
  className,
  'aria-labelledby': labelledBy,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  'aria-labelledby'?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'focus-visible:ring-ring/50 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-brand' : 'bg-muted-foreground/30',
        className,
      )}
    >
      <span
        className={cn(
          'bg-background pointer-events-none block size-5 rounded-full shadow-sm transition-transform',
          checked ? 'translate-x-[1.375rem]' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}
