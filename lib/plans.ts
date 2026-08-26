/**
 * Les paliers, et ce que chacun donne.
 *
 * POURQUOI DES MESSAGES ET NON DES CREDITS
 *
 * Le credit couvrait tout ce qui coutait : repondre, explorer une page,
 * traiter un document. C'etait juste economiquement, et opaque
 * commercialement — « 5 000 credits » oblige l'acheteur a apprendre une unite
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

/** Un plafond a `null` est illimite. */
export interface Plan {
  id: PlanId;
  /** Messages envoyes aux visiteurs, par mois. L'essai ne se renouvelle pas. */
  messages: number;
  bots: number;
  pages: number;
  documents: number | null;

  /** Prix mensuel en dollars. `null` pour l'essai, qui ne se vend pas. */
  monthly: number | null;
  /** Equivalent mensuel du paiement annuel, arrondi pour l'affichage. */
  annualMonthly: number | null;
  /** Montant reellement preleve sur l'annee : dix mois payes sur douze. */
  annualTotal: number | null;

  /** Rapport des questions restees sans reponse. */
  gapsReport: boolean;
  /** Retrait de la mention « Propulse par Deezy » dans le widget. */
  removeBranding: boolean;
  prioritySupport: boolean;
}

export const PLANS: Record<PlanId, Plan> = {
  /*
   * L'essai.
   *
   * Il s'epuise a l'usage, pas au chronometre : un petit site peut ne recevoir
   * que trois questions en une semaine, et un essai de sept jours expirerait
   * avant d'avoir rien prouve. Cent messages suffisent pour que de vrais
   * visiteurs mettent l'assistant a l'epreuve.
   */
  trial: {
    id: 'trial',
    messages: 100,
    bots: 1,
    pages: 50,
    documents: 5,
    monthly: null,
    annualMonthly: null,
    annualTotal: null,
    gapsReport: false,
    removeBranding: false,
    prioritySupport: false,
  },

  essential: {
    id: 'essential',
    messages: 1_000,
    bots: 1,
    pages: 100,
    documents: 20,
    monthly: 19,
    annualMonthly: 16,
    annualTotal: 190,
    gapsReport: false,
    removeBranding: false,
    prioritySupport: false,
  },

  growth: {
    id: 'growth',
    messages: 5_000,
    bots: 3,
    pages: 500,
    documents: 100,
    monthly: 39,
    annualMonthly: 33,
    annualTotal: 390,
    gapsReport: true,
    removeBranding: false,
    prioritySupport: false,
  },

  business: {
    id: 'business',
    messages: 20_000,
    bots: 10,
    pages: 2_000,
    documents: null,
    monthly: 79,
    annualMonthly: 66,
    annualTotal: 790,
    gapsReport: true,
    removeBranding: true,
    prioritySupport: true,
  },
};

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

/** Plafond de pages explorables, pour un plan donne. */
export function pageLimit(plan: PlanId): number {
  return PLANS[plan].pages;
}

/** `null` signifie illimite. */
export function documentLimit(plan: PlanId): number | null {
  return PLANS[plan].documents;
}

export function botLimit(plan: PlanId): number {
  return PLANS[plan].bots;
}
