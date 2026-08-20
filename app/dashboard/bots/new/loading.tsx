import { CardSkeleton, PageHeaderSkeleton } from '@/components/dashboard/skeleton';

export default function NewBotLoading() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <PageHeaderSkeleton />
      <CardSkeleton lines={6} />
    </div>
  );
}
