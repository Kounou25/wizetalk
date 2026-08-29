import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ExternalLink, Lock } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { getBotSeries, getBotSources, getBotStats } from '@/lib/database';
import { getDictionary, type Locale } from '@/lib/i18n';
import { getRequestLocale } from '@/lib/i18n/server';
import { Badge } from '@/components/ui/badge';
import { StatCell, StatGroup } from '@/components/dashboard/stat-card';
import { BotStatusBadge } from '@/components/dashboard/bot-status';
import { BackLink, PageHeader } from '@/components/dashboard/panel';
import { SiteFavicon } from '@/components/dashboard/site-favicon';
import { getLimitsFor } from '@/lib/plans-db';
import { logoPublicUrl } from '@/lib/bot-logo';
import { getPlan } from '@/lib/quotas';
import { TabNav, type TabItem } from '@/components/dashboard/tab-nav';
import { TrendChart } from '@/components/dashboard/trend-chart';
import { BotWorkspace } from './bot-workspace';
import { DocumentsCard, type DocumentRow } from './documents-card';
import { InstallCard } from './install-card';
import { SettingsCard, type WidgetLocale } from './settings-card';
import { UpgradeButton } from '@/components/dashboard/upgrade-button';
import { buildUpgradeOffer } from '@/lib/upgrade';

/**
 * Onglets de la fiche d'un assistant.
 *
 * Le regroupement suit la frequence d'usage, pas la structure technique :
 * l'installation ne se consulte qu'une fois, les connaissances se relancent
 * regulierement, et la suppression definitive est reléguee dans le dernier
 * onglet  a l'ecart des reglages courants, plutot qu'a un defilement d'eux.
 */
const TABS = ['apercu', 'connaissances', 'installation', 'parametres'] as const;
type Tab = (typeof TABS)[number];

function isTab(value: unknown): value is Tab {
  return typeof value === 'string' && (TABS as readonly string[]).includes(value);
}

export default async function BotPage({
  params,
  searchParams,
}: {
  params: Promise<{ botId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { botId } = await params;
  const query = await searchParams;
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const t = dict.dashboard.botPage;
  const tu = dict.dashboard.upgrade;
  const tag = locale === 'fr' ? 'fr-FR' : 'en-US';

  // Un onglet inconnu retombe sur le premier plutot que de rendre une page
  // vide : une URL tronquee ou un lien peri me doivent pas casser la fiche.
  const tab: Tab = isTab(query.onglet) ? query.onglet : 'apercu';

  const supabase = await createClient();

  // RLS : un bot qui n'appartient pas a l'utilisateur ressort simplement vide.
  const { data: bot } = await supabase
    .from('bots')
    .select(
      'id, name, website_url, status, last_synced_at, welcome_message, primary_color, position, is_active, lead_capture, notify_leads, hide_branding, widget_locale, favicon_url, logo_path, user_id',
    )
    .eq('id', botId)
    .maybeSingle();

  if (!bot) notFound();

  /*
   * Les documents ne sont lus que par l'onglet qui les affiche.
   *
   * C'est le principal gain de ce decoupage : la fiche ne paie plus, a chaque
   * visite, le cout de tout ce qu'elle pourrait montrer.
   */
  const plan = await getPlan(supabase, bot.user_id as string);

  const [stats, documents, series, sources, limits] = await Promise.all([
    getBotStats(supabase, botId),
    tab === 'connaissances' ? loadDocuments(supabase, botId) : Promise.resolve([]),
    tab === 'apercu' ? getBotSeries(supabase, botId) : Promise.resolve([]),
    tab === 'apercu' ? getBotSources(supabase, botId) : Promise.resolve(null),
    getLimitsFor(plan),
  ]);

  // L'indexation s'est arretee au plafond du palier.
  const pagesOffer =
    stats.pages >= limits.pages ? await buildUpgradeOffer(plan, 'pages') : null;

  // Calculee seulement pour l'onglet qui l'affiche, et seulement si verrouille.
  const brandingOffer =
    tab === 'parametres' && !limits.removeBranding
      ? await buildUpgradeOffer(plan, 'removeBranding')
      : null;

  const tc = dict.dashboard.chart;
  const chartLabels = {
    rangeLabel: tc.rangeLabel,
    range7: tc.range7,
    range30: tc.range30,
    range90: tc.range90,
    showTable: tc.showTable,
    hideTable: tc.hideTable,
    day: tc.day,
  };

  /*
   * Taux de reponse, calcule sur la periode chargee.
   *
   * Dit dans le sens qui interesse le proprietaire : il veut savoir ce que son
   * assistant sait faire, pas ce qu'il rate. Le back-office garde le taux de
   * refus  c'est un indicateur de sante produit, pas un argument client.
   *
   * `null` quand aucun message n'a encore ete echange : afficher « 0 % » sur
   * un assistant qui n'a jamais servi serait un reproche injustifie.
   */
  const totals = series.reduce(
    (sum, point) => ({
      messages: sum.messages + point.messages,
      refused: sum.refused + point.refused,
    }),
    { messages: 0, refused: 0 },
  );

  const answerRate =
    totals.messages > 0
      ? Math.round(((totals.messages - totals.refused) / totals.messages) * 100)
      : null;

  const tabs: TabItem[] = [
    { id: 'apercu', label: t.tabOverview, href: `/dashboard/bots/${bot.id}` },
    {
      id: 'connaissances',
      label: t.tabKnowledge,
      href: `/dashboard/bots/${bot.id}?onglet=connaissances`,
    },
    {
      id: 'installation',
      label: t.tabInstall,
      href: `/dashboard/bots/${bot.id}?onglet=installation`,
    },
    {
      id: 'parametres',
      label: t.tabSettings,
      href: `/dashboard/bots/${bot.id}?onglet=parametres`,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <BackLink href="/dashboard/bots">{t.back}</BackLink>

        <PageHeader
          title={bot.name}
          icon={
            <SiteFavicon
              faviconUrl={bot.favicon_url}
              websiteUrl={bot.website_url}
              initial={(bot.name.trim()[0] ?? '?').toUpperCase()}
              size="lg"
            />
          }
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

      {/* En-tete et indicateurs restent hors onglets : ils situent la fiche
          quel que soit l'onglet ouvert. */}
      <StatGroup columns={tab === 'apercu' ? 4 : 3}>
        <StatCell label={t.pages} value={stats.pages} />
        <StatCell label={t.sections} value={stats.chunks} />
        <StatCell label={t.conversations} value={stats.conversations} />
        {tab === 'apercu' && (
          <StatCell
            label={t.answerRate}
            value={answerRate === null ? '—' : `${answerRate} %`}
            hint={answerRate === null ? undefined : t.answerRateHint}
          />
        )}
      </StatGroup>

      {/*
        Plafond de pages atteint.

        On enonce un fait verifiable  l'indexation s'est arretee au plafond du
        palier  sans affirmer que des pages ont ete laissees de cote : le
        robot ne remonte pas cette information, et l'inventer serait vendre sur
        une crainte fabriquee.
      */}
      {pagesOffer && (
        <div className="border-border bg-surface-subtle flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3">
          <p className="text-muted-foreground min-w-0 text-sm text-pretty">
            {tu.capNotice.replace('{limit}', limits.pages.toLocaleString(tag))}
          </p>
          <UpgradeButton
            offer={pagesOffer}
            label={tu.capCta}
            locale={locale}
            dict={dict}
            variant="outline"
            size="sm"
            className="shrink-0"
          />
        </div>
      )}

      <TabNav items={tabs} active={tab} label={t.tabsLabel} />

      {tab === 'apercu' && (
        /* La boucle du produit : le visiteur laisse son adresse, vous voyez le
           trou dans votre contenu, vous le comblez, vous resynchronisez. */
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
            /* Le raccourci ne promet pas ce que le palier ne donne pas : il
               annonce l'avantage a debloquer plutot qu'un compteur qu'on ne
               pourra pas consulter. */
            description={limits.gapsReport ? t.gapsDesc : t.gapsLocked}
            value={stats.unanswered}
            highlight={limits.gapsReport && stats.unanswered > 0}
            locked={!limits.gapsReport}
          />
          <ReportLink
            href={`/dashboard/bots/${bot.id}/conversations`}
            title={t.conversations}
            description={t.conversationsDesc}
            value={stats.conversations}
          />
        </div>
      )}

      {tab === 'apercu' && (
        <>
          <TrendChart
            title={t.activityTitle}
            description={t.activityLead}
            points={series}
            labels={chartLabels}
            locale={locale}
            series={[
              { key: 'conversations', label: tc.conversations, color: 'var(--series-1)' },
              { key: 'messages', label: tc.messages, color: 'var(--series-2)' },
            ]}
          />

          <div className="grid gap-5 lg:grid-cols-3">
            {/* La boucle du produit, vue de l'interieur : ce que le site ne
                dit pas encore, et ce que ca rapporte quand meme. */}
            <TrendChart
              title={t.loopTitle}
              description={t.loopLead}
              points={series}
              labels={chartLabels}
              locale={locale}
              className="min-w-0 lg:col-span-2"
              series={[
                { key: 'refused', label: tc.refused, color: 'var(--series-2)' },
                { key: 'leads', label: tc.leads, color: 'var(--series-3)' },
              ]}
            />

            {sources && (
              <SourcesPanel
                website={sources.website}
                documents={sources.documents}
                labels={{
                  title: t.sourcesTitle,
                  website: t.sourceWebsite,
                  documents: t.sourceDocuments,
                  empty: t.sourcesEmpty,
                }}
                locale={locale}
              />
            )}
          </div>
        </>
      )}

      {tab === 'connaissances' && (
        <>
          {/* Analyse, documents, puis verification : c'est l'ordre du geste —
              on alimente l'assistant, puis on controle ce qu'il a retenu. */}
          <BotWorkspace
            botId={bot.id}
            status={bot.status}
            lastSyncedAt={bot.last_synced_at}
            chunkCount={stats.chunks}
            dict={dict}
          />
          <DocumentsCard botId={bot.id} documents={documents} locale={locale} dict={dict} />
        </>
      )}

      {tab === 'installation' && <InstallCard botId={bot.id} dict={dict} />}

      {tab === 'parametres' && (
        <SettingsCard
          botId={bot.id}
          name={bot.name}
          welcomeMessage={bot.welcome_message ?? ''}
          primaryColor={bot.primary_color}
          logoUrl={logoPublicUrl(bot.logo_path as string | null)}
          position={bot.position}
          isActive={bot.is_active}
          leadCapture={bot.lead_capture}
          notifyLeads={bot.notify_leads ?? true}
          widgetLocale={(bot.widget_locale ?? 'auto') as WidgetLocale}
          hideBranding={bot.hide_branding ?? true}
          canRemoveBranding={limits.removeBranding}
          brandingOffer={brandingOffer}
          locale={locale}
          dict={dict}
        />
      )}
    </div>
  );
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
async function loadDocuments(supabase: any, botId: string): Promise<DocumentRow[]> {
  const { data } = await supabase
    .from('pages')
    .select('id, file_name, file_size, created_at')
    .eq('bot_id', botId)
    .eq('source', 'document')
    .order('created_at', { ascending: false });

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  return ((data ?? []) as any[]).map((row) => ({
    id: row.id as string,
    fileName: (row.file_name as string) ?? '—',
    fileSize: (row.file_size as number) ?? 0,
    createdAt: row.created_at as string,
  }));
}

/** Raccourci vers un rapport, avec le nombre d'elements qui l'attendent. */
function ReportLink({
  href,
  title,
  description,
  value,
  highlight = false,
  locked = false,
}: {
  href: string;
  title: string;
  description: string;
  value: number;
  highlight?: boolean;
  /** Le palier n'inclut pas ce rapport : le lien mene a l'explication. */
  locked?: boolean;
}) {
  return (
    <Link
      href={href}
      className="panel panel-interactive focus-ring group flex items-start justify-between gap-3 p-4"
    >
      <div className="min-w-0">
        <p className="flex items-center gap-1 text-sm font-semibold">
          {title}
          {locked ? (
            <Lock className="text-muted-foreground size-3.5" aria-hidden />
          ) : (
            <ChevronRight
              className="text-muted-foreground group-hover:text-foreground size-3.5 transition-colors"
              aria-hidden
            />
          )}
        </p>
        <p className="text-muted-foreground mt-0.5 text-xs text-pretty">{description}</p>
      </div>
      {!locked && (
        <Badge variant={highlight ? 'brand' : 'neutral'} className="text-sm tabular-nums">
          {value}
        </Badge>
      )}
    </Link>
  );
}

/**
 * Repartition des connaissances : ce que l'assistant a lu, et d'ou.
 *
 * En barres et non en camembert : comparer deux longueurs alignees sur une
 * meme base est une tache visuelle plus fiable que comparer deux angles, et le
 * libelle reste lisible sans legende separee.
 */
function SourcesPanel({
  website,
  documents,
  labels,
  locale,
}: {
  website: number;
  documents: number;
  labels: { title: string; website: string; documents: string; empty: string };
  locale: Locale;
}) {
  const total = website + documents;
  const tag = locale === 'fr' ? 'fr-FR' : 'en-US';

  const rows = [
    { label: labels.website, value: website, color: 'bg-brand' },
    { label: labels.documents, value: documents, color: 'bg-[var(--series-3)]' },
  ];

  return (
    <section className="panel viz-root flex flex-col">
      <div className="border-border flex items-baseline justify-between border-b px-4 py-3.5">
        <h2 className="text-sm font-semibold">{labels.title}</h2>
        <span className="text-muted-foreground text-xs tabular-nums">
          {total.toLocaleString(tag)}
        </span>
      </div>

      {total === 0 ? (
        <p className="text-muted-foreground p-4 text-sm">{labels.empty}</p>
      ) : (
        <ul className="flex flex-col gap-3.5 p-4">
          {rows.map((row) => {
            const share = (row.value / total) * 100;

            return (
              <li key={row.label} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate">{row.label}</span>
                  <span className="shrink-0 tabular-nums">
                    {row.value.toLocaleString(tag)}
                    <span className="text-muted-foreground text-xs">
                      {' · '}
                      {share.toFixed(0)} %
                    </span>
                  </span>
                </div>
                <div className="bg-surface-subtle border-border h-1.5 overflow-hidden rounded-full border">
                  <div
                    className={`h-full rounded-full ${row.color}`}
                    style={{ width: `${share}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
