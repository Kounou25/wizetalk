import { cookies, headers } from 'next/headers';
import { DEFAULT_LOCALE, isLocale, negotiateLocale, type Locale } from './config';

/**
 * Reservee aux composants serveur : importe next/headers, donc jamais depuis
 * un composant client.
 */

export const LOCALE_COOKIE = 'deezy-locale';

/**
 * Langue a servir hors des routes /fr et /en.
 *
 * Le dashboard vit derriere une authentification : une URL par langue n'y
 * apporterait aucun referencement, seulement des liens a reecrire. La
 * preference suit donc le compte via un cookie, pose des que l'utilisateur
 * choisit une langue sur la landing.
 */
export async function getRequestLocale(): Promise<Locale> {
  const stored = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(stored)) return stored;

  const accept = (await headers()).get('accept-language');
  return accept ? negotiateLocale(accept) : DEFAULT_LOCALE;
}
