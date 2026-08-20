import {
  BotCardsSkeleton,
  CardSkeleton,
  PageHeaderSkeleton,
  StatCardsSkeleton,
  Skeleton,
} from '@/components/dashboard/skeleton';

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeaderSkeleton />
      <StatCardsSkeleton />
      {/* Le graphique d'activite : meme hauteur que le rendu final. */}
      <CardSkeleton lines={0} />
      <div className="bg-background rounded-xl p-6 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="mt-6 h-44 w-full" />
      </div>
      <BotCardsSkeleton />
    </div>
  );
}
