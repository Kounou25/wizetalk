import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Dictionary, Locale } from '@/lib/i18n';
import { Logo } from './logo';
import { LanguageToggle } from './language-toggle';

/**
 * `authenticated` change les actions de droite : inutile de proposer
 * "Se connecter" a quelqu'un qui a deja une session ouverte.
 */
export function LandingNav({
  locale,
  dict,
  authenticated,
}: {
  locale: Locale;
  dict: Dictionary;
  authenticated: boolean;
}) {
  return (
    <header className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <Logo />
          <span className="font-semibold tracking-tight">Deezy</span>
        </Link>

        <div className="text-muted-foreground hidden items-center gap-8 text-sm md:flex">
          <a href="#probleme" className="hover:text-foreground transition-colors">
            {dict.nav.problem}
          </a>
          <a href="#fonctionnement" className="hover:text-foreground transition-colors">
            {dict.nav.solution}
          </a>
          <a href="#tarifs" className="hover:text-foreground transition-colors">
            {dict.nav.pricing}
          </a>
          <a href="#faq" className="hover:text-foreground transition-colors">
            {dict.nav.faq}
          </a>
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle locale={locale} />

          {authenticated ? (
            <Button asChild size="sm">
              <Link href="/dashboard">{dict.nav.dashboard}</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href={`/${locale}/login`}>{dict.nav.login}</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-brand hover:bg-brand/90 text-brand-foreground"
              >
                <Link href={`/${locale}/signup`}>{dict.nav.signup}</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
