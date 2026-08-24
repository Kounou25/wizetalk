import type { Dictionary } from '@/lib/i18n';
import { Badge, type BadgeVariant } from '@/components/ui/badge';

/** Etat d'un assistant, rendu a l'identique partout ou il apparait. */
const STATUS: Record<string, { variant: BadgeVariant; pulse?: boolean }> = {
  draft: { variant: 'neutral' },
  crawling: { variant: 'warning', pulse: true },
  ready: { variant: 'success' },
  error: { variant: 'danger' },
};

export type BotStatus = 'draft' | 'crawling' | 'ready' | 'error';

export function BotStatusBadge({ status, dict }: { status: string; dict: Dictionary }) {
  const key: BotStatus = status in STATUS ? (status as BotStatus) : 'draft';
  const { variant, pulse } = STATUS[key]!;

  return (
    <Badge variant={variant} dot pulse={pulse}>
      {dict.dashboard.status[key]}
    </Badge>
  );
}
