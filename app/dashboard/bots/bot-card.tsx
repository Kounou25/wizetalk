import Link from 'next/link';
import { ArrowRight, Globe } from 'lucide-react';

import type { Dictionary, Locale } from '@/lib/i18n';
import { Avatar } from '@/components/ui/avatar';
import { BotStatusBadge } from '@/components/dashboard/bot-status';
import {
  hostOf,
  initialOf,
  lastSyncLabel,
  type BotSummary,
} from '@/components/dashboard/bot-summary';

export type { BotSummary };

/**
 * Carte d'assistant, pour la galerie `/dashboard/bots`.
 *
 * La vue d'ensemble utilise `BotList` : une liste s'y parcourt mieux. Ici
 * l'assistant est l'objet de la page, la carte lui donne la place qu'il merite.
 */
export function BotCard({
  bot,
  locale,
  dict,
}: {
  bot: BotSummary;
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <Link
      href={`/dashboard/bots/${bot.id}`}
      className="panel panel-interactive focus-ring group flex flex-col p-4"
    >
      <div className="flex items-start gap-3">
        <Avatar initials={initialOf(bot.name)} size="lg" />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{bot.name}</p>
          <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
            <Globe className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{hostOf(bot.website_url)}</span>
          </p>
        </div>

        <ArrowRight
          className="text-muted-foreground group-hover:text-foreground mt-0.5 size-4 shrink-0 transition-colors"
          aria-hidden
        />
      </div>

      {/* Filet de separation : l'etat et la date sont des metadonnees, pas la
          suite du titre. */}
      <div className="border-border mt-4 flex items-center justify-between gap-3 border-t pt-3">
        <BotStatusBadge status={bot.status} dict={dict} />
        <span className="text-muted-foreground truncate text-xs tabular-nums">
          {lastSyncLabel(bot, locale, dict.dashboard.botCard)}
        </span>
      </div>
    </Link>
  );
}
