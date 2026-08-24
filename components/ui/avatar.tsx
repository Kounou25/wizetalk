import { cn } from '@/lib/utils';

const SIZES = {
  sm: 'size-7 text-[11px]',
  md: 'size-8 text-xs',
  lg: 'size-10 text-sm',
} as const;

/**
 * Pastille d'initiales.
 *
 * Ni photo ni favicon distant : le tableau de bord ne fait aucune requete vers
 * un tiers pour s'afficher, et la carte est complete des le premier rendu.
 */
export function Avatar({
  initials,
  size = 'md',
  tone = 'brand',
  className,
}: {
  initials: string;
  size?: keyof typeof SIZES;
  tone?: 'brand' | 'neutral';
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold select-none',
        SIZES[size],
        tone === 'brand'
          ? 'bg-brand-soft text-brand'
          : 'bg-surface-subtle text-muted-foreground border-border border',
        className,
      )}
    >
      {initials}
    </span>
  );
}
