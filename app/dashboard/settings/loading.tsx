import { CardSkeleton, PageHeaderSkeleton } from '@/components/dashboard/skeleton';

export default function SettingsLoading() {
  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <PageHeaderSkeleton action={false} />
      <CardSkeleton lines={4} />
      <CardSkeleton lines={1} />
      <CardSkeleton lines={4} />
      <CardSkeleton lines={3} />
    </div>
  );
}
