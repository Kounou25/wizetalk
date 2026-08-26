import Link from 'next/link';
import { ChevronRight, ShieldCheck } from 'lucide-react';

import { requireAdmin } from '@/lib/admin/guard';
import {
  computeBillingStats,
  getBotBreakdown,
  getPlatformSeries,
  getPlatformStats,
  listBots,
  listSubscriptions,
  type Breakdown,
} from '@/lib/admin/queries';
import type { PlanId } from '@/lib/plans';
import { StatCell, StatGroup } from '@/components/dashboard/stat-card';
import { BotStatusBadge } from '@/components/dashboard/bot-status';
import { PageHeader, panelLinkClass } from '@/components/dashboard/panel';
import { TrendChart } from '@/components/dashboard/trend-chart';
import { getDictionary } from '@/lib/i18n';

const PLAN_LABELS: Record<PlanId, string> = {
  trial: 'Essai',
  essential: 'Essentiel',
  growth: 'Croissance',
  business: 'Entreprise',
};

export default async function AdminOverviewPage() {
  // Le layout a deja verifie, mais requireAdmin() est ce qui rend le client
  // privilegie : impossible de lire ces donnees sans repasser le controle.
  const { db } = await requireAdmin();

  const [stats, bots, series, botBreakdown, subscriptions] = await Promise.all([
    getPlatformStats(db),
    listBots(db, 8),
    getPlatformSeries(db),
    getBotBreakdown(db),
    listSubscriptions(db),
  ]);

  const dict = getDictionary('fr');

  /* Le back-office ne s'adresse qu'a l'equipe : libelles en francais, pris du
     dictionnaire la ou il en a deja. */
  const chartLabels = {
    rangeLabel: dict.dashboard.chart.rangeLabel,
    range7: dict.dashboard.chart.range7,
    range30: dict.dashboard.chart.range30,
    range90: dict.dashboard.chart.range90,
    showTable: dict.dashboard.chart.showTable,
    hideTable: dict.dashboard.chart.hideTable,
    day: dict.dashboard.chart.day,
  };
  const billing = computeBillingStats(subscriptions);

  const refusalRate =
    stats.messages > 0 ? ((stats.unanswered / stats.messages) * 100).toFixed(1) : '0';

  const planBreakdown: Breakdown[] = (
    ['essential', 'growth', 'business'] as PlanId[]
  )
    .map((plan) => ({ label: PLAN_LABELS[plan], value: billing.perPlan[plan] ?? 0 }))
    .concat({ label: PLAN_LABELS.trial, value: billing.trials })
    .filter((row) => row.value > 0);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Vue d'ensemble"
        description="L'état de la plateforme, tous comptes confondus."
      />

      <StatGroup columns={4}>
        <StatCell label="Comptes" value={stats.users} hint={`${billing.trials} en essai`} />
        <StatCell label="Assistants" value={stats.bots} hint={`${stats.activeBots} actifs`} />
        <StatCell label="Conversations" value={stats.conversations} />
        <StatCell
          label="Revenu mensuel"
          value={`${billing.mrr.toLocaleString('fr-FR')} $`}
          hint={`${billing.active} abonnement${billing.active > 1 ? 's' : ''} actif${
            billing.active > 1 ? 's' : ''
          }`}
        />
      </StatGroup>

      <StatGroup columns={4}>
        <StatCell label="Pages indexées" value={stats.pages} />
        <StatCell label="Sections" value={stats.chunks} />
        <StatCell label="Messages" value={stats.messages} />
        <StatCell
          label="Sans réponse"
          value={stats.unanswered}
          hint={`${refusalRate} % des messages`}
        />
      </StatGroup>

      {/*
        Trois courbes, trois questions distinctes :
        le produit tourne-t-il, l'acquisition avance-t-elle, la boucle de
        recuperation fonctionne-t-elle. Les empiler dans un seul graphique
        melangerait des ordres de grandeur sans rapport.
      */}
      <TrendChart
        title="Activité de la plateforme"
        description="Échanges traités par tous les assistants."
        points={series}
        labels={chartLabels}
        series={[
          { key: 'conversations', label: 'Conversations', color: 'var(--series-1)' },
          { key: 'messages', label: 'Messages', color: 'var(--series-2)' },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <TrendChart
          title="Croissance"
          description="Nouveaux comptes et nouveaux assistants."
          points={series}
          labels={chartLabels}
          series={[
            { key: 'signups', label: 'Inscriptions', color: 'var(--series-3)' },
            { key: 'bots', label: 'Assistants créés', color: 'var(--series-4)' },
          ]}
        />

        <TrendChart
          title="La boucle de récupération"
          description="Questions sans réponse, et prospects récupérés en face."
          points={series}
          labels={chartLabels}
          series={[
            { key: 'refused', label: 'Sans réponse', color: 'var(--series-2)' },
            { key: 'leads', label: 'Prospects', color: 'var(--series-1)' },
          ]}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <BreakdownPanel title="Répartition des plans" rows={planBreakdown} />
        <BreakdownPanel title="État des assistants" rows={botBreakdown} />
      </div>

      {/*
        Le taux de refus est l'indicateur de sante du produit : s'il grimpe,
        soit le seuil de similarite est trop haut, soit les sites indexes sont
        trop pauvres. C'est le premier chiffre a surveiller.
      */}
      <section className="panel p-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-brand size-4" aria-hidden />
          <h2 className="text-sm font-semibold">Santé des réponses</h2>
        </div>
        <p className="text-muted-foreground mt-2 text-sm text-pretty">
          {stats.unanswered} message{stats.unanswered > 1 ? 's' : ''} sur {stats.messages}{' '}
          {stats.unanswered > 1 ? 'sont restés' : 'est resté'} sans réponse, soit{' '}
          <strong className="text-foreground">{refusalRate} %</strong>. Au-delà de 20 %,
          soupçonnez un seuil de similarité trop élevé ou des sites clients trop pauvres
          en contenu.
        </p>
      </section>

      <section className="panel flex flex-col">
        <div className="border-border flex items-center justify-between border-b px-4 py-3.5">
          <h2 className="text-sm font-semibold">Derniers assistants créés</h2>
          <Link href="/admin/bots" className={panelLinkClass}>
            Tout voir
            <ChevronRight className="size-3.5" aria-hidden />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground border-border border-b text-left text-xs">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Assistant</th>
                <th scope="col" className="px-4 py-3 font-medium">Compte</th>
                <th scope="col" className="px-4 py-3 font-medium">État</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Pages</th>
              </tr>
            </thead>
            <tbody>
              {bots.map((bot) => (
                <tr key={bot.id} className="border-border border-b last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{bot.name}</p>
                    <p className="text-muted-foreground text-xs">{bot.websiteUrl}</p>
                  </td>
                  <td className="text-muted-foreground px-4 py-3">{bot.ownerEmail}</td>
                  <td className="px-4 py-3">
                    <BotStatusBadge status={bot.status} dict={dict} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{bot.pages}</td>
                </tr>
              ))}
              {bots.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-muted-foreground px-4 py-8 text-center">
                    Aucun assistant sur la plateforme.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/**
 * Repartition en barres horizontales.
 *
 * Preferee au camembert : comparer des longueurs alignees sur une meme base est
 * une tache visuelle nettement plus fiable que comparer des angles, et le
 * libelle reste lisible sans legende separee.
 */
function BreakdownPanel({ title, rows }: { title: string; rows: Breakdown[] }) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <section className="panel flex flex-col">
      <div className="border-border flex items-baseline justify-between border-b px-4 py-3.5">
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="text-muted-foreground text-xs tabular-nums">
          {total.toLocaleString('fr-FR')}
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="text-muted-foreground p-4 text-sm">Aucune donnée.</p>
      ) : (
        <ul className="flex flex-col gap-3 p-4">
          {rows.map((row) => {
            const share = total > 0 ? (row.value / total) * 100 : 0;

            return (
              <li key={row.label} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate">{row.label}</span>
                  <span className="shrink-0 tabular-nums">
                    {row.value.toLocaleString('fr-FR')}
                    <span className="text-muted-foreground text-xs">
                      {' · '}
                      {share.toFixed(0)} %
                    </span>
                  </span>
                </div>
                <div className="bg-surface-subtle border-border h-1.5 overflow-hidden rounded-full border">
                  <div
                    className="bg-brand h-full rounded-full"
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
