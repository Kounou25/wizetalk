import { cn } from '@/lib/utils';

/**
 * Barre de progression.
 *
 * Les attributs ARIA sont portes ici plutot que laisses a l'appelant : une
 * jauge sans valeur annoncee n'existe pas pour un lecteur d'ecran, et c'est
 * l'oubli le plus courant.
 */
export function Progress({
  value,
  max = 100,
  label,
  tone = 'brand',
  className,
}: {
  value: number;
  max?: number;
  /** Ce que mesure la jauge, annonce a l'assistance technique. */
  label: string;
  tone?: 'brand' | 'warning' | 'danger';
  className?: string;
}) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;

  const fill = {
    brand: 'bg-brand',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
  }[tone];

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn('bg-surface-subtle border-border h-1.5 overflow-hidden rounded-full border', className)}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-300 ease-out', fill)}
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  );
}
