'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/landing/logo';
import { LanguageToggle } from '@/components/landing/language-toggle';
import type { Dictionary, Locale } from '@/lib/i18n';
import { GoogleButton } from './google-button';
import type { AuthState } from './actions';

interface AuthFormProps {
  mode: 'login' | 'signup';
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
  locale: Locale;
  dict: Dictionary;
}

export function AuthForm({ mode, action, locale, dict }: AuthFormProps) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, {});
  const searchParams = useSearchParams();

  const next = searchParams.get('next') ?? '/dashboard';
  // Les echecs OAuth reviennent par l'URL : la route de rappel n'a pas d'autre
  // canal pour signaler un consentement refuse.
  const oauthError = searchParams.get('error');
  const error = state.error ?? oauthError;

  const isLogin = mode === 'login';
  const t = dict.auth;

  return (
    <div className="w-full max-w-sm">
      <div className="flex flex-col items-center text-center">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <Logo className="size-8" />
          <span className="text-lg font-bold tracking-tight">Deezy</span>
        </Link>

        <h1 className="mt-6 text-2xl font-bold tracking-tight">
          {isLogin ? t.loginTitle : t.signupTitle}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm text-pretty">
          {isLogin ? t.loginLead : t.signupLead}
        </p>
      </div>

      <div className="bg-background mt-8 rounded-xl p-6 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        <GoogleButton
          next={next}
          label={isLogin ? t.googleLogin : t.googleSignup}
          pendingLabel={t.redirecting}
        />

        <div className="my-5 flex items-center gap-3">
          <span className="bg-border h-px flex-1" />
          <span className="text-muted-foreground text-xs">{t.or}</span>
          <span className="bg-border h-px flex-1" />
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="next" value={next} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">{t.email}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={t.emailPlaceholder}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">{t.password}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              minLength={8}
              required
            />
            {!isLogin && <p className="text-muted-foreground text-xs">{t.passwordHint}</p>}
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
          {state.message && (
            <p
              role="status"
              className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700"
            >
              {state.message}
            </p>
          )}

          <Button
            type="submit"
            disabled={pending}
            className="bg-brand hover:bg-brand/90 text-brand-foreground"
          >
            {pending ? t.pending : isLogin ? t.submitLogin : t.submitSignup}
          </Button>
        </form>
      </div>

      <p className="text-muted-foreground mt-6 text-center text-sm">
        {isLogin ? (
          <>
            {t.noAccount}{' '}
            <Link
              href={`/${locale}/signup`}
              className="text-foreground font-medium hover:underline"
            >
              {t.createAccount}
            </Link>
          </>
        ) : (
          <>
            {t.hasAccount}{' '}
            <Link
              href={`/${locale}/login`}
              className="text-foreground font-medium hover:underline"
            >
              {t.signIn}
            </Link>
          </>
        )}
      </p>

      <div className="mt-6 flex justify-center">
        <LanguageToggle locale={locale} />
      </div>
    </div>
  );
}
