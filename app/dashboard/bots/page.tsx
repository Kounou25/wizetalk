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

  const list = bots ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* Meme bandeau que la vue d'ensemble : les deux pages principales du
          tableau de bord s'ouvrent de la meme facon. */}
      <header className="panel hero-sheen animate-rise relative overflow-hidden p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.title}</h1>
              {list.length > 0 && (
                <span className="bg-brand-soft text-brand rounded-full px-2 py-0.5 text-xs font-bold tabular-nums">
                  {list.length}
                </span>
              )}
            </div>
            <p className="text-muted-foreground mt-1.5 text-sm text-pretty">{t.lead}</p>
          </div>

          <Button asChild className="bg-brand hover:bg-brand/90 text-brand-foreground">
            <Link href="/dashboard/bots/new">
              <Plus />
              {dict.dashboard.nav.newBot}
            </Link>
          </Button>
        </div>
      </header>

      {list.length > 0 ? (
        <div
          className="animate-rise grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          style={{ animationDelay: '60ms' }}
        >
          {list.map((bot) => (
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
