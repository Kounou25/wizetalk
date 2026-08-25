import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { CreditBalance, PlanId } from './credits';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Db = SupabaseClient<any, any, any>;

/**
 * Debite le compte proprietaire d'un assistant.
 *
 * Toute la logique — verrou de ligne, renouvellement de periode, verification
 * du solde — vit dans la fonction SQL `consume_credits`. Un debit fait de
 * plusieurs allers-retours depuis Node laisserait une fenetre entre la lecture
 * du solde et son ecriture, pendant laquelle deux visiteurs simultanes
 * consommeraient le meme credit.
 *
 * Ne leve jamais : un incident sur le portefeuille ne doit pas faire tomber la
 * reponse au visiteur. En cas d'erreur on refuse le debit, ce qui declenche le
 * repli vers la capture d'e-mail — degrade, mais pas casse.
 */
export async function consumeCredits(
  db: Db,
  botId: string,
  amount: number,
): Promise<{ allowed: boolean; remaining: number }> {
  const { data, error } = await db.rpc('consume_credits', {
    p_bot_id: botId,
    p_amount: amount,
  });

  if (error) {
    console.error('[credits] debit impossible', error.message);
    return { allowed: false, remaining: 0 };
  }

  const row = Array.isArray(data) ? data[0] : data;
  return {
    allowed: Boolean(row?.allowed),
    remaining: Number(row?.remaining ?? 0),
  };
}

/** Solde affichable. `null` si le profil n'existe pas encore. */
export async function getCreditBalance(
  db: Db,
  userId: string,
): Promise<CreditBalance | null> {
  const { data, error } = await db.rpc('credit_balance', { p_user_id: userId });

  if (error) {
    console.error('[credits] solde illisible', error.message);
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
