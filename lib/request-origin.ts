import { headers } from 'next/headers';

import { PUBLIC_APP_URL } from './public-url';

/**
 * Hote public de l'application, lu sur la requete elle-meme.
 *
 * A preferer systematiquement a NEXT_PUBLIC_APP_URL pour repondre a la
 * question « suis-je moi-meme ? ». Une variable d'environnement peut etre
 * oubliee au deploiement ; l'en-tete Host, non. Ce meme oubli a deja casse la
 * redirection OAuth, les balises canoniques, puis le controle d'origine du
 * widget — chaque fois en production uniquement, jamais en local.
 */
export function appHostFromRequest(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-host');
  const host = forwarded ?? request.headers.get('host') ?? '';
  // L'en-tete peut porter un port ; on ne compare que le nom d'hote.
  return host.split(':')[0]?.replace(/^www\./, '') ?? '';
}

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

  return PUBLIC_APP_URL;
}
