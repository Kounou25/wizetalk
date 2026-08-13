import { headers } from 'next/headers';

/**
 * Origine reelle de la requete en cours.
 *
 * En production derriere un proxy (Vercel), l'en-tete `host` est celui de
 * l'instance interne : c'est `x-forwarded-host` qui porte le domaine public.
 * On ne se repose pas sur NEXT_PUBLIC_APP_URL, qui resterait sur localhost si
 * on oubliait de le definir — avec pour consequence des redirections OAuth
 * cassees et des balises canoniques pointant vers le mauvais domaine.
 */
export async function requestOrigin(): Promise<string> {
  const headerList = await headers();

  const forwardedHost = headerList.get('x-forwarded-host');
  if (forwardedHost) {
    return `${headerList.get('x-forwarded-proto') ?? 'https'}://${forwardedHost}`;
  }

  const origin = headerList.get('origin');
  if (origin) return origin;

  const host = headerList.get('host');
  if (host) {
    return `${host.startsWith('localhost') ? 'http' : 'https'}://${host}`;
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}
