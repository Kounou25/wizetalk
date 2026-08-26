import type { MetadataRoute } from 'next';

import { PUBLIC_APP_URL } from '@/lib/public-url';

/**
 * Directives d'exploration.
 *
 * Tout ce qui est derriere une authentification est explicitement interdit.
 * Ces pages redirigent deja un visiteur anonyme vers la connexion, donc rien
 * ne fuiterait — mais un robot qui les demande consomme du budget
 * d'exploration pour recevoir une redirection, budget pris sur les pages qu'on
 * veut reellement voir indexees.
 *
 * `/chat/` est interdit pour une autre raison : ce sont les fenetres de
 * discussion des assistants de nos clients. Indexees, elles apparaitraient
 * dans les resultats a la place du site du client.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/admin', '/api/', '/chat/', '/login', '/signup'],
      },
    ],
    sitemap: `${PUBLIC_APP_URL}/sitemap.xml`,
    host: PUBLIC_APP_URL,
  };
}
