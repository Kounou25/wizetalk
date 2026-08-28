/**
 * Les paliers, et ce que chacun donne.
 *
 * POURQUOI DES MESSAGES ET NON DES CREDITS
 *
 * Le credit couvrait tout ce qui coutait : repondre, explorer une page,
 * traiter un document. C'etait juste economiquement, et opaque
 * commercialement  « 5 000 credits » oblige l'acheteur a apprendre une unite
 * maison avant de pouvoir juger le prix.
 *
 * Le message se comprend sans explication. Ce que le credit bornait du cote de
 * l'indexation est repris par des plafonds : nombre de pages, de documents et
 * d'assistants. Ils bornent le meme cout, et se lisent comme un avantage plutot
 * que comme un compteur.
 *
 * Ce fichier est la seule source. La page de tarifs, le tableau de bord, les
 * routes qui debitent et le back-office lisent tous ici.
 */

export type PlanId = 'trial' | 'essential' | 'growth' | 'business';

/** Limites d'un palier. Un plafond a `null` est illimite. */
export interface PlanLimits {
  /** Messages envoyes aux visiteurs, par mois. L'essai ne se renouvelle pas. */
  messages: number;
  bots: number;
  pages: number;
  documents: number | null;

  /** Rapport des questions restees sans reponse. */
  gapsReport: boolean;
  /** Retrait de la mention « Propulse par Deezy » dans le widget. */
  removeBranding: boolean;
  prioritySupport: boolean;
}

/**
 * Prix, et repli sur les limites.
 *
 * LE PRIX RESTE ICI, LES LIMITES NON
 *
 * Les limites vivent dans la table `plans` : un administrateur les ajuste
 * depuis le back-office, et la page de tarifs comme le code d'application
 * lisent la meme ligne. Voir `getPlanLimits()` dans lib/plans-db.ts.
 *
 * Le prix, lui, ne peut pas etre decide ici : c'est le produit chez le
 * prestataire de paiement qui determine ce qui est preleve. L'inscrire en base
 * laisserait afficher 25 $ alors que 19 $ sont factures. Il reste donc en code,
 * ou il se relit dans la meme revue que le reste.
 *
 * Les limites ci-dessous ne servent que de repli, si la table est illisible :
 * mieux vaut appliquer des valeurs prudentes que de laisser passer sans borne.
 */
export interface PlanPricing {
  monthly: number | null;
  annualMonthly: number | null;
  annualTotal: number | null;
}

export const PLAN_PRICING: Record<PlanId, PlanPricing> = {
  trial: { monthly: null, annualMonthly: null, annualTotal: null },
  essential: { monthly: 19, annualMonthly: 16, annualTotal: 190 },
  growth: { monthly: 39, annualMonthly: 33, annualTotal: 390 },
  business: { monthly: 79, annualMonthly: 66, annualTotal: 790 },
};

export const FALLBACK_LIMITS: Record<PlanId, PlanLimits> = {
  trial: {
    messages: 100, bots: 1, pages: 50, documents: 5,
    gapsReport: false, removeBranding: false, prioritySupport: false,
  },
  essential: {
    messages: 1_000, bots: 1, pages: 100, documents: 20,
    gapsReport: false, removeBranding: false, prioritySupport: false,
  },
  growth: {
    messages: 5_000, bots: 3, pages: 500, documents: 100,
    gapsReport: true, removeBranding: false, prioritySupport: false,
  },
  business: {
    messages: 20_000, bots: 10, pages: 2_000, documents: null,
    gapsReport: true, removeBranding: true, prioritySupport: true,
  },
};

export const PLAN_IDS: PlanId[] = ['trial', 'essential', 'growth', 'business'];
export const PAID_PLAN_IDS: PlanId[] = ['essential', 'growth', 'business'];

export interface MessageBalance {
  plan: PlanId;
  included: number;
  used: number;
  /** Debut de la periode en cours, au format ISO. */
  periodStartedAt: string;
}

export function remaining(balance: MessageBalance): number {
  return Math.max(0, balance.included - balance.used);
}

export function usedRatio(balance: MessageBalance): number {
  if (balance.included <= 0) return 1;
  return Math.min(1, balance.used / balance.included);
}

/** Au-dela de ce seuil, l'interface alerte au lieu d'informer. */
export const NEAR_LIMIT_RATIO = 0.8;

export function isNearLimit(balance: MessageBalance): boolean {
  return usedRatio(balance) >= NEAR_LIMIT_RATIO;
}

export function isExhausted(balance: MessageBalance): boolean {
  return remaining(balance) <= 0;
}
