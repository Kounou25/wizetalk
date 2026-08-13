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

  return (
    <Link
      href={`/dashboard/bots/${bot.id}`}
      className="group bg-background hover:ring-brand/30 flex flex-col rounded-xl p-5 shadow-sm ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:ring-white/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold">{bot.name}</p>
          <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
            <Globe className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{host}</span>
          </p>
        </div>
        <ArrowRight className="text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
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
