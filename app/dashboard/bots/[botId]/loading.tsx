import {
  CardSkeleton,
  PageHeaderSkeleton,
  Skeleton,
  StatGroupSkeleton,
} from '@/components/dashboard/skeleton';

export default function BotLoading() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeaderSkeleton />
      <StatGroupSkeleton count={3} />

      {/* Les trois cartes de rapports : prospects, questions, conversations. */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="panel flex items-start justify-between gap-3 p-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
            <Skeleton className="h-5 w-9 rounded-md" />
          </div>
        ))}
      </div>

      <CardSkeleton lines={2} />
      <CardSkeleton lines={4} />
    </div>
  );
}
