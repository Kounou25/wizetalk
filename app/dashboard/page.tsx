import Link from 'next/link';
import { Bot, Plus } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { getActivitySeries } from '@/lib/database';
import { getDictionary } from '@/lib/i18n';
import { getRequestLocale } from '@/lib/i18n/server';
import { Button } from '@/components/ui/button';
import { StatCell, StatGroup, type StatDelta } from '@/components/dashboard/stat-card';
import { ActivityChart, type ActivityPoint } from '@/components/dashboard/activity-chart';
import { BotList } from '@/components/dashboard/bot-list';
import type { BotSummary } from '@/components/dashboard/bot-summary';
import { EmptyState } from '@/components/dashboard/empty-state';
import { PageHeader } from '@/components/dashboard/panel';
import { RecentLeads, type RecentLead } from '@/components/dashboard/recent-leads';

/** Profondeur de la serie chargee. Le selecteur de periode du graphique
 *  decoupe dedans sans repasser par le serveur. */
const HISTORY_DAYS = 90;

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
      .select('id, name, website_url, status, last_synced_at, favicon_url')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('pages').select('id', { count: 'exact', head: true }),
    supabase.from('conversations').select('id', { count: 'exact', head: true }),
    supabase.from('leads').select('id', { count: 'exact', head: true }),
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase
      .from('leads')
      .select('id, email, question, status, created_at, bot_id, bots(name)')
      .order('created_at', { ascending: false })
      .limit(5),
    getActivitySeries(supabase, HISTORY_DAYS),
  ]);

  const bots = (botsResult.data ?? []) as BotSummary[];
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

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={t.title}
        description={t.lead}
        action={
          bots.length > 0 && (
            <Button asChild className="bg-brand hover:bg-brand/90 text-brand-foreground">
              <Link href="/dashboard/bots/new">
                <Plus />
                {dict.dashboard.nav.newBot}
              </Link>
            </Button>
          )
        }
      />

      {bots.length > 0 ? (
        <>
          <StatGroup columns={4}>
            <StatCell label={t.assistants} value={bots.length} />
            <StatCell label={t.pages} value={pagesResult.count ?? 0} />
            <StatCell
              label={t.conversations}
              value={conversationsResult.count ?? 0}
              delta={weeklyDelta(activity, t.vsPrevious)}
            />
            <StatCell
              label={t.leads}
              value={leadsResult.count ?? 0}
              hint={pendingLeads > 0 ? `${pendingLeads} ${t.leadsPending}` : undefined}
            />
          </StatGroup>

          {/* Le graphique occupe les deux tiers, les prospects le dernier : on
              lit la tendance a gauche, ce qui reste a faire a droite. */}
          <div className="grid gap-5 lg:grid-cols-3">
            <ActivityChart
              data={activity}
              locale={locale}
              dict={dict}
              className="min-w-0 lg:col-span-2"
            />
            <RecentLeads leads={recentLeads} locale={locale} dict={dict} />
          </div>

          <BotList bots={bots} locale={locale} dict={dict} />
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
