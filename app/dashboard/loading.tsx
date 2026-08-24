import {
  ChartSkeleton,
  ListPanelSkeleton,
  PageHeaderSkeleton,
  StatGroupSkeleton,
} from '@/components/dashboard/skeleton';

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeaderSkeleton />
      <StatGroupSkeleton count={4} />

      {/* Meme decoupage que la page rendue : graphique sur deux tiers,
          prospects sur le dernier. */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <ChartSkeleton />
        </div>
        <ListPanelSkeleton rows={5} />
      </div>

      <ListPanelSkeleton rows={5} lines={2} />
    </div>
  );
}
