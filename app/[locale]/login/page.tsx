import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { getDictionary, isLocale, LOCALES, type Locale } from '@/lib/i18n';
import { AuthForm } from '@/app/(auth)/auth-form';
import { login } from '@/app/(auth)/actions';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <main className="bg-surface-page flex min-h-screen items-center justify-center p-6">
      <Suspense>
        <AuthForm
          mode="login"
          action={login}
          locale={locale as Locale}
          dict={getDictionary(locale)}
        />
      </Suspense>
    </main>
  );
}
