import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import type { Dictionary, Locale } from '@/lib/i18n';
import { BotStatusBadge } from './bot-status';
import { SiteFavicon } from './site-favicon';
import { hostOf, initialOf, lastSyncLabel, type BotSummary } from './bot-summary';
import { Panel, PanelHeader, panelLinkClass } from './panel';

/**
 * Liste dense des assistants, pour la vue d'ensemble.
 *
 * Une liste et non une grille de cartes : sur une page de synthese, les
 * assistants sont une colonne a parcourir — nom, etat, derniere analyse
 * s'alignent verticalement et se comparent. La grille de cartes reste sur
 * `/dashboard/bots`, ou l'assistant est l'objet principal de la page.
 */
export function BotList({
  bots,
  locale,
  dict,
}: {
  bots: BotSummary[];
  locale: Locale;
  dict: Dictionary;
}) {
  const t = dict.dashboard.overview;

  return (
    <Panel className="flex flex-col">
      <PanelHeader
        title={t.yourBots}
        action={
          <Link href="/dashboard/bots" className={panelLinkClass}>
            {t.seeAll}
            <ChevronRight className="size-3.5" aria-hidden />
          </Link>
        }
      />

      <ul className="divide-border divide-y">
        {bots.map((bot) => (
          <li key={bot.id}>
            <Link
              href={`/dashboard/bots/${bot.id}`}
              className="focus-ring hover:bg-surface-subtle group flex items-center gap-3 px-4 py-3 transition-colors"
            >
              <SiteFavicon
                faviconUrl={bot.favicon_url}
                websiteUrl={bot.website_url}
                initial={initialOf(bot.name)}
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{bot.name}</p>
                <p className="text-muted-foreground truncate text-xs">{hostOf(bot.website_url)}</p>
              </div>

              {/* La date disparait avant l'etat quand la place manque : savoir
                  qu'un assistant est en erreur prime sur savoir quand. */}
              <span className="text-muted-foreground hidden shrink-0 text-xs tabular-nums lg:block">
                {lastSyncLabel(bot, locale, dict.dashboard.botCard)}
              </span>

              <BotStatusBadge status={bot.status} dict={dict} />

              <ChevronRight
                className="text-muted-foreground group-hover:text-foreground size-4 shrink-0 transition-colors"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
