import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { negotiateLocale } from '@/lib/i18n';

/** Redirection de compatibilite — voir app/(auth)/login/page.tsx. */
export default async function SignupRedirect({
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
  redirect(`/${locale}/signup${suffix}`);
}
