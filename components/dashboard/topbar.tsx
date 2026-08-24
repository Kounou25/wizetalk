'use client';

import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LifeBuoy, LogOut, Menu, ShieldCheck } from 'lucide-react';

import type { Dictionary, Locale } from '@/lib/i18n';
import { logout } from '@/app/(auth)/actions';
import { Avatar } from '@/components/ui/avatar';
import {
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
  DropdownSeparator,
  dropdownItemClass,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { currentSection, navItems } from './nav-items';
import { LocaleSwitch } from './locale-switch';
import type { ShellUser } from './types';

/** Entree « se deconnecter » : un bouton d'envoi dans le menu, pas un lien. */
function LogoutItem({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      role="menuitem"
      disabled={pending}
      className={`${dropdownItemClass} text-red-600 hover:bg-red-500/10 disabled:opacity-60`}
    >
      {pending ? (
        <Spinner className="size-4 shrink-0" />
      ) : (
        <LogOut className="size-4 shrink-0" aria-hidden />
      )}
      {label}
    </button>
  );
}

/**
 * Barre superieure du produit.
 *
 * Elle porte ce qui vaut pour toutes les pages — ou l'on se trouve, la langue,
 * le compte — et libere la barre laterale, qui n'a plus a servir de fourre-tout.
 * Le titre de section vient de la meme liste que la navigation : il ne peut pas
 * contredire l'entree allumee a gauche.
 */
export function TopBar({
  user,
  locale,
  dict,
  isAdmin,
  onOpenMenu,
}: {
  user: ShellUser;
  locale: Locale;
  dict: Dictionary;
  isAdmin: boolean;
  onOpenMenu: () => void;
}) {
  const pathname = usePathname();
  const t = dict.dashboard.nav;
  const section = currentSection(pathname, navItems(dict));

  return (
    <header className="border-border bg-surface/85 supports-[backdrop-filter]:bg-surface/70 sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onOpenMenu}
        className="focus-ring hover:bg-surface-subtle -ml-1 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors lg:hidden"
        aria-label={t.openMenu}
      >
        <Menu className="size-5" />
      </button>

      {/* Sur la racine d'une section, le libelle est un simple reperage ; plus
          bas dans l'arborescence il devient le chemin du retour. */}
      {section &&
        (pathname === section.href ? (
          <p className="truncate text-sm font-semibold">{section.label}</p>
        ) : (
          <Link
            href={section.href}
            className="focus-ring text-muted-foreground hover:text-foreground truncate rounded text-sm font-medium transition-colors"
          >
            {section.label}
          </Link>
        ))}

      <div className="ml-auto flex items-center gap-2">
        <LocaleSwitch locale={locale} />

        <a
          href={`/${locale}#faq`}
          className="focus-ring text-muted-foreground hover:bg-surface-subtle hover:text-foreground hidden size-9 items-center justify-center rounded-lg transition-colors sm:flex"
          aria-label={t.help}
          title={t.help}
        >
          <LifeBuoy className="size-4" />
        </a>

        <DropdownMenu
          label={t.account}
          triggerClassName="hover:bg-surface-subtle flex items-center gap-2 rounded-lg py-1 pr-1.5 pl-1 transition-colors"
          trigger={
            <>
              <Avatar initials={user.initials} size="sm" />
              <span className="text-muted-foreground hidden max-w-40 truncate text-xs sm:block">
                {user.email}
              </span>
            </>
          }
        >
          <DropdownLabel>
            <p className="text-muted-foreground text-[11px]">{t.signedInAs}</p>
            <p className="mt-0.5 truncate text-sm font-medium">{user.email}</p>
          </DropdownLabel>

          <DropdownSeparator />

          <DropdownItem href={`/${locale}#faq`} icon={LifeBuoy}>
            {t.help}
          </DropdownItem>

          {/* « Administration » s'ecrit pareil dans les deux langues : pas de
              cle de dictionnaire pour un mot identique. */}
          {isAdmin && (
            <DropdownItem href="/admin" icon={ShieldCheck} tone="danger">
              Administration
            </DropdownItem>
          )}

          <DropdownSeparator />

          <form action={logout}>
            <LogoutItem label={t.logout} />
          </form>
        </DropdownMenu>
      </div>
    </header>
  );
}
