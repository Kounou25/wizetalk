import { BotCardsSkeleton, HeroHeaderSkeleton } from '@/components/dashboard/skeleton';

export default function BotsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <HeroHeaderSkeleton />
      <BotCardsSkeleton count={6} />
    </div>
  );
}
