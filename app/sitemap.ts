import type { MetadataRoute } from 'next';

import { LOCALES } from '@/lib/i18n/config';
import { PUBLIC_APP_URL } from '@/lib/public-url';

/**
 * Plan du site.
 *
 * Une entree par page ET par langue, chacune declarant ses alternatives. C'est
 * le pendant des balises hreflang deja posees par les pages : le plan du site
 * les repete pour les robots qui le lisent avant d'explorer, ce qui evite
 * qu'ils traitent /fr et /en comme du contenu duplique.
 *
 * Les pages d'authentification et le produit connecte en sont absents : ils
 * sont interdits d'exploration, les lister ici se contredirait.
 *
 * LE TABLEAU DE CHEMINS PLUTOT QU'UNE LISTE ECRITE A LA MAIN
 *
 * La version precedente ne connaissait que les racines de langue. Ajouter la
 * page Enterprise aurait demande de recopier le bloc d'alternatives une
 * seconde fois — et la troisieme page aurait fini par etre oubliee. Toute
 * nouvelle page publique s'ajoute desormais par une ligne ici.
 */
const PATHS: { path: string; priority: number }[] = [
  { path: '', priority: 1 },
  // Legerement en dessous de l'accueil : c'est une page d'offre, pas la porte
  // d'entree du site.
  { path: '/enterprise', priority: 0.9 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PATHS.flatMap(({ path, priority }) =>
    LOCALES.map((locale) => ({
      url: `${PUBLIC_APP_URL}/${locale}${path}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((other) => [other, `${PUBLIC_APP_URL}/${other}${path}`]),
        ),
      },
    })),
  );
}
