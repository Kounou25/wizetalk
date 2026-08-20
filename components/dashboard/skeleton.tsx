import { cn } from '@/lib/utils';

/**
 * Ossature affichee pendant qu'une page se rend cote serveur.
 *
 * Elle reprend la silhouette du contenu reel — memes hauteurs, memes colonnes.
 * Un squelette qui ne correspond pas a ce qui arrive produit un sursaut de
 * mise en page a l'affichage, ce qui est pire que l'attente elle-meme.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('bg-muted animate-pulse rounded-lg', className)} />;
}

export function PageHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-7 w-52" />
      <Skeleton className="h-4 w-72" />
    </div>
  );
}

export function StatCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="bg-background rounded-xl p-5 shadow-sm ring-1 ring-black/5 dark:ring-white/10"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 shrink-0" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function BotCardsSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="bg-background rounded-xl p-5 shadow-sm ring-1 ring-black/5 dark:ring-white/10"
        >
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
          <div className="mt-5 flex items-center justify-between">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="bg-background flex flex-col gap-3 rounded-xl p-6 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
      <Skeleton className="h-4 w-44" />
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className={index === lines - 1 ? 'h-3 w-2/3' : 'h-3 w-full'} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-background flex flex-col gap-3 rounded-xl p-5 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-4">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
