import { CardSkeleton, ListPanelSkeleton, PageHeaderSkeleton } from '@/components/dashboard/skeleton';

export default function HelpLoading() {
  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <PageHeaderSkeleton action={false} />
      <ListPanelSkeleton rows={3} lines={2} />
      <ListPanelSkeleton rows={5} lines={1} />
      <CardSkeleton lines={2} />
    </div>
  );
}
