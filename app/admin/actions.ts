'use server';

import { revalidatePath } from 'next/cache';
import { logAdminAction, requireAdmin } from '@/lib/admin/guard';

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

/** Ajuste le quota mensuel de messages d'un assistant. */
export async function setBotQuota(botId: string, name: string, quota: number) {
  const { db, admin } = await requireAdmin();

  const value = Math.max(0, Math.min(1_000_000, Math.round(quota)));
  await db.from('bots').update({ messages_quota: value }).eq('id', botId);

  await logAdminAction(admin, 'bot.quota', {
    type: 'bot',
    id: botId,
    detail: { name, quota: value },
  });

  revalidatePath('/admin/bots');
}

/** Remet a zero le compteur de messages consommes. */
export async function resetBotUsage(botId: string, name: string) {
  const { db, admin } = await requireAdmin();

  await db.from('bots').update({ messages_used: 0 }).eq('id', botId);

  await logAdminAction(admin, 'bot.reset_usage', {
    type: 'bot',
    id: botId,
    detail: { name },
  });

  revalidatePath('/admin/bots');
}
