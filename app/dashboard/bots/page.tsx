import Link from 'next/link';
import { Bot, Plus } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { getDictionary } from '@/lib/i18n';
import { getRequestLocale } from '@/lib/i18n/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { BotSummary } from '@/components/dashboard/bot-summary';
import { EmptyState } from '@/components/dashboard/empty-state';
import { PageHeader } from '@/components/dashboard/panel';
import { BotCard } from './bot-card';

export default async function BotsPage() {
  const supabase = await createClient();
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const t = dict.dashboard.botsList;

  const { data } = await supabase
    .from('bots')
    .select('id, name, website_url, status, last_synced_at')
    .order('created_at', { ascending: false });

  const bots = (data ?? []) as BotSummary[];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={t.title}
        description={t.lead}
        meta={bots.length > 0 ? <Badge>{bots.length}</Badge> : undefined}
        action={
          <Button asChild className="bg-brand hover:bg-brand/90 text-brand-foreground">
            <Link href="/dashboard/bots/new">
              <Plus />
              {dict.dashboard.nav.newBot}
            </Link>
          </Button>
        }
      />

      {bots.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {bots.map((bot) => (
            <BotCard key={bot.id} bot={bot} locale={locale} dict={dict} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bot}
          title={t.emptyTitle}
          description={dict.dashboard.overview.emptyBody}
          action={
            <Button asChild className="bg-brand hover:bg-brand/90 text-brand-foreground">
              <Link href="/dashboard/bots/new">
                <Plus />
                {dict.dashboard.overview.emptyCta}
              </Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
