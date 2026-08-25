import { CreditCard, Radio } from 'lucide-react';

import { requireAdmin } from '@/lib/admin/guard';
import {
  computeBillingStats,
  listBillingEvents,
  listSubscriptions,
  type SubscriptionRow,
} from '@/lib/admin/queries';
import type { PlanId } from '@/lib/credits';
import { Badge, type BadgeVariant } from '@/components/ui/badge';
import { StatCell, StatGroup } from '@/components/dashboard/stat-card';
import { EmptyState } from '@/components/dashboard/empty-state';
import { PageHeader } from '@/components/dashboard/panel';

/** Le back-office reste en francais : il ne s'adresse qu'a l'equipe. */
const PLAN_LABELS: Record<PlanId, string> = {
  trial: 'Essai',
  essential: 'Essentiel',
  growth: 'Croissance',
  business: 'Entreprise',
};

/**
 * Statuts d'abonnement, avec le ton qui va avec.
 *
 * `on_hold` et `failed` sont en rouge parce que ce sont les seuls sur lesquels
 * quelqu'un doit agir : le paiement a echoue, le client va cesser de payer sans
 * forcement s'en rendre compte.
 */
const STATUS: Record<string, { label: string; variant: BadgeVariant }> = {
  pending: { label: 'En attente', variant: 'neutral' },
  active: { label: 'Actif', variant: 'success' },
  on_hold: { label: 'Paiement en échec', variant: 'danger' },
  paused: { label: 'En pause', variant: 'warning' },
  cancelled: { label: 'Résilié', variant: 'warning' },
  failed: { label: 'Échec', variant: 'danger' },
  expired: { label: 'Terminé', variant: 'neutral' },
};

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleDateString('fr-FR') : '—';
}

export default async function AdminBillingPage() {
  // Le layout a deja verifie, mais requireAdmin() est ce qui rend le client
  // privilegie : impossible de lire ces donnees sans repasser le controle.
  const { db } = await requireAdmin();

  const [subscriptions, events] = await Promise.all([
    listSubscriptions(db),
    listBillingEvents(db),
  ]);

  const stats = computeBillingStats(subscriptions);

  // Les comptes en essai n'ont rien a faire dans un tableau d'abonnements :
  // ils n'ont ni statut, ni echeance, ni montant.
  const paying = subscriptions.filter((row) => row.plan !== 'trial');

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Paiements et abonnements"
        description="Le revenu récurrent, l'état de chaque abonnement, et les derniers webhooks reçus."
      />

      <StatGroup columns={4}>
        <StatCell
          label="Revenu mensuel"
          value={`${stats.mrr.toLocaleString('fr-FR')} $`}
          hint="Annuel ramené au mois"
        />
        <StatCell label="Abonnements actifs" value={stats.active} />
        <StatCell
          label="Comptes en essai"
          value={stats.trials}
          hint="Crédits de départ, jamais renouvelés"
        />
        <StatCell
          label="À relancer"
          value={stats.atRisk + stats.cancelling}
          hint={`${stats.atRisk} en échec · ${stats.cancelling} résiliés`}
        />
      </StatGroup>

      <section className="panel flex flex-col">
        <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3.5">
          <h2 className="text-sm font-semibold">Abonnements</h2>
          <div className="flex flex-wrap items-center gap-1.5">
            {Object.entries(stats.perPlan).map(([plan, count]) => (
              <Badge key={plan} variant="brand">
                {PLAN_LABELS[plan as PlanId]} · {count}
              </Badge>
            ))}
          </div>
        </div>

        {paying.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="Aucun abonnement"
            description="Les abonnements souscrits par vos clients apparaîtront ici."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-muted-foreground border-border border-b text-left text-xs">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Compte</th>
                  <th scope="col" className="px-4 py-3 font-medium">Plan</th>
                  <th scope="col" className="px-4 py-3 font-medium">État</th>
                  <th scope="col" className="px-4 py-3 font-medium">Échéance</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Crédits</th>
                </tr>
              </thead>
              <tbody>
                {paying.map((row) => (
                  <SubscriptionLine key={row.userId} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/*
        Le journal des webhooks.

        C'est la premiere chose a regarder quand un client dit « j'ai paye et
        rien ne se passe » : soit l'evenement n'est jamais arrive — la
        declaration chez le prestataire est en cause — soit il est la, et le
        probleme est chez nous.
      */}
      <section className="panel flex flex-col">
        <div className="border-border flex items-center gap-2 border-b px-4 py-3.5">
          <Radio className="text-brand size-4" aria-hidden />
          <h2 className="text-sm font-semibold">Derniers webhooks reçus</h2>
        </div>

        {events.length === 0 ? (
          <p className="text-muted-foreground p-4 text-sm text-pretty">
            Aucun webhook enregistré. Si des paiements ont eu lieu, vérifiez que
            l’URL est bien déclarée chez Dodo et que la clé de signature correspond
            au mode en cours.
          </p>
        ) : (
          <ul className="divide-border divide-y">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <code className="bg-surface-subtle border-border rounded border px-1.5 py-0.5 font-mono text-xs">
                    {event.type}
                  </code>
                  {event.subscriptionId && (
                    <span className="text-muted-foreground truncate font-mono text-xs">
                      {event.subscriptionId}
                    </span>
                  )}
                </div>
                <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                  {new Date(event.receivedAt).toLocaleString('fr-FR')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SubscriptionLine({ row }: { row: SubscriptionRow }) {
  const status = row.status ? STATUS[row.status] : undefined;
  const ratio = row.creditsIncluded > 0 ? row.creditsUsed / row.creditsIncluded : 0;

  return (
    <tr className="border-border border-b last:border-0">
      <td className="px-4 py-3">
        <p className="font-medium">{row.email}</p>
        {row.subscriptionId && (
          <p className="text-muted-foreground font-mono text-xs">{row.subscriptionId}</p>
        )}
      </td>

      <td className="px-4 py-3">
        <span className="font-medium">{PLAN_LABELS[row.plan]}</span>
        <span className="text-muted-foreground">
          {' · '}
          {row.billingPeriod === 'annual' ? 'annuel' : 'mensuel'}
        </span>
      </td>

      <td className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={status?.variant ?? 'neutral'}>
            {status?.label ?? row.status ?? '—'}
          </Badge>
          {/* Distinct du statut : un abonnement resilie reste `active` chez le
              prestataire jusqu'a son echeance. */}
          {row.cancelAtPeriodEnd && <Badge variant="warning">résiliation prévue</Badge>}
        </div>
      </td>

      <td className="text-muted-foreground px-4 py-3 tabular-nums">
        {formatDate(row.currentPeriodEnd)}
      </td>

      <td className="px-4 py-3 text-right tabular-nums">
        <span className={ratio >= 0.8 ? 'font-semibold text-amber-600' : ''}>
          {row.creditsUsed.toLocaleString('fr-FR')}
        </span>
        <span className="text-muted-foreground">
          {' / '}
          {row.creditsIncluded.toLocaleString('fr-FR')}
        </span>
      </td>
    </tr>
  );
}
