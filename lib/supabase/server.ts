/**
 * Client Supabase cote serveur, adosse aux cookies de session.
 *
 * Il agit au nom de l'utilisateur connecte et reste soumis au RLS : c'est
 * celui a utiliser partout dans le dashboard.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Appel depuis un Server Component : l'ecriture de cookies y est
            // interdite. Le middleware rafraichit deja la session, donc on
            // peut ignorer sans risque.
          }
        },
      },
    },
  );
}

/** Retourne l'utilisateur connecte, ou null. */
export async function getUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}
