import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { negotiateLocale } from '@/lib/i18n';

/**
 * La racine ne sert aucun contenu : elle oriente vers la langue du visiteur.
 *
 * Chaque langue a ainsi sa propre URL indexable — c'est toute la raison
 * d'avoir des routes /fr et /en plutot qu'une bascule cote client.
 */
export default async function RootPage() {
  const acceptLanguage = (await headers()).get('accept-language');
  redirect(`/${negotiateLocale(acceptLanguage)}`);
}
