import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { MessageBalance, PlanId } from './plans';
import { getLimitsFor } from './plans-db';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Db = SupabaseClient<any, any, any>;

/**
 * Debite un message au compte proprietaire d'un assistant.
 *
 * Toute la logique  verrou de ligne, renouvellement de periode, verification
 * du solde  vit dans la fonction SQL `consume_message`. Un debit fait de
 * plusieurs allers-retours depuis Node laisserait une fenetre entre la lecture
 * du solde et son ecriture, pendant laquelle deux visiteurs simultanes
 * consommeraient le meme message.
 *
 * Ne leve jamais : un incident sur le compteur ne doit pas faire tomber la
 * reponse au visiteur. En cas d'erreur on refuse le debit, ce qui declenche le
 * repli vers la capture d'e-mail  degrade, mais pas casse.
 */
export async function consumeMessage(
  db: Db,
  botId: string,
): Promise<{ allowed: boolean; remaining: number }> {
  const { data, error } = await db.rpc('consume_message', { p_bot_id: botId });

  if (error) {
    console.error('[quota] debit impossible', error.message);
    return { allowed: false, remaining: 0 };
  }

  const row = Array.isArray(data) ? data[0] : data;
  return { allowed: Boolean(row?.allowed), remaining: Number(row?.remaining ?? 0) };
}

/** Solde affichable. `null` si le profil n'existe pas encore. */
export async function getMessageBalance(
  db: Db,
  userId: string,
): Promise<MessageBalance | null> {
  const { data, error } = await db.rpc('message_balance', { p_user_id: userId });

  if (error) {
    console.error('[quota] solde illisible', error.message);
    return null;
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;

  return {
    plan: (row.plan ?? 'trial') as PlanId,
    included: Number(row.included ?? 0),
    used: Number(row.used ?? 0),
    periodStartedAt: String(row.period_started_at ?? new Date().toISOString()),
  };
}

/** Plan d'un compte, pour deriver ses plafonds. */
export async function getPlan(db: Db, userId: string): Promise<PlanId> {
  const { data } = await db
    .from('profiles')
    .select('plan')
    .eq('user_id', userId)
    .maybeSingle();

  return ((data?.plan as PlanId) ?? 'trial') as PlanId;
}

export interface LimitCheck {
  allowed: boolean;
  current: number;
  limit: number | null;
  plan: PlanId;
}

/**
 * Le compte peut-il creer un assistant de plus ?
 *
 * Verifie a la creation et nulle part ailleurs : les assistants deja crees ne
 * sont jamais desactives retroactivement. Un widget deja installe sur le site
 * d'un client ne doit pas s'eteindre parce que la regle a change.
 */
export async function canCreateBot(db: Db, userId: string): Promise<LimitCheck> {
  const plan = await getPlan(db, userId);
  const [limits, { count }] = await Promise.all([
    getLimitsFor(plan),
    db.from('bots').select('id', { count: 'exact', head: true }).eq('user_id', userId),
  ]);

  const current = count ?? 0;
  return { allowed: current < limits.bots, current, limit: limits.bots, plan };
}

/** Le compte peut-il ajouter un document de plus a cet assistant ? */
export async function canAddDocument(
  db: Db,
  userId: string,
  botId: string,
): Promise<LimitCheck> {
  const plan = await getPlan(db, userId);
  const [limits, { count }] = await Promise.all([
    getLimitsFor(plan),
    db
      .from('pages')
      .select('id', { count: 'exact', head: true })
      .eq('bot_id', botId)
      .eq('source', 'document'),
  ]);

  const current = count ?? 0;
  const limit = limits.documents;

  // `null` vaut illimite : le palier le plus haut se vend precisement la-dessus.
  return { allowed: limit === null || current < limit, current, limit, plan };
}
