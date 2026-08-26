import 'server-only';

import { PAID_PLAN_IDS, type PlanId, type PlanLimits } from './plans';
import { getPlanLimits } from './plans-db';

/** Du moins cher au plus cher. L'essai ouvre la marche. */
const PLAN_ORDER: PlanId[] = ['trial', ...PAID_PLAN_IDS];

/** Ce qui a bloque l'utilisateur. */
export type BlockedBy =
  | 'messages'
  | 'bots'
  | 'documents'
  | 'pages'
  | 'gapsReport'
  | 'removeBranding';

/**
 * Proposition de mise a niveau, calculee cote serveur.
 *
 * Elle transporte des NOMBRES, pas des phrases : les libelles sont traduits
 * cote client. Un message compose ici arriverait dans la langue du serveur, et
 * il faudrait le retraduire a chaque ajout de langue.
 */
export interface UpgradeOffer {
  blockedBy: BlockedBy;
  currentPlan: PlanId;
  /** `null` quand aucun palier superieur ne leve la limite. */
  suggestedPlan: PlanId | null;
  /**
   * Vrai quand le client est deja au palier le plus eleve.
   *
   * A distinguer de `suggestedPlan === null` : la grille etant modifiable
   * depuis le back-office, un palier intermediaire peut cesser d'ameliorer une
   * limite donnee. Annoncer « vous etes deja au plan le plus complet » a un
   * client de palier moyen serait faux.
   */
  isTopPlan: boolean;
  current: PlanLimits;
  suggested: PlanLimits | null;
}

/**
 * Le palier le moins cher qui leve REELLEMENT la limite atteinte.
 *
 * Proposer systematiquement le palier suivant serait plus simple, et parfois
 * faux : un client bloque sur les documents n'a aucune raison de payer un
 * palier qui lui en donne autant. On cherche donc le premier qui change
 * quelque chose sur le point precis ou il bute.
 */
export function pickPlan(
  blockedBy: BlockedBy,
  currentPlan: PlanId,
  limits: Record<PlanId, PlanLimits>,
): PlanId | null {
  const from = PLAN_ORDER.indexOf(currentPlan);
  const current = limits[currentPlan];

  for (const candidate of PLAN_ORDER.slice(from + 1)) {
    const next = limits[candidate];

    const better =
      // Les options se debloquent, elles ne s'agrandissent pas.
      blockedBy === 'gapsReport' || blockedBy === 'removeBranding'
        ? next[blockedBy] && !current[blockedBy]
        : blockedBy === 'documents'
          ? // `null` vaut illimite : il bat forcement n'importe quel plafond.
            next.documents === null ||
            (current.documents !== null && next.documents > current.documents)
          : next[blockedBy] > current[blockedBy];

    if (better) return candidate;
  }

  return null;
}

export async function buildUpgradeOffer(
  currentPlan: PlanId,
  blockedBy: BlockedBy,
): Promise<UpgradeOffer> {
  const limits = await getPlanLimits();
  const suggestedPlan = pickPlan(blockedBy, currentPlan, limits);

  return {
    blockedBy,
    currentPlan,
    isTopPlan: PLAN_ORDER.indexOf(currentPlan) === PLAN_ORDER.length - 1,
    suggestedPlan,
    current: limits[currentPlan],
    suggested: suggestedPlan ? limits[suggestedPlan] : null,
  };
}
