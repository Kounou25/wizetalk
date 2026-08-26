'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { isLocale } from '@/lib/i18n/config';
import { LOCALE_COOKIE } from '@/lib/i18n/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Enregistre la langue choisie depuis le dashboard.
 *
 * Le dashboard n'a pas de segment de langue dans son URL : la preference vit
 * donc dans un cookie, le meme que celui pose par le proxy quand on visite
 * /fr ou /en. Les deux surfaces restent ainsi coherentes.
 */
export async function setLocale(locale: string) {
  if (!isLocale(locale)) return;

  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });

  /*
   * La meme preference est enregistree en base.
   *
   * Le cookie suffit tant qu'on rend une page : la requete le porte. Mais un
   * message declenche par la capture d'un prospect ou par un webhook n'a aucun
   * contexte de requete — et le visiteur qui declenche l'envoi n'est pas le
   * destinataire. Sans cette ligne, ces messages partent tous en francais.
   */
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.from('profiles').update({ locale }).eq('user_id', user.id);
  }

  revalidatePath('/', 'layout');
}
