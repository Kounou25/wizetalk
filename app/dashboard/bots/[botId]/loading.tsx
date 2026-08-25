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

      {/* La barre d'onglets : elle est presente quel que soit l'onglet ouvert,
          donc le squelette la montre aussi. */}
      <div className="border-border flex gap-4 border-b pb-2.5">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-4 w-24" />
        ))}
      </div>

      <CardSkeleton lines={3} />
      <CardSkeleton lines={2} />
    </div>
  );
}
