import { requireAdmin } from '@/lib/admin/guard';
import { PLAN_IDS, PLAN_PRICING, type PlanId } from '@/lib/plans';
import { getPlanLimits } from '@/lib/plans-db';
import { dodo } from '@/lib/billing/dodo';
import { productIdFor, type PaidPlanId } from '@/lib/billing/plans';
import { PageHeader } from '@/components/dashboard/panel';
import { PlanForm } from './plan-form';

/**
 * Prix reellement factures, lus chez le prestataire.
 *
 * Sert de confrontation, pas de source : c'est ce que le client paiera, quoi
 * que la page de tarifs annonce. Un echec de lecture n'est pas bloquant — la
 * page reste utilisable, la colonne affiche simplement un tiret.
 */
async function dodoPrices(): Promise<Partial<Record<PlanId, number>>> {
  const prices: Partial<Record<PlanId, number>> = {};

  await Promise.all(
    (['essential', 'growth', 'business'] as PaidPlanId[]).map(async (plan) => {
      try {
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        const product = (await dodo().products.retrieve(productIdFor(plan, 'monthly'))) as any;
        const cents = product?.price?.price;
        if (typeof cents === 'number') prices[plan] = cents / 100;
      } catch {
        // Produit non configure, ou API injoignable : on laisse vide.
      }
    }),
  );

  return prices;
}

export default async function AdminPlansPage() {
  // Le layout a deja verifie, mais requireAdmin() est ce qui rend le client
  // privilegie : impossible de lire ces donnees sans repasser le controle.
  await requireAdmin();

  const [limits, prices] = await Promise.all([getPlanLimits(), dodoPrices()]);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Paliers"
        description="Les limites appliquées par le produit et annoncées sur la page de tarifs. Une seule source pour les deux."
      />

      {/*
        L'avertissement sur le prix est en haut, pas en note de bas de page :
        c'est le seul reglage que cette page NE permet PAS, et un
        administrateur doit le savoir avant de chercher le champ.
      */}
      <p className="text-muted-foreground panel p-4 text-sm text-pretty">
        Le prix n’est pas modifiable ici. Ce qui est prélevé est décidé par le produit
        chez Dodo ; la grille affichée vient de <code className="font-mono text-xs">PLAN_PRICING</code>.
        Les deux sont confrontés ci-dessous pour que tout écart se voie.
      </p>

      <div className="flex flex-col gap-5">
        {PLAN_IDS.map((id) => (
          <PlanForm
            key={id}
            id={id}
            limits={limits[id]}
            price={PLAN_PRICING[id].monthly}
            dodoPrice={prices[id] ?? null}
          />
        ))}
      </div>
    </div>
  );
}
