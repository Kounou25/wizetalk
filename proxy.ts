/**
 * Rafraichit la session Supabase, protege le dashboard, et resout la langue.
 *
 * Le matcher exclut deliberement les routes publiques du widget (/widget.js,
 * /chat/*, /api/chat, /api/lead, /api/widget/*) : elles sont appelees
 * anonymement depuis les sites des clients et ne doivent jamais dependre d'une
 * session. /auth/callback est exclu aussi : ce gestionnaire ecrit lui-meme les
 * cookies apres l'echange du code OAuth.
 *
 * robots.txt, sitemap.xml et l'image de partage en sont exclus pour une autre
 * raison : ce proxy appelle Supabase a chaque requete qu'il intercepte. Un
 * robot d'indexation qui vient lire robots.txt declencherait une revalidation
 * de session  un aller-retour reseau pour un fichier qui ne depend d'aucun
 * utilisateur.
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_LOCALE, isLocale, negotiateLocale } from '@/lib/i18n/config';
import {
  ACQ_COOKIE,
  ACQ_MAX_AGE,
  encodeAcquisition,
  readAcquisition,
} from '@/lib/acquisition';

/** En-tete lu par le layout racine pour poser l'attribut lang du document. */
const LOCALE_HEADER = 'x-deezy-locale';
const LOCALE_COOKIE = 'deezy-locale';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /*
   * Ordre de resolution : le chemin d'abord (une URL /en doit rester en
   * anglais quel que soit le navigateur), puis la preference enregistree,
   * puis le navigateur.
   */
  const firstSegment = pathname.split('/')[1];
  const fromPath = isLocale(firstSegment) ? firstSegment : null;
  const stored = request.cookies.get(LOCALE_COOKIE)?.value;

  const locale =
    fromPath ??
    (isLocale(stored) ? stored : negotiateLocale(request.headers.get('accept-language')));

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER, locale);

  let response = NextResponse.next({ request: { headers: requestHeaders } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request: { headers: requestHeaders } });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // getUser() revalide le jeton aupres de Supabase. Ne pas remplacer par
  // getSession(), qui se contente de lire un cookie falsifiable.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Deja connecte : les pages d'authentification n'ont plus de sens, quelle
  // que soit la langue du chemin.
  if (user && /^\/(fr|en)\/(login|signup)$/.test(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  /*
   * Provenance de la premiere visite.
   *
   * Ici plutot que dans une page : le proxy voit TOUTES les entrees, y compris
   * quelqu'un qui arrive directement sur /fr/signup depuis une publicite. Une
   * capture posee sur la page d'accueil raterait exactement les visiteurs les
   * plus interessants.
   *
   * `has` et non une ecriture systematique : la premiere visite gagne. La
   * derniere ecraserait la source d'origine par le « direct » du visiteur qui
   * revient, c'est-a-dire par le canal qui ne fait que le ramener.
   */
  const isPageView =
    request.method === 'GET' &&
    (request.headers.get('accept') ?? '').includes('text/html');

  if (isPageView && !request.cookies.has(ACQ_COOKIE)) {
    const acq = readAcquisition(
      request.headers.get('referer'),
      request.nextUrl.searchParams,
      request.nextUrl.hostname,
    );

    response.cookies.set(ACQ_COOKIE, encodeAcquisition(acq), {
      path: '/',
      maxAge: ACQ_MAX_AGE,
      sameSite: 'lax',
      // Lu uniquement par le serveur, a l'inscription. Aucun script de page
      // n'a de raison d'y toucher.
      httpOnly: true,
    });
  }

  // Une langue choisie par l'URL devient la preference du visiteur : le
  // dashboard, qui n'a pas de segment de langue, la reprendra ensuite.
  if (fromPath && stored !== fromPath) {
    response.cookies.set(LOCALE_COOKIE, fromPath, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|opengraph-image|widget.js|chat/|api/chat|api/lead|api/widget/|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
