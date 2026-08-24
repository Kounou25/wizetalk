import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ExternalLink } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { getBotStats } from '@/lib/database';
import { getDictionary } from '@/lib/i18n';
import { getRequestLocale } from '@/lib/i18n/server';
import { Badge } from '@/components/ui/badge';
import { StatCell, StatGroup } from '@/components/dashboard/stat-card';
import { BotStatusBadge } from '@/components/dashboard/bot-status';
import { BackLink, PageHeader } from '@/components/dashboard/panel';
import { BotWorkspace } from './bot-workspace';
import { DocumentsCard, type DocumentRow } from './documents-card';
import { InstallCard } from './install-card';
import { SettingsCard } from './settings-card';

export default async function BotPage({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = await params;
  const supabase = await createClient();
  const dict = getDictionary(await getRequestLocale());
  const t = dict.dashboard.botPage;

  // RLS : un bot qui n'appartient pas a l'utilisateur ressort simplement vide.
  const { data: bot } = await supabase
    .from('bots')
    .select(
      'id, name, website_url, status, last_synced_at, welcome_message, primary_color, position, is_active, lead_capture',
    )
    .eq('id', botId)
    .maybeSingle();

  if (!bot) notFound();

  const [stats, { data: documentRows }] = await Promise.all([
    getBotStats(supabase, botId),
    supabase
      .from('pages')
      .select('id, file_name, file_size, created_at')
      .eq('bot_id', botId)
      .eq('source', 'document')
      .order('created_at', { ascending: false }),
  ]);

  const documents: DocumentRow[] = (documentRows ?? []).map((row) => ({
    id: row.id as string,
    fileName: (row.file_name as string) ?? '—',
    fileSize: (row.file_size as number) ?? 0,
    createdAt: row.created_at as string,
  }));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <BackLink href="/dashboard/bots">{t.back}</BackLink>

        <PageHeader
          title={bot.name}
          meta={
            <>
              {!bot.is_active && <Badge>{t.deactivated}</Badge>}
              <BotStatusBadge status={bot.status} dict={dict} />
            </>
          }
          action={
            <a
              href={bot.website_url}
              target="_blank"
              rel="noreferrer"
              className="focus-ring text-muted-foreground hover:text-foreground border-border hover:border-border-strong inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors"
            >
              <span className="max-w-56 truncate">{bot.website_url}</span>
              <ExternalLink className="size-3.5 shrink-0" aria-hidden />
            </a>
          }
        />
      </div>

      <StatGroup columns={3}>
        <StatCell label={t.pages} value={stats.pages} />
        <StatCell label={t.sections} value={stats.chunks} />
        <StatCell label={t.conversations} value={stats.conversations} />
      </StatGroup>

      {/* La boucle, placee haut car c'est elle qui dit quoi faire ensuite :
          le visiteur laisse son adresse, vous voyez le trou dans votre
          contenu, vous le comblez, vous resynchronisez. */}
      <div className="grid gap-4 md:grid-cols-3">
        <ReportLink
          href={`/dashboard/bots/${bot.id}/leads`}
          title={t.leadsTitle}
          description={t.leadsDesc}
          value={stats.pendingLeads}
          highlight={stats.pendingLeads > 0}
        />
        <ReportLink
          href={`/dashboard/bots/${bot.id}/gaps`}
          title={t.gapsTitle}
          description={t.gapsDesc}
          value={stats.unanswered}
          highlight={stats.unanswered > 0}
        />
        <ReportLink
          href={`/dashboard/bots/${bot.id}/conversations`}
          title={t.conversations}
          description={t.conversationsDesc}
          value={stats.conversations}
        />
      </div>

      <BotWorkspace
        botId={bot.id}
        status={bot.status}
        lastSyncedAt={bot.last_synced_at}
        chunkCount={stats.chunks}
        dict={dict}
      />

      <DocumentsCard botId={bot.id} documents={documents} dict={dict} />

      <InstallCard botId={bot.id} dict={dict} />

      <SettingsCard
        botId={bot.id}
        name={bot.name}
        welcomeMessage={bot.welcome_message}
        primaryColor={bot.primary_color}
        position={bot.position}
        isActive={bot.is_active}
        leadCapture={bot.lead_capture}
        dict={dict}
      />
    </div>
  );
}

/** Raccourci vers un rapport, avec le nombre d'elements qui l'attendent. */
function ReportLink({
  href,
  title,
  description,
  value,
  highlight = false,
}: {
  href: string;
  title: string;
  description: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className="panel panel-interactive focus-ring group flex items-start justify-between gap-3 p-4"
    >
      <div className="min-w-0">
        <p className="flex items-center gap-1 text-sm font-semibold">
          {title}
          <ChevronRight
            className="text-muted-foreground group-hover:text-foreground size-3.5 transition-colors"
            aria-hidden
          />
        </p>
        <p className="text-muted-foreground mt-0.5 text-xs text-pretty">{description}</p>
      </div>
      <Badge variant={highlight ? 'brand' : 'neutral'} className="text-sm tabular-nums">
        {value}
      </Badge>
    </Link>
  );
}
