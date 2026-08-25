import {
  ListPanelSkeleton,
  PageHeaderSkeleton,
  StatGroupSkeleton,
  TableSkeleton,
} from '@/components/dashboard/skeleton';

export default function AdminBillingLoading() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeaderSkeleton action={false} />
      <StatGroupSkeleton count={4} />
      <TableSkeleton rows={6} />
      <ListPanelSkeleton rows={5} lines={1} />
    </div>
  );
}
