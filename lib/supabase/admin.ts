/**
 * Client Supabase a privileges eleves (service_role).
 *
 * IL CONTOURNE LE RLS. A n'utiliser que la ou il n'y a pas d'utilisateur
 * connecte et ou le serveur porte lui-meme le controle d'acces :
 *  - l'indexation (le crawler ecrit pages et chunks) ;
 *  - /api/chat, appele anonymement depuis le widget d'un site client.
 *
 * Dans ces deux cas, le bot_id doit TOUJOURS etre verifie explicitement dans le
 * code appelant : le filet de securite du RLS n'est plus la.
 *
 * Ne jamais importer ce module depuis un composant client : la cle donnerait
 * un acces total a la base.
 */

import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis côté serveur.',
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
