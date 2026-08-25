import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import { creditsFor, planFromProductId, type BillingPeriod, type PaidPlanId } from './plans';

/**
 * Reserve le traitement d'un evenement.
 *
 * Les livraisons repetees font partie du fonctionnement normal d'un webhook :
 * le prestataire rejoue tant qu'il n'a pas recu de 2xx, et une reponse perdue
 * suffit a declencher un doublon. Sans cette reservation, un
 * `subscription.active` rejoue remettrait `credits_used` a zero une seconde
 * fois et effacerait la consommation reelle du client.
 *
 * L'insertion elle-meme fait office de verrou : la cle primaire rejette le
 * second appel, sans course possible entre deux instances.
 */
export async function claimEvent(
  webhookId: string,
  type: string,
  subscriptionId: string | null,
): Promise<boolean> {
  const db = createAdminClient();

  const { error } = await db
    .from('billing_events')
    .insert({ id: webhookId, type, subscription_id: subscriptionId });

  if (!error) return true;

  // 23505 = violation d'unicite : l'evenement a deja ete traite.
  if (error.code === '23505') return false;

  // Toute autre erreur est une panne de notre cote. On laisse l'evenement
  // echouer pour que Dodo le rejoue, plutot que de le perdre en silence.
  throw new Error(`Journal des webhooks indisponible : ${error.message}`);
}

/**
 * Libere un evenement dont le traitement a echoue.
 *
 * Sans cela, la reservation devient un piege : l'evenement est marque comme vu,
 * l'action a echoue, et le rejeu du prestataire est ignore — l'evenement est
 * perdu pour de bon. En retirant la ligne, on rend le rejeu possible.
 *
 * L'ordre reserve-puis-agis reste le bon : il ferme la fenetre pendant laquelle
 * deux livraisons simultanees agiraient toutes les deux. La liberation ne
 * rouvre cette fenetre qu'en cas d'echec, ou il n'y a plus rien a proteger.
 */
export async function releaseEvent(webhookId: string): Promise<void> {
  const db = createAdminClient();
  const { error } = await db.from('billing_events').delete().eq('id', webhookId);
  if (error) console.error('[billing] liberation impossible', webhookId, error.message);
}

/**
 * Retrouve le compte destinataire d'un evenement.
 *
 * Par `subscription_id` d'abord : il est ecrit en base au moment ou l'on cree
 * l'abonnement, donc avant qu'aucun webhook n'ait pu partir. Les metadonnees ne
 * servent que de secours, pour le cas ou l'ecriture initiale aurait echoue
 * apres l'appel a Dodo.
 */
export async function resolveUserId(
  subscriptionId: string,
  metadata: Record<string, unknown> | null | undefined,
): Promise<string | null> {
  const db = createAdminClient();

  const { data } = await db
    .from('profiles')
    .select('user_id')
    .eq('dodo_subscription_id', subscriptionId)
    .maybeSingle();

  if (data?.user_id) return data.user_id as string;

  const fromMetadata = metadata?.user_id;
  return typeof fromMetadata === 'string' && fromMetadata ? fromMetadata : null;
}

/** Rattache l'abonnement au compte, des sa creation et avant tout paiement. */
export async function linkSubscription(
  userId: string,
  subscriptionId: string,
  customerId: string,
): Promise<void> {
  const db = createAdminClient();

  await db
    .from('profiles')
    .update({
      dodo_subscription_id: subscriptionId,
      dodo_customer_id: customerId,
      subscription_status: 'pending',
    })
    .eq('user_id', userId);
}

export interface SubscriptionSnapshot {
  subscriptionId: string;
  productId: string;
  customerId: string | null;
  status: string;
  nextBillingDate: string | null;
  cancelAtNextBillingDate: boolean;
  metadata: Record<string, unknown> | null;
}

/**
 * Ouvre ou change un plan : allocation, remise a zero, redemarrage de periode.
 *
 * Retourne `false` si le produit ne correspond a aucun plan connu — un produit
 * cree a la main dans le tableau de bord Dodo, par exemple. On ne leve pas :
 * un evenement qu'on ne sait pas interpreter ne doit pas empecher d'accuser
 * reception, sinon le prestataire le rejoue indefiniment.
 */
export async function applyPlan(snapshot: SubscriptionSnapshot): Promise<boolean> {
  const match = planFromProductId(snapshot.productId);
  if (!match) {
    console.error('[billing] produit inconnu', snapshot.productId);
    return false;
  }

  const userId = await resolveUserId(snapshot.subscriptionId, snapshot.metadata);
  if (!userId) {
    console.error('[billing] abonnement sans compte', snapshot.subscriptionId);
    return false;
  }

  const db = createAdminClient();
  const { error } = await db.rpc('apply_subscription_plan', {
    p_user_id: userId,
    p_plan: match.plan satisfies PaidPlanId,
    p_credits: creditsFor(match.plan),
    p_subscription_id: snapshot.subscriptionId,
    p_customer_id: snapshot.customerId,
    p_status: snapshot.status,
    p_billing_period: match.period satisfies BillingPeriod,
    p_period_end: snapshot.nextBillingDate,
    p_cancel_at_period_end: snapshot.cancelAtNextBillingDate,
  });

  if (error) throw new Error(`Application du plan impossible : ${error.message}`);
  return true;
}

/**
 * Met a jour le statut sans toucher au portefeuille.
 *
 * Utilise pour le renouvellement, la mise en attente et l'annulation
 * programmee. Le rythme mensuel des credits reste pilote par `consume_credits`
 * — c'est ce qui permet a un abonnement annuel, qui ne se renouvelle qu'une
 * fois par an, de recharger quand meme ses credits tous les mois.
 */
export async function touchSubscription(snapshot: SubscriptionSnapshot): Promise<void> {
  const db = createAdminClient();

  const { error } = await db.rpc('update_subscription_status', {
    p_subscription_id: snapshot.subscriptionId,
    p_status: snapshot.status,
    p_period_end: snapshot.nextBillingDate,
    p_cancel_at_period_end: snapshot.cancelAtNextBillingDate,
  });

  if (error) throw new Error(`Mise a jour du statut impossible : ${error.message}`);
}

/** Fin de l'abonnement : le compte retombe a zero credit. */
export async function expireSubscription(subscriptionId: string): Promise<void> {
  const db = createAdminClient();

  const { error } = await db.rpc('end_subscription', {
    p_subscription_id: subscriptionId,
  });

  if (error) throw new Error(`Cloture de l'abonnement impossible : ${error.message}`);
}
