'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { logAdminAction, requireAdmin } from '@/lib/admin/guard';
import { PLAN_IDS, type PlanId } from '@/lib/plans';
import { PLANS_CACHE_TAG } from '@/lib/plans-db';

/**
 * Actions du back-office.
 *
 * Chacune appelle requireAdmin() en premiere ligne : le layout ne protege pas
 * les Server Actions, qui sont des points d'entree HTTP a part entiere. Un
 * visiteur peut les invoquer directement, sans jamais charger /admin.
 *
 * Chacune inscrit ensuite son effet au journal : ces actions portent sur les
 * donnees d'autrui, elles doivent etre imputables.
 */

/** Accorde ou retire le droit d'administration. */
export async function setUserAdmin(userId: string, email: string, grant: boolean) {
  const { db, admin } = await requireAdmin();

  // Garde-fou : se retirer soi-meme le droit fermerait la porte de l'interieur
  // s'il s'agit du dernier administrateur.
  if (!grant && userId === admin.id) {
    const { count } = await db.from('admins').select('*', { count: 'exact', head: true });
    if ((count ?? 0) <= 1) {
      throw new Error(
        'Impossible : vous êtes le dernier administrateur. Nommez quelqu’un d’autre d’abord.',
      );
    }
  }

  if (grant) {
    await db.from('admins').upsert({ user_id: userId }, { onConflict: 'user_id' });
  } else {
    await db.from('admins').delete().eq('user_id', userId);
  }

  await logAdminAction(admin, grant ? 'admin.grant' : 'admin.revoke', {
    type: 'user',
    id: userId,
    detail: { email },
  });

  revalidatePath('/admin/users');
}

/** Active ou desactive un assistant, tous comptes confondus. */
export async function setBotActive(botId: string, name: string, isActive: boolean) {
  const { db, admin } = await requireAdmin();

  await db.from('bots').update({ is_active: isActive }).eq('id', botId);

  await logAdminAction(admin, isActive ? 'bot.enable' : 'bot.disable', {
    type: 'bot',
    id: botId,
    detail: { name },
  });

  revalidatePath('/admin/bots');
}

/**
 * Ajuste le quota de messages d'un compte.
 *
 * Porte par le compte et non par l'assistant : le quota est unique. Ajuster ici
 * permet de traiter un cas particulier  un geste commercial, un depassement
 * conteste  sans creer un palier sur mesure dans la grille tarifaire.
 */
export async function setAccountMessages(userId: string, email: string, messages: number) {
  const { db, admin } = await requireAdmin();

  const value = Math.max(0, Math.min(1_000_000, Math.round(messages)));
  await db.from('profiles').update({ messages_included: value }).eq('user_id', userId);

  await logAdminAction(admin, 'account.messages', {
    type: 'user',
    id: userId,
    detail: { email, messages: value },
  });

  revalidatePath('/admin/users');
}

/** Remet a zero les messages consommes du compte, sans toucher au quota. */
export async function resetAccountUsage(userId: string, email: string) {
  const { db, admin } = await requireAdmin();

  await db
    .from('profiles')
    .update({ messages_used: 0, period_started_at: new Date().toISOString() })
    .eq('user_id', userId);

  await logAdminAction(admin, 'account.reset_messages', {
    type: 'user',
    id: userId,
    detail: { email },
  });

  revalidatePath('/admin/users');
}

/**
 * Enregistre les limites d'un palier.
 *
 * Un changement de palier affecte TOUS les comptes qui l'utilisent, pas
 * seulement les prochains : `sync_plan_quota` repercute le nouveau quota sur
 * les abonnes en cours. Sans cela, un client garderait le volume fige au jour
 * de son activation et ne verrait le changement qu'au renouvellement suivant.
 *
 * Le compteur consomme n'est jamais remis a zero : seul le plafond bouge, le
 * client garde ce qu'il a deja utilise ce mois-ci.
 */
export async function savePlanLimits(planId: string, formData: FormData) {
  const { db, admin } = await requireAdmin();

  if (!PLAN_IDS.includes(planId as PlanId)) {
    throw new Error(`Palier inconnu : ${planId}`);
  }

  /** Entier borne. Une saisie vide ou absurde ne doit pas ouvrir les vannes. */
  const int = (field: string, max: number) => {
    const raw = Number(formData.get(field));
    if (!Number.isFinite(raw)) return 0;
    return Math.max(0, Math.min(max, Math.round(raw)));
  };

  // Le champ documents distingue « illimite » de « zero » : la case a cocher
  // l'emporte sur le nombre saisi.
  const unlimitedDocs = formData.get('documentsUnlimited') === 'on';

  const next = {
    messages: int('messages', 10_000_000),
    bots: int('bots', 1_000),
    pages: int('pages', 100_000),
    documents: unlimitedDocs ? null : int('documents', 100_000),
    gaps_report: formData.get('gapsReport') === 'on',
    remove_branding: formData.get('removeBranding') === 'on',
    priority_support: formData.get('prioritySupport') === 'on',
  };

  // L'ancienne ligne est relue pour le journal : « a change X » sans dire
  // depuis quoi ne permet pas de reconstituer un incident.
  const { data: before } = await db
    .from('plans')
    .select('messages, bots, pages, documents')
    .eq('id', planId)
    .maybeSingle();

  const { error } = await db.from('plans').update(next).eq('id', planId);
  if (error) throw new Error(`Enregistrement impossible : ${error.message}`);

  const { data: affected } = await db.rpc('sync_plan_quota', { p_plan: planId });

  await logAdminAction(admin, 'plan.update', {
    type: 'plan',
    id: planId,
    detail: {
      plan: planId,
      before: before ?? null,
      after: { ...next, documents: next.documents },
      accountsUpdated: Number(affected ?? 0),
    },
  });

  /*
   * Le cache de la grille est invalide explicitement.
   *
   * `updateTag` et non `revalidateTag` : c'est la variante prevue pour les
   * Server Actions, celle qui garantit de relire ce qu'on vient d'ecrire. Un
   * administrateur doit voir son changement applique immediatement, pas au
   * bout d'une expiration.
   */
  updateTag(PLANS_CACHE_TAG);
  revalidatePath('/admin/plans');
  revalidatePath('/dashboard/settings');
}

/**
 * Fait avancer une demande Enterprise dans le suivi commercial.
 *
 * La table `demo_requests` a le RLS active sans politique : seul le client
 * privilegie rendu par requireAdmin() peut l'ecrire. L'appel en premiere ligne
 * n'est donc pas une formalite  sans lui, l'action n'aurait meme pas de quoi
 * ecrire.
 *
 * L'etat autorise est verifie ici plutot que laisse a la contrainte SQL : une
 * valeur inattendue doit produire une erreur nette du cote de l'appelant, pas
 * une violation de contrainte remontee de la base.
 */
const DEMO_STATUSES = ['new', 'contacted', 'qualified', 'closed'] as const;

export async function setDemoRequestStatus(requestId: string, status: string) {
  const { db, admin } = await requireAdmin();

  if (!DEMO_STATUSES.includes(status as (typeof DEMO_STATUSES)[number])) {
    throw new Error(`État inconnu : ${status}`);
  }

  const { data: before } = await db
    .from('demo_requests')
    .select('email, company, status')
    .eq('id', requestId)
    .maybeSingle();

  const { error } = await db
    .from('demo_requests')
    .update({ status })
    .eq('id', requestId);

  if (error) throw new Error(`Enregistrement impossible : ${error.message}`);

  await logAdminAction(admin, 'demo.status', {
    type: 'demo_request',
    id: requestId,
    detail: {
      company: before?.company ?? null,
      email: before?.email ?? null,
      from: before?.status ?? null,
      to: status,
    },
  });

  revalidatePath('/admin/demos');
}
