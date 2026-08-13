import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { getDictionary, isLocale, LOCALES, type Locale } from '@/lib/i18n';
import { AuthForm } from '@/app/(auth)/auth-form';
import { signup } from '@/app/(auth)/actions';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function SignupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <main className="bg-muted/40 flex min-h-screen items-center justify-center p-6">
      <Suspense>
        <AuthForm
          mode="signup"
          action={signup}
          locale={locale as Locale}
          dict={getDictionary(locale)}
        />
      </Suspense>
    </main>
  );
}
