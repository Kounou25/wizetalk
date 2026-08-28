import Link from 'next/link';
import { ArrowUpRight, Building2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Dictionary, Locale } from '@/lib/i18n';
import { Logo } from './logo';
import { LanguageToggle } from './language-toggle';

/**
 * Barre de navigation des pages publiques.
 *
 * Deux variantes plutot que deux barres : la page de presentation et la page
 * Enterprise n'ont ni les memes ancres ni le meme appel a l'action, mais
 * partagent tout le reste. Une seconde barre recopiee aurait diverge au
 * premier ajustement.
 *
 * `authenticated` change les actions de droite : inutile de proposer
 * "Se connecter" a quelqu'un qui a deja une session ouverte.
 */
export function LandingNav({
  locale,
  dict,
  authenticated,
  variant = 'business',
}: {
  locale: Locale;
  dict: Dictionary;
  authenticated: boolean;
  variant?: 'business' | 'enterprise';
}) {
  const enterprise = variant === 'enterprise';
  const t = dict.enterprise.nav;

  /* Les ancres de la page courante. Sur la page Enterprise, pointer vers
     #probleme renverrait vers une section qui n'y existe pas. */
  const links = enterprise
    ? [
        { href: '#solution', label: t.solution },
        { href: '#cas-usage', label: t.useCases },
        { href: '#securite', label: t.security },
        { href: '#tarifs-enterprise', label: t.pricing },
        { href: '#faq-enterprise', label: t.faq },
      ]
    : [
        { href: '#probleme', label: dict.nav.problem },
        { href: '#fonctionnement', label: dict.nav.solution },
        { href: '#tarifs', label: dict.nav.pricing },
        { href: '#faq', label: dict.nav.faq },
      ];

  return (
    <header className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href={enterprise ? `/${locale}/enterprise` : `/${locale}`}
          aria-label="Deezy"
          className="flex items-center gap-2"
        >
          <Logo />
          {enterprise && (
            <span className="text-muted-foreground border-border hidden border-l pl-2 text-sm font-medium sm:inline">
              Enterprise
            </span>
          )}
        </Link>

        <div className="text-muted-foreground hidden items-center gap-8 text-sm md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}

          {/*
            Enterprise n'est pas une ancre de plus : c'est une autre page, et
            une autre offre. D'ou le filet qui la detache des ancres, et la
            pastille qui la sort du rang — sans aller jusqu'au bleu plein du
            bouton d'action, qui doit rester le seul point d'attraction fort.
          */}
          {!enterprise && (
            <>
              <span aria-hidden className="bg-border h-4 w-px" />

              <Link
                href={`/${locale}/enterprise`}
                className="group border-brand/20 bg-brand-soft text-brand hover:border-brand/45 hover:shadow-brand/10 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all hover:shadow-sm"
              >
                <Building2 className="size-3.5" aria-hidden />
                {dict.nav.enterprise}
                <ArrowUpRight
                  className="size-3 transition-transform group-hover:-translate-y-px group-hover:translate-x-px"
                  aria-hidden
                />
              </Link>
            </>
          )}
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

              {/* L'action principale suit la page : « Essayer gratuitement »
                  sur la page Enterprise contredirait ce qu'on y vend. */}
              <Button
                asChild
                size="sm"
                className="bg-brand hover:bg-brand/90 text-brand-foreground"
              >
                {enterprise ? (
                  <a href="#demo">{t.cta}</a>
                ) : (
                  <Link href={`/${locale}/signup`}>{dict.nav.signup}</Link>
                )}
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
