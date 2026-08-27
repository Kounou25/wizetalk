import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Dictionary, Locale } from '@/lib/i18n';
import { Logo } from './logo';
import { LanguageToggle } from './language-toggle';

/**
 * Barre de navigation des pages publiques.
 *
 * DEUX VARIANTES, UNE SEULE BARRE
 *
 * La page de presentation et la page Enterprise n'ont ni les memes ancres ni
 * le meme appel a l'action — l'une envoie vers l'inscription, l'autre vers un
 * formulaire commercial. Elles partagent en revanche tout le reste : logo,
 * bascule de langue, connexion, comportement colle en haut.
 *
 * Une seconde barre recopiee aurait divergé au premier ajustement de hauteur.
 * D'ou ce parametre plutot qu'un composant jumeau.
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
          {/* Le mot est necessaire : sans lui, rien ne distingue cette page de
              la page de presentation, et le visiteur croit s'etre perdu. */}
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

          {/* Depuis la page de presentation seulement : sur la page Enterprise,
              ce lien renverrait sur elle-meme. */}
          {!enterprise && (
            <Link
              href={`/${locale}/enterprise`}
              className="hover:text-foreground transition-colors"
            >
              {dict.nav.enterprise}
            </Link>
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

              {/*
                L'action principale suit la page, pas la marque.
                « Essayer gratuitement » sur la page Enterprise contredirait
                tout le reste : on y vend un cadrage, pas un essai en autonomie.
              */}
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
