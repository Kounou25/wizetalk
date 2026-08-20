import {
  CardSkeleton,
  PageHeaderSkeleton,
  StatCardsSkeleton,
  Skeleton,
} from '@/components/dashboard/skeleton';

export default function BotLoading() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeaderSkeleton />
      <StatCardsSkeleton />

      {/* Les trois cartes de rapports : prospects, questions, conversations. */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="bg-background flex items-start justify-between gap-3 rounded-xl p-5 shadow-sm ring-1 ring-black/5 dark:ring-white/10"
          >
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
            <Skeleton className="h-6 w-10 rounded-full" />
          </div>
        ))}
      </div>

      <CardSkeleton lines={2} />
      <CardSkeleton lines={4} />
    </div>
  );
}
