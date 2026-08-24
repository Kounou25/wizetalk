import {
  PageHeaderSkeleton,
  StatGroupSkeleton,
  TableSkeleton,
} from '@/components/dashboard/skeleton';

export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeaderSkeleton />
      <StatGroupSkeleton count={4} />
      <StatGroupSkeleton count={4} />
      <TableSkeleton rows={6} />
    </div>
  );
}
