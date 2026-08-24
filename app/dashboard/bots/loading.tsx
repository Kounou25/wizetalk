import { BotCardsSkeleton, PageHeaderSkeleton } from '@/components/dashboard/skeleton';

export default function BotsLoading() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeaderSkeleton />
      <BotCardsSkeleton count={6} />
    </div>
  );
}
