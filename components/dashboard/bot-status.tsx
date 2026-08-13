import { cn } from '@/lib/utils';
import type { Dictionary } from '@/lib/i18n';

/** Pastille d'etat, cohérente partout où un assistant est affiché. */
const STYLES = {
  draft: { dot: 'bg-muted-foreground/50', text: 'text-muted-foreground' },
  crawling: { dot: 'bg-amber-500 animate-pulse', text: 'text-amber-600' },
  ready: { dot: 'bg-emerald-500', text: 'text-emerald-600' },
  error: { dot: 'bg-red-500', text: 'text-red-600' },
} as const;

export type BotStatus = keyof typeof STYLES;

export function BotStatusBadge({ status, dict }: { status: string; dict: Dictionary }) {
  const key: BotStatus = status in STYLES ? (status as BotStatus) : 'draft';
  const style = STYLES[key];

  return (
    <span
      className={cn(
        'bg-muted/70 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        style.text,
      )}
    >
      <span className={cn('size-1.5 rounded-full', style.dot)} aria-hidden />
      {dict.dashboard.status[key]}
    </span>
  );
}
