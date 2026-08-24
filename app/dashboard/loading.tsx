import {
  BotCardsSkeleton,
  HeroHeaderSkeleton,
  StatCardsSkeleton,
  Skeleton,
} from '@/components/dashboard/skeleton';

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      <HeroHeaderSkeleton />
      <StatCardsSkeleton count={4} />

      {/* Meme decoupage que la page rendue : graphique sur deux tiers,
          prospects sur le dernier. */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="panel p-5 sm:p-6 lg:col-span-2">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="mt-2 h-3 w-40" />
          <Skeleton className="mt-6 h-52 w-full" />
        </div>
        <div className="panel p-5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-2 h-3 w-48" />
          <div className="mt-5 flex flex-col gap-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="flex flex-col gap-2">
                <Skeleton className="h-3.5 w-44" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-36" />
        <BotCardsSkeleton count={4} />
      </div>
    </div>
  );
}
