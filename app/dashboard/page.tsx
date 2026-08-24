import Link from 'next/link';
import { Bot, FileText, Mail, MessageSquare, Plus } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { getActivitySeries } from '@/lib/database';
import { getDictionary } from '@/lib/i18n';
import { getRequestLocale } from '@/lib/i18n/server';
import { Button } from '@/components/ui/button';
import { StatCard, type StatDelta } from '@/components/dashboard/stat-card';
import { ActivityChart, type ActivityPoint } from '@/components/dashboard/activity-chart';
import { EmptyState } from '@/components/dashboard/empty-state';
import { panelLinkClass } from '@/components/dashboard/panel';
import { RecentLeads, type RecentLead } from '@/components/dashboard/recent-leads';
import { BotCard } from './bots/bot-card';

/** Ligne de `leads` jointe au nom de son assistant. */
interface RecentLeadRow {
  id: string;
  email: string;
  question: string;
  status: 'new' | 'handled';
  created_at: string;
  bot_id: string;
  // PostgREST rend l'objet joint, ou un tableau selon la forme de la relation.
  bots: { name: string } | { name: string }[] | null;
}

/**
 * Variation des sept derniers jours par rapport aux sept precedents.
 *
 * Sans base de comparaison (semaine precedente vide), on n'affiche rien :
 * « +100 % » sur un depart de zero ne veut rien dire et fausse la lecture.
 */
function weeklyDelta(activity: ActivityPoint[], label: string): StatDelta | undefined {
  const sum = (points: ActivityPoint[]) =>
    points.reduce((total, point) => total + point.conversations, 0);

  const current = sum(activity.slice(-7));
  const previous = sum(activity.slice(-14, -7));

  if (previous === 0) return undefined;

  return { percent: Math.round(((current - previous) / previous) * 100), label };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const t = dict.dashboard.overview;

  // Toutes ces lectures sont bornees par le RLS a l'utilisateur connecte.
  const [
    botsResult,
    pagesResult,
    conversationsResult,
    leadsResult,
    pendingLeadsResult,
    recentLeadsResult,
    activity,
  ] = await Promise.all([
    supabase
      .from('bots')
      .select('id, name, website_url, status, last_synced_at')
      .order('created_at', { ascending: false })
      .limit(4),
    supabase.from('pages').select('id', { count: 'exact', head: true }),
    supabase.from('conversations').select('id', { count: 'exact', head: true }),
    supabase.from('leads').select('id', { count: 'exact', head: true }),
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase
      .from('leads')
      .select('id, email, question, status, created_at, bot_id, bots(name)')
      .order('created_at', { ascending: false })
      .limit(4),
    getActivitySeries(supabase),
  ]);

  const bots = botsResult.data ?? [];
  const hasBots = bots.length > 0;
  const pendingLeads = pendingLeadsResult.count ?? 0;

  const recentLeads: RecentLead[] = ((recentLeadsResult.data ?? []) as RecentLeadRow[]).map(
    (row) => ({
      id: row.id,
      email: row.email,
      question: row.question,
      status: row.status,
      createdAt: row.created_at,
      botId: row.bot_id,
      botName: (Array.isArray(row.bots) ? row.bots[0]?.name : row.bots?.name) ?? '',
    }),
  );

  // Date du jour en en-tete : elle situe la lecture des chiffres qui suivent.
  const today = new Date().toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="panel hero-sheen animate-rise relative overflow-hidden p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              {today}
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{t.title}</h1>
            <p className="text-muted-foreground mt-1.5 max-w-md text-sm text-pretty">
              {t.lead}
            </p>
          </div>

          {hasBots && (
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/dashboard/bots">{t.yourBots}</Link>
              </Button>
              <Button asChild className="bg-brand hover:bg-brand/90 text-brand-foreground">
                <Link href="/dashboard/bots/new">
                  <Plus />
                  {dict.dashboard.nav.newBot}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      {hasBots ? (
        <>
          {/* Les quatre chiffres qui resument le compte. Ils tiennent sur une
              ligne des le format tablette : c'est la premiere chose lue. */}
          <div
            className="animate-rise grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            style={{ animationDelay: '60ms' }}
          >
            <StatCard label={t.assistants} value={bots.length} icon={Bot} tone="brand" />
            <StatCard
              label={t.pages}
              value={pagesResult.count ?? 0}
              icon={FileText}
              tone="violet"
            />
            <StatCard
              label={t.conversations}
              value={conversationsResult.count ?? 0}
              icon={MessageSquare}
              tone="emerald"
              delta={weeklyDelta(activity, t.vsPrevious)}
            />
            <StatCard
              label={t.leads}
              value={leadsResult.count ?? 0}
              icon={Mail}
              tone="amber"
              hint={pendingLeads > 0 ? `${pendingLeads} ${t.leadsPending}` : undefined}
            />
          </div>

          {/* Le graphique occupe les deux tiers, les prospects le dernier :
              on lit la tendance a gauche, ce qui reste a faire a droite. */}
          <div
            className="animate-rise grid gap-4 lg:grid-cols-3"
            style={{ animationDelay: '120ms' }}
          >
            <ActivityChart
              data={activity}
              locale={locale}
              dict={dict}
              className="min-w-0 lg:col-span-2"
            />
            <RecentLeads leads={recentLeads} locale={locale} dict={dict} />
          </div>

          <section
            className="animate-rise flex flex-col gap-4"
            style={{ animationDelay: '180ms' }}
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-semibold">{t.yourBots}</h2>
              <Link href="/dashboard/bots" className={panelLinkClass}>
                {t.seeAll} →
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {bots.map((bot) => (
                <BotCard key={bot.id} bot={bot} locale={locale} dict={dict} />
              ))}
            </div>
          </section>
        </>
      ) : (
        /* Compte neuf : des compteurs a zero n'apprennent rien. On ne montre
           que l'action qui fait avancer. */
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
    </div>
  );
}
