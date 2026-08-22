import Link from 'next/link';
import type { Dictionary, Locale } from '@/lib/i18n';
import { Logo } from './logo';
import { LanguageToggle } from './language-toggle';

export function LandingFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <Logo className="h-8" />
          <p className="text-muted-foreground mt-3 text-sm text-pretty">
            {dict.footer.tagline}
          </p>
          <div className="mt-5">
            <LanguageToggle locale={locale} />
          </div>
        </div>

        <div className="flex gap-16 text-sm">
          <div className="flex flex-col gap-3">
            <p className="font-medium">{dict.footer.productTitle}</p>
            <a href="#solution" className="text-muted-foreground hover:text-foreground">
              {dict.footer.howItWorks}
            </a>
            <a href="#tarifs" className="text-muted-foreground hover:text-foreground">
              {dict.nav.pricing}
            </a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground">
              {dict.nav.faq}
            </a>
          </div>

          <div className="flex flex-col gap-3">
            <p className="font-medium">{dict.footer.accountTitle}</p>
            <Link
              href={`/${locale}/login`}
              className="text-muted-foreground hover:text-foreground"
            >
              {dict.footer.login}
            </Link>
            <Link
              href={`/${locale}/signup`}
              className="text-muted-foreground hover:text-foreground"
            >
              {dict.footer.signup}
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t">
        <p className="text-muted-foreground mx-auto max-w-6xl px-6 py-6 text-xs">
          © {new Date().getFullYear()} Deezy. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}
