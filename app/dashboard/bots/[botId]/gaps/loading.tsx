import { CardSkeleton, PageHeaderSkeleton } from '@/components/dashboard/skeleton';

export default function GapsLoading() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeaderSkeleton />
      <div className="flex flex-col gap-3">
        <CardSkeleton lines={3} />
        <CardSkeleton lines={2} />
        <CardSkeleton lines={3} />
      </div>
    </div>
  );
}
