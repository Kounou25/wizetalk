import 'server-only';

import type { PlanId } from '@/lib/plans';

/** Periodicite de facturation. Dodo attache la periodicite au produit : un plan
 *  mensuel et son equivalent annuel sont deux produits distincts. */
export type BillingPeriod = 'monthly' | 'annual';

/** Plans reellement vendus. `trial` en est exclu : il ne se paie pas. */
export type PaidPlanId = Exclude<PlanId, 'trial'>;

export const PAID_PLANS: PaidPlanId[] = ['essential', 'growth', 'business'];

export function isPaidPlan(value: string): value is PaidPlanId {
  return (PAID_PLANS as string[]).includes(value);
}

/**
 * Noms des variables d'environnement, par plan et par periodicite.
 *
 * `ENTREPRISE` et non `BUSINESS` : c'est le nom choisi dans le .env du projet.
 * Le faire coller ici plutot que de renommer la variable evite de casser un
 * environnement deja rempli — y compris celui de production.
 */
const ENV_KEYS: Record<PaidPlanId, Record<BillingPeriod, string>> = {
  essential: {
    monthly: 'DODO_PRODUCT_ESSENTIAL',
    annual: 'DODO_PRODUCT_ESSENTIAL_ANNUAL',
  },
  growth: {
    monthly: 'DODO_PRODUCT_GROWTH',
    annual: 'DODO_PRODUCT_GROWTH_ANNUAL',
  },
  business: {
    monthly: 'DODO_PRODUCT_ENTREPRISE',
    annual: 'DODO_PRODUCT_ENTREPRISE_ANNUAL',
  },
};

/**
 * Identifiant de produit Dodo pour un plan et une periodicite.
 *
 * Leve si la variable est absente. Un identifiant vide partirait en clair a
 * l'API, qui repondrait par une erreur incomprehensible depuis l'interface :
 * mieux vaut echouer ici, avec le nom de la variable manquante.
 */
export function productIdFor(plan: PaidPlanId, period: BillingPeriod): string {
  const key = ENV_KEYS[plan][period];
  const value = process.env[key];

  if (!value) {
    throw new Error(
      `Produit Dodo non configure : renseignez ${key} dans .env (mode ${
        process.env.DODO_ENVIRONMENT ?? 'non defini'
      }).`,
    );
  }

  return value;
}

/**
 * Chemin inverse : de l'identifiant de produit recu par webhook vers le plan.
 *
 * Indispensable au traitement des webhooks — Dodo ne renvoie que le
 * `product_id`, jamais notre nom de plan. Retourne `null` sur un produit
 * inconnu plutot que de lever : un produit cree a la main dans le tableau de
 * bord Dodo ne doit pas faire echouer la reception de l'evenement.
 */
export function planFromProductId(
  productId: string,
): { plan: PaidPlanId; period: BillingPeriod } | null {
  for (const plan of PAID_PLANS) {
    for (const period of ['monthly', 'annual'] as BillingPeriod[]) {
      if (process.env[ENV_KEYS[plan][period]] === productId) {
        return { plan, period };
      }
    }
  }
  return null;
}

/** Produits manquants, pour un controle de configuration au demarrage. */
export function missingProducts(): string[] {
  return PAID_PLANS.flatMap((plan) =>
    (['monthly', 'annual'] as BillingPeriod[])
      .map((period) => ENV_KEYS[plan][period])
      .filter((key) => !process.env[key]),
  );
}
