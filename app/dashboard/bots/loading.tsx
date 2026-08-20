import { BotCardsSkeleton, PageHeaderSkeleton } from '@/components/dashboard/skeleton';

export default function BotsLoading() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeaderSkeleton />
      <BotCardsSkeleton count={4} />
    </div>
  );
}
