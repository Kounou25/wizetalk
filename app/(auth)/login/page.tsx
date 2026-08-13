import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { negotiateLocale } from '@/lib/i18n';

/**
 * Redirection de compatibilite : la vraie page vit sous /fr/login et /en/login.
 *
 * Elle existe pour que tous les `redirect('/login')` du code serveur — proxy,
 * deconnexion, rappel OAuth — continuent de fonctionner sans avoir a connaitre
 * la langue de l'utilisateur.
 */
export default async function LoginRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = negotiateLocale((await headers()).get('accept-language'));

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (typeof value === 'string') query.set(key, value);
  }

  const suffix = query.size > 0 ? `?${query}` : '';
  redirect(`/${locale}/login${suffix}`);
}
