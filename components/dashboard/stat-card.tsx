import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface StatDelta {
  /** Variation en pourcentage, arrondie. Negative pour une baisse. */
  percent: number;
  /** Periode de comparaison, ex. « par rapport aux 7 jours precedents ». */
  label: string;
}

const COLUMNS = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
} as const;

/**
 * Bandeau d'indicateurs.
 *
 * Une seule surface decoupee par des filets, plutot que des cartes flottantes
 * separees par du vide : les chiffres se lisent alors comme un ensemble, et
 * l'oeil compare au lieu de sauter d'un bloc a l'autre.
 *
 * Les filets viennent de `gap-px` sur un fond couleur bordure  ils suivent
 * donc le passage a la ligne, ce qu'une bordure par cellule ne fait pas.
 */
export function StatGroup({
  columns = 4,
  className,
  children,
}: {
  columns?: keyof typeof COLUMNS;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('panel overflow-hidden', className)}>
      <div className={cn('bg-border grid gap-px', COLUMNS[columns])}>{children}</div>
    </div>
  );
}

export function StatCell({
  label,
  value,
  hint,
  delta,
}: {
  label: string;
  value: string | number;
  hint?: string;
  delta?: StatDelta;
}) {
  return (
    <div className="bg-surface flex flex-col gap-2 px-4 py-3.5">
      <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
        {label}
      </p>

      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        {/* Chiffres a chasse fixe : alignes en colonne dans un bandeau, ils se
            comparent d'un coup d'oeil. Isoles, on prefererait le contraire. */}
        <p className="text-2xl leading-none font-semibold tracking-tight tabular-nums">
          {value}
        </p>
        {delta && <DeltaPill delta={delta} />}
      </div>

      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
    </div>
  );
}

/**
 * Variation par rapport a la periode precedente. La fleche double la couleur :
 * la hausse reste lisible sans distinguer le vert du rouge.
 */
function DeltaPill({ delta }: { delta: StatDelta }) {
  const flat = delta.percent === 0;
  const up = delta.percent > 0;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums',
        flat
          ? 'text-muted-foreground'
          : up
            ? 'text-emerald-700 dark:text-emerald-400'
            : 'text-red-700 dark:text-red-400',
      )}
    >
      {!flat &&
        (up ? (
          <ArrowUpRight className="size-3.5" aria-hidden />
        ) : (
          <ArrowDownRight className="size-3.5" aria-hidden />
        ))}
      {up ? '+' : ''}
      {delta.percent} %<span className="sr-only"> {delta.label}</span>
    </span>
  );
}
