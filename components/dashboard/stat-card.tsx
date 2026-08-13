import { cn } from '@/lib/utils';

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'bg-background rounded-xl p-5 shadow-sm ring-1 ring-black/5 dark:ring-white/10',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span className="bg-brand-soft text-brand flex size-9 shrink-0 items-center justify-center rounded-lg">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-muted-foreground text-sm">{label}</p>
          {/* Chiffres proportionnels : sur une valeur isolee de cette taille,
              les chiffres a chasse fixe donnent un rendu delave. */}
          <p className="text-xl font-bold">{value}</p>
        </div>
      </div>
      {hint && <p className="text-muted-foreground mt-3 text-xs">{hint}</p>}
    </div>
  );
}
