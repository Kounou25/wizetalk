import Link from 'next/link';
import { Bot, Plus } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { getDictionary } from '@/lib/i18n';
import { getRequestLocale } from '@/lib/i18n/server';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/dashboard/empty-state';
import { BotCard } from './bot-card';

export default async function BotsPage() {
  const supabase = await createClient();
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const t = dict.dashboard.botsList;

  const { data: bots } = await supabase
    .from('bots')
    .select('id, name, website_url, status, last_synced_at')
    .order('created_at', { ascending: false });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t.lead}</p>
        </div>
        <Button asChild className="bg-brand hover:bg-brand/90 text-brand-foreground">
          <Link href="/dashboard/bots/new">
            <Plus />
            {dict.dashboard.nav.newBot}
          </Link>
        </Button>
      </div>

      {bots && bots.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
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
