import { CardSkeleton, PageHeaderSkeleton } from '@/components/dashboard/skeleton';

export default function AdminPlansLoading() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeaderSkeleton action={false} />
      {Array.from({ length: 4 }, (_, index) => (
        <CardSkeleton key={index} lines={4} />
      ))}
    </div>
  );
}
