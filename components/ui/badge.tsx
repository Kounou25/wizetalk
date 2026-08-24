import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * Etiquette d'etat.
 *
 * Chaque variante porte un fond, un texte et une bordure accordes : c'est la
 * bordure qui la fait tenir sur un fond blanc comme sur un fond gris, sans
 * avoir a l'ajuster au cas par cas.
 */
const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-xs font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        neutral: 'bg-surface-subtle text-muted-foreground border-border',
        brand: 'bg-brand-soft text-brand border-brand/15',
        success:
          'border-emerald-600/15 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        warning: 'border-amber-600/15 bg-amber-500/10 text-amber-700 dark:text-amber-400',
        danger: 'border-red-600/15 bg-red-500/10 text-red-700 dark:text-red-400',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

/** Teinte du point d'etat, accordee a la variante. */
const DOT: Record<BadgeVariant, string> = {
  neutral: 'bg-muted-foreground/50',
  brand: 'bg-brand',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
};

export function Badge({
  variant = 'neutral',
  dot = false,
  pulse = false,
  className,
  children,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    /** Point de couleur devant le libelle. Il double la couleur, jamais seul. */
    dot?: boolean;
    /** Pour un etat transitoire : analyse en cours, envoi… */
    pulse?: boolean;
  }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            'size-1.5 shrink-0 rounded-full',
            DOT[variant ?? 'neutral'],
            pulse && 'animate-pulse',
          )}
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}
