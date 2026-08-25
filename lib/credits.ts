/**
 * Le portefeuille de credits.
 *
 * Un credit est l'unite de consommation du produit. Tout ce qui appelle Gemini
 * en consomme — repondre a un visiteur, mais aussi explorer une page ou
 * traiter un document. C'est ce qui justifie le mot « credit » plutot que
 * « reponse » : sans l'indexation, l'unite n'aurait aucune raison d'exister et
 * « 500 reponses » serait plus clair pour l'acheteur.
 *
 * Les baremes vivent ici et nulle part ailleurs : la page de tarifs, le
 * tableau de bord et les routes qui debitent lisent le meme fichier.
 */

/** Cout de chaque action, en credits. */
export const CREDIT_COST = {
  /** Une reponse envoyee a un visiteur. */
  answer: 1,
  /** Une page du site, lue puis vectorisee. */
  page: 1,
  /** Un document televerse : plus long qu'une page, donc plus cher. */
  document: 2,
} as const;

export type PlanId = 'trial' | 'essential' | 'growth' | 'business';

export interface Plan {
  id: PlanId;
  /** Credits alloues pour la periode. L'essai ne se renouvelle jamais. */
  credits: number;
  /** Prix mensuel en dollars. `null` pour l'essai, qui ne se vend pas. */
  monthly: number | null;
  /** Equivalent mensuel du paiement annuel, arrondi pour l'affichage. */
  annualMonthly: number | null;
  /** Montant reellement preleve sur l'annee : dix mois payes sur douze. */
  annualTotal: number | null;
}

export const PLANS: Record<PlanId, Plan> = {
  /*
   * Les credits de depart, offerts a la creation du compte.
   *
   * 300 est dimensionne pour que l'essai prouve quelque chose : indexer un
   * petit site en consomme quelques dizaines, et il reste de quoi tenir
   * plusieurs centaines d'echanges avec de vrais visiteurs. Un essai au temps
   * — sept jours — expirait souvent avant que le premier visiteur ait pose sa
   * premiere question.
   */
  trial: { id: 'trial', credits: 300, monthly: null, annualMonthly: null, annualTotal: null },

  essential: { id: 'essential', credits: 1_000, monthly: 19, annualMonthly: 16, annualTotal: 190 },
  growth: { id: 'growth', credits: 5_000, monthly: 39, annualMonthly: 33, annualTotal: 390 },
  business: { id: 'business', credits: 20_000, monthly: 79, annualMonthly: 66, annualTotal: 790 },
};

export interface CreditBalance {
  plan: PlanId;
  included: number;
  used: number;
  /** Debut de la periode en cours, au format ISO. */
  periodStartedAt: string;
}

export function remaining(balance: CreditBalance): number {
  return Math.max(0, balance.included - balance.used);
}

export function usedRatio(balance: CreditBalance): number {
  if (balance.included <= 0) return 1;
  return Math.min(1, balance.used / balance.included);
}

/** Au-dela de ce seuil, l'interface alerte au lieu d'informer. */
export const NEAR_LIMIT_RATIO = 0.8;

export function isNearLimit(balance: CreditBalance): boolean {
  return usedRatio(balance) >= NEAR_LIMIT_RATIO;
}

export function isExhausted(balance: CreditBalance): boolean {
  return remaining(balance) <= 0;
}
