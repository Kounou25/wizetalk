import 'server-only';

import { unstable_cache } from 'next/cache';

import { createAdminClient } from '@/lib/supabase/admin';
import { FALLBACK_LIMITS, PLAN_IDS, type PlanId, type PlanLimits } from './plans';

/** Etiquette du cache, invalidee quand un administrateur enregistre un palier. */
export const PLANS_CACHE_TAG = 'plans';

/**
 * Les limites de chaque palier, telles qu'elles sont en base.
 *
 * Mises en cache : la grille est lue par la page de tarifs, par le tableau de
 * bord et par chaque controle de plafond. Sans cache, une page publique
 * declencherait une requete a chaque visite pour quatre lignes qui changent
 * quelques fois par an.
 *
 * Le cache est invalide explicitement a l'enregistrement  pas par une duree
 * d'expiration. Un administrateur qui change un quota doit le voir appliqué
 * tout de suite, pas dans une heure.
 *
 * En cas de lecture impossible, on retombe sur les valeurs du code plutot que
 * de laisser passer sans borne : une base indisponible ne doit pas ouvrir les
 * vannes.
 */
export const getPlanLimits = unstable_cache(
  async (): Promise<Record<PlanId, PlanLimits>> => {
    const db = createAdminClient();
    const { data, error } = await db
      .from('plans')
      .select('id, messages, bots, pages, documents, gaps_report, remove_branding, priority_support');

    if (error || !data || data.length === 0) {
      if (error) console.error('[plans] grille illisible, repli sur le code', error.message);
      return FALLBACK_LIMITS;
    }

    const limits = { ...FALLBACK_LIMITS };

    for (const row of data) {
      const id = row.id as PlanId;
      if (!PLAN_IDS.includes(id)) continue;

      limits[id] = {
        messages: Number(row.messages),
        bots: Number(row.bots),
        pages: Number(row.pages),
        // `null` en base signifie illimite : la distinction compte, on ne la
        // convertit pas en zero.
        documents: row.documents === null ? null : Number(row.documents),
        gapsReport: Boolean(row.gaps_report),
        removeBranding: Boolean(row.remove_branding),
        prioritySupport: Boolean(row.priority_support),
      };
    }

    return limits;
  },
  ['plan-limits'],
  { tags: [PLANS_CACHE_TAG] },
);

/** Limites d'un seul palier. */
export async function getLimitsFor(plan: PlanId): Promise<PlanLimits> {
  const all = await getPlanLimits();
  return all[plan] ?? FALLBACK_LIMITS[plan];
}
