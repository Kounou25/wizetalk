import { cn } from '@/lib/utils';

/**
 * Ossature affichee pendant qu'une page se rend cote serveur.
 *
 * Elle reprend la silhouette du contenu reel — memes hauteurs, memes colonnes,
 * memes filets. Un squelette qui ne correspond pas a ce qui arrive produit un
 * sursaut de mise en page a l'affichage, ce qui est pire que l'attente.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('bg-border/70 animate-pulse rounded-md', className)} />;
}

export function PageHeaderSkeleton() {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-9 w-36" />
    </div>
  );
}

/** Bandeau d'indicateurs : une surface, des cellules separees par des filets. */
export function StatGroupSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="panel overflow-hidden">
      <div
        className={cn(
          'bg-border grid gap-px',
          count >= 4 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3',
        )}
      >
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="bg-surface flex flex-col gap-2.5 px-4 py-3.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Panneau a en-tete et lignes : liste d'assistants, prospects recents… */
export function ListPanelSkeleton({ rows = 4, lines = 2 }: { rows?: number; lines?: number }) {
  return (
    <div className="panel flex flex-col">
      <div className="border-border flex items-center justify-between border-b px-4 py-3.5">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="divide-border divide-y">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-40" />
              {lines > 1 && <Skeleton className="h-3 w-28" />}
            </div>
            <Skeleton className="h-5 w-16 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="panel flex flex-col">
      <div className="border-border flex items-center justify-between border-b px-4 py-3.5">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-7 w-36 rounded-lg" />
      </div>
      <div className="p-4">
        <Skeleton className="h-48 w-full" />
        <div className="border-border mt-3 flex items-center justify-between border-t pt-3">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

export function BotCardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="panel p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="border-border mt-4 flex items-center justify-between border-t pt-3">
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="panel flex flex-col gap-3 p-4">
      <Skeleton className="h-4 w-44" />
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className={index === lines - 1 ? 'h-3 w-2/3' : 'h-3 w-full'} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="panel divide-border flex flex-col divide-y">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
