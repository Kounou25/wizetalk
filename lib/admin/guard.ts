import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Controle d'acces au back-office.
 *
 * POURQUOI CE FICHIER EST SENSIBLE
 *
 * Le back-office lit les donnees de tous les comptes. Il ne peut donc pas
 * passer par le client de session, sur lequel RLS s'applique : il utilise le
 * client service_role, qui contourne RLS entierement.
 *
 * Ce contournement n'est acceptable qu'a une condition : que la verification
 * du droit d'acces vive ici, a un seul endroit, et ne soit jamais recopiee.
 * Un controle oublie dans une seule page exposerait toute la base.
 *
 * D'ou l'invariant central : requireAdmin() ne rend le client privilegie
 * qu'apres avoir verifie l'appelant. Il n'existe aucun chemin permettant
 * d'obtenir ce client depuis une page d'administration sans passer par lui.
 *
 * `import 'server-only'` fait echouer la compilation si ce module est importe
 * depuis un composant client, plutot que de laisser fuiter la cle.
 */

export interface AdminUser {
  id: string;
  email: string;
}

/**
 * L'utilisateur connecte, s'il est administrateur. `null` sinon.
 *
 * Ne leve pas d'exception : le layout s'en sert pour renvoyer un 404.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createClient();

  // getUser() revalide le jeton aupres de Supabase, contrairement a
  // getSession() qui se contente de lire un cookie falsifiable.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Lecture via le service_role : une decision de securite ne doit pas
  // dependre d'une politique RLS, qui pourrait etre modifiee ailleurs.
  const { data } = await createAdminClient()
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!data) return null;

  return { id: user.id, email: user.email ?? '' };
}

export async function isAdmin(): Promise<boolean> {
  return (await getAdminUser()) !== null;
}

/**
 * Client privilegie  accessible uniquement apres verification.
 *
 * Rend aussi l'administrateur, que les actions doivent inscrire au journal.
 * Leve une exception plutot que de rendre un client degrade : un back-office
 * qui echoue en silence est pire qu'un back-office en erreur.
 *
 * A appeler dans CHAQUE page et CHAQUE action : un layout ne protege pas les
 * Server Actions, qui sont des points d'entree a part entiere.
 */
export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) throw new Error('forbidden: admin access required');

  return { db: createAdminClient(), admin: user };
}

/** Trace une action d'administration. Sans elle, personne ne peut rendre de comptes. */
export async function logAdminAction(
  admin: AdminUser,
  action: string,
  target: { type: string; id?: string; detail?: Record<string, unknown> },
): Promise<void> {
  await createAdminClient().from('admin_audit').insert({
    actor_id: admin.id,
    actor_email: admin.email,
    action,
    target_type: target.type,
    target_id: target.id ?? null,
    detail: target.detail ?? {},
  });
}
