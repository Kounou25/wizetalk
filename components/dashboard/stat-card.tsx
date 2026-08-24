import { Minus, TrendingDown, TrendingUp } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * Teintes disponibles pour l'icone d'un indicateur.
 *
 * La couleur ne porte aucune information : elle sert uniquement a distinguer
 * les cartes d'une rangee. Le libelle reste la seule source de sens.
 */
const TONES = {
  brand: 'bg-brand-soft text-brand',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
} as const;

export type StatTone = keyof typeof TONES;

export interface StatDelta {
  /** Variation en pourcentage, arrondie. Negative pour une baisse. */
  percent: number;
  /** Periode de comparaison, ex. « vs 7 jours precedents ». */
  label: string;
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'brand',
  delta,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: StatTone;
  delta?: StatDelta;
  className?: string;
}) {
  return (
    <div className={cn('panel flex flex-col justify-between gap-4 p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-muted-foreground text-sm font-medium">{label}</p>
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-xl',
            TONES[tone],
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>

      <div>
        {/* Chiffres proportionnels : sur une valeur isolee de cette taille,
            les chiffres a chasse fixe donnent un rendu delave. */}
        <p className="text-3xl leading-none font-bold tracking-tight">{value}</p>

        {(delta || hint) && (
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
            {delta && <DeltaPill delta={delta} />}
            {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Pastille de variation. La fleche double la couleur : une hausse doit rester
 * lisible sans distinguer le vert du rouge.
 */
function DeltaPill({ delta }: { delta: StatDelta }) {
  const direction = delta.percent > 0 ? 'up' : delta.percent < 0 ? 'down' : 'flat';

  const style = {
    up: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    down: 'bg-red-500/10 text-red-700 dark:text-red-400',
    flat: 'bg-muted text-muted-foreground',
  }[direction];

  const Arrow = { up: TrendingUp, down: TrendingDown, flat: Minus }[direction];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums',
        style,
      )}
      title={delta.label}
    >
      <Arrow className="size-3" aria-hidden />
      {delta.percent > 0 ? '+' : ''}
      {delta.percent} %
      <span className="sr-only"> {delta.label}</span>
    </span>
  );
}
