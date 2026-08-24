import Link from 'next/link';
import { ArrowRight, Globe } from 'lucide-react';
import type { Dictionary, Locale } from '@/lib/i18n';
import { BotStatusBadge } from '@/components/dashboard/bot-status';

export interface BotSummary {
  id: string;
  name: string;
  website_url: string;
  status: string;
  last_synced_at: string | null;
}

export function BotCard({
  bot,
  locale,
  dict,
}: {
  bot: BotSummary;
  locale: Locale;
  dict: Dictionary;
}) {
  const t = dict.dashboard.botCard;

  const host = (() => {
    try {
      return new URL(bot.website_url).hostname.replace(/^www\./, '');
    } catch {
      return bot.website_url;
    }
  })();

  // Initiale plutot qu'un favicon distant : pas de requete vers un tiers, et
  // la carte s'affiche complete des le premier rendu.
  const initial = (bot.name.trim()[0] ?? '?').toUpperCase();

  return (
    <Link
      href={`/dashboard/bots/${bot.id}`}
      className="panel panel-hover group flex flex-col p-5"
    >
      <div className="flex items-start gap-3">
        <span
          className="bg-brand-soft text-brand flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
          aria-hidden
        >
          {initial}
        </span>

        <div className="min-w-0 flex-1">
          <p className="group-hover:text-brand truncate font-semibold transition-colors">
            {bot.name}
          </p>
          <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-sm">
            <Globe className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{host}</span>
          </p>
        </div>

        <ArrowRight className="text-muted-foreground group-hover:text-brand mt-1 size-4 shrink-0 transition-all group-hover:translate-x-0.5" />
      </div>

      {/* Trait de separation : l'etat et la date sont des metadonnees, pas la
          suite du titre. */}
      <div className="border-border mt-4 flex items-center justify-between gap-3 border-t pt-3">
        <BotStatusBadge status={bot.status} dict={dict} />
        <span className="text-muted-foreground text-xs">
          {bot.last_synced_at
            ? `${t.analysedOn} ${new Date(bot.last_synced_at).toLocaleDateString(
                locale === 'fr' ? 'fr-FR' : 'en-US',
              )}`
            : t.neverAnalysed}
        </span>
      </div>
    </Link>
  );
}
