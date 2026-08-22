import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, FileText, Layers, MessageSquare } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { getBotStats } from '@/lib/database';
import { getDictionary } from '@/lib/i18n';
import { getRequestLocale } from '@/lib/i18n/server';
import { StatCard } from '@/components/dashboard/stat-card';
import { BotStatusBadge } from '@/components/dashboard/bot-status';
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
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/dashboard/bots"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
        >
          <ArrowLeft className="size-3.5" />
          {t.back}
        </Link>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight">{bot.name}</h1>
            <a
              href={bot.website_url}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground mt-1 inline-flex items-center gap-1.5 text-sm"
            >
              {bot.website_url}
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </div>
          <div className="flex items-center gap-2">
            {!bot.is_active && (
              <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs font-medium">
                {t.deactivated}
              </span>
            )}
            <BotStatusBadge status={bot.status} dict={dict} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t.pages} value={stats.pages} icon={FileText} />
        <StatCard label={t.sections} value={stats.chunks} icon={Layers} />
        <StatCard label={t.conversations} value={stats.conversations} icon={MessageSquare} />
      </div>

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
      className="bg-background hover:ring-brand/30 flex items-start justify-between gap-3 rounded-xl p-5 shadow-sm ring-1 ring-black/5 transition-all hover:-translate-y-0.5 hover:shadow-md dark:ring-white/10"
    >
      <div className="min-w-0">
        <p className="font-semibold">{title}</p>
        <p className="text-muted-foreground mt-0.5 text-sm text-pretty">{description}</p>
      </div>
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-sm font-semibold tabular-nums ${
          highlight ? 'bg-brand-soft text-brand' : 'bg-muted text-muted-foreground'
        }`}
      >
        {value}
      </span>
    </Link>
  );
}
