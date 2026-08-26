import type { MetadataRoute } from 'next';

import { LOCALES } from '@/lib/i18n/config';
import { PUBLIC_APP_URL } from '@/lib/public-url';

/**
 * Plan du site.
 *
 * Une entree par langue, chacune declarant l'autre en alternative. C'est le
 * pendant des balises hreflang deja posees par la page : le plan du site les
 * repete pour les robots qui le lisent avant d'explorer, ce qui evite qu'ils
 * traitent /fr et /en comme du contenu duplique.
 *
 * Les pages d'authentification et le produit connecte en sont absents : ils
 * sont interdits d'exploration, les lister ici se contredirait.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return LOCALES.map((locale) => ({
    url: `${PUBLIC_APP_URL}/${locale}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 1,
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((other) => [other, `${PUBLIC_APP_URL}/${other}`]),
      ),
    },
  }));
}
