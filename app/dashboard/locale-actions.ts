'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { isLocale } from '@/lib/i18n/config';
import { LOCALE_COOKIE } from '@/lib/i18n/server';

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

  revalidatePath('/', 'layout');
}
