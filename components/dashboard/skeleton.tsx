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

/** En-tete de la vue d'ensemble : bandeau, pas simple titre. */
export function HeroHeaderSkeleton() {
  return (
    <div className="panel flex flex-wrap items-end justify-between gap-4 p-6 sm:p-8">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-40" />
      </div>
    </div>
  );
}

export function StatCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      className={cn(
        'grid gap-4 sm:grid-cols-2',
        count >= 4 ? 'xl:grid-cols-4' : 'sm:grid-cols-3',
      )}
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="panel flex flex-col justify-between gap-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="size-9 shrink-0 rounded-xl" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

export function BotCardsSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="panel p-5">
          <div className="flex items-start gap-3">
            <Skeleton className="size-10 shrink-0 rounded-xl" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t pt-3">
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
    <div className="panel flex flex-col gap-3 p-6">
      <Skeleton className="h-4 w-44" />
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className={index === lines - 1 ? 'h-3 w-2/3' : 'h-3 w-full'} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="panel flex flex-col gap-3 p-5">
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
