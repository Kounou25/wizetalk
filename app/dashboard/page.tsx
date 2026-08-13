import Link from 'next/link';
import { Bot, FileText, MessageSquare, Plus } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { getActivitySeries } from '@/lib/database';
import { getDictionary } from '@/lib/i18n';
import { getRequestLocale } from '@/lib/i18n/server';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/stat-card';
import { ActivityChart } from '@/components/dashboard/activity-chart';
import { EmptyState } from '@/components/dashboard/empty-state';
import { BotCard } from './bots/bot-card';

export default async function DashboardPage() {
  const supabase = await createClient();
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const t = dict.dashboard.overview;

  // Toutes ces lectures sont bornees par le RLS a l'utilisateur connecte.
  const [botsResult, pagesResult, conversationsResult, activity] = await Promise.all([
    supabase
      .from('bots')
      .select('id, name, website_url, status, last_synced_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('pages').select('id', { count: 'exact', head: true }),
    supabase.from('conversations').select('id', { count: 'exact', head: true }),
    getActivitySeries(supabase),
  ]);

  const bots = botsResult.data ?? [];
  const hasBots = bots.length > 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t.lead}</p>
        </div>
        {hasBots && (
          <Button asChild className="bg-brand hover:bg-brand/90 text-brand-foreground">
            <Link href="/dashboard/bots/new">
              <Plus />
              {dict.dashboard.nav.newBot}
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t.assistants} value={bots.length} icon={Bot} />
        <StatCard label={t.pages} value={pagesResult.count ?? 0} icon={FileText} />
        <StatCard
          label={t.conversations}
          value={conversationsResult.count ?? 0}
          icon={MessageSquare}
        />
      </div>

      {hasBots && <ActivityChart data={activity} locale={locale} dict={dict} />}

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{t.yourBots}</h2>
          {hasBots && (
            <Link
              href="/dashboard/bots"
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              {t.seeAll} →
            </Link>
          )}
        </div>

        {hasBots ? (
          <div className="grid gap-4 md:grid-cols-2">
            {bots.map((bot) => (
              <BotCard key={bot.id} bot={bot} locale={locale} dict={dict} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Bot}
            title={t.emptyTitle}
            description={t.emptyBody}
            action={
              <Button asChild className="bg-brand hover:bg-brand/90 text-brand-foreground">
                <Link href="/dashboard/bots/new">
                  <Plus />
                  {t.emptyCta}
                </Link>
              </Button>
            }
          />
        )}
      </section>
    </div>
  );
}
