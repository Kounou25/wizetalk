'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link, { useLinkStatus } from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bot,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Plus,
  ShieldCheck,
  X,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import type { Dictionary, Locale } from '@/lib/i18n';
import { Logo } from '@/components/landing/logo';
import { logout } from '@/app/(auth)/actions';
import { Spinner } from '@/components/ui/spinner';
import { LocaleSwitch } from './locale-switch';

export interface ShellUser {
  email: string;
  initials: string;
}

export interface ShellUsage {
  used: number;
  quota: number;
}

interface DashboardShellProps {
  user: ShellUser;
  botCount: number;
  usage: ShellUsage;
  locale: Locale;
  dict: Dictionary;
  /** Affiche l'entree vers le back-office. Le droit reel est verifie cote serveur. */
  isAdmin: boolean;
  children: React.ReactNode;
}

/**
 * Icone d'un lien de navigation, remplacee par un anneau pendant la
 * transition. useLinkStatus ne renseigne que les descendants du <Link> qu'il
 * observe : ce composant doit donc rester a l'interieur.
 *
 * C'est ce qui evite l'impression de page figee : le clic produit un retour
 * visuel immediat, avant meme que le serveur ait commence a repondre.
 */
function NavIcon({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
  const { pending } = useLinkStatus();
  return pending ? <Spinner className="size-4" /> : <Icon className="size-4" />;
}

/** Bouton de deconnexion : l'appel reseau merite un retour visuel. */
function LogoutButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors disabled:opacity-60"
      aria-label={label}
      title={label}
    >
      {pending ? <Spinner className="size-4" /> : <LogOut className="size-4" />}
    </button>
  );
}

function isActive(pathname: string, href: string, exact: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarContent({
  pathname,
  user,
  botCount,
  usage,
  locale,
  dict,
  isAdmin,
  onNavigate,
}: {
  pathname: string;
  user: ShellUser;
  botCount: number;
  usage: ShellUsage;
  locale: Locale;
  dict: Dictionary;
  isAdmin: boolean;
  onNavigate?: () => void;
}) {
  const t = dict.dashboard.nav;

  const items = [
    { href: '/dashboard', label: t.overview, icon: LayoutDashboard, exact: true },
    { href: '/dashboard/bots', label: t.bots, icon: Bot, exact: false, badge: botCount },
  ];

  const ratio = usage.quota > 0 ? Math.min(1, usage.used / usage.quota) : 0;
  const numberLocale = locale === 'fr' ? 'fr-FR' : 'en-US';

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center justify-between border-b px-5">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={onNavigate}>
          <Logo />
          <span className="font-bold tracking-tight">Wizetalk</span>
        </Link>
        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            className="hover:bg-accent flex size-8 items-center justify-center rounded-lg"
            aria-label={t.closeMenu}
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="px-3 pt-4">
        <Link
          href="/dashboard/bots/new"
          onClick={onNavigate}
          className="bg-brand text-brand-foreground hover:bg-brand/90 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
        >
          <NavIcon icon={Plus} />
          {t.newBot}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="text-muted-foreground px-3 pb-1.5 text-[11px] font-semibold tracking-wider uppercase">
          {t.section}
        </p>
        <div className="space-y-0.5">
          {items.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-brand-soft text-brand'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                <NavIcon icon={item.icon} />
                <span className="flex-1">{item.label}</span>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums',
                      active ? 'bg-brand/15 text-brand' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Consommation cumulee de tous les assistants : le premier signal
          qu'un client approche de sa limite. */}
      {usage.quota > 0 && (
        <div className="bg-muted/60 mx-3 mb-3 rounded-xl p-3 ring-1 ring-black/5 dark:ring-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">{t.usageTitle}</span>
            <Link href={`/${locale}#tarifs`} className="text-brand text-xs font-semibold hover:underline">
              {t.usageAction}
            </Link>
          </div>
          <div className="bg-muted mt-2 h-1.5 overflow-hidden rounded-full">
            <div
              className="bg-brand h-full rounded-full transition-all duration-300"
              style={{ width: `${ratio * 100}%` }}
            />
          </div>
          <p className="text-muted-foreground mt-1.5 text-[11px] tabular-nums">
            {usage.used.toLocaleString(numberLocale)} {t.usageOf}{' '}
            {usage.quota.toLocaleString(numberLocale)}
          </p>
        </div>
      )}

      <div className="shrink-0 border-t p-3">
        {/* « Administration » s'ecrit pareil dans les deux langues : pas de
            cle de dictionnaire pour un mot identique. */}
        {isAdmin && (
          <Link
            href="/admin"
            onClick={onNavigate}
            className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/10"
          >
            <NavIcon icon={ShieldCheck} />
            Administration
          </Link>
        )}

        <Link
          href={`/${locale}#faq`}
          onClick={onNavigate}
          className="text-muted-foreground hover:bg-accent hover:text-foreground mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
        >
          <NavIcon icon={LifeBuoy} />
          {t.help}
        </Link>

        <div className="px-3 py-2">
          <LocaleSwitch locale={locale} />
        </div>

        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <span className="bg-foreground text-background flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold">
            {user.initials}
          </span>
          <p className="text-muted-foreground min-w-0 flex-1 truncate text-xs">{user.email}</p>
          <form action={logout}>
            <LogoutButton label={t.logout} />
          </form>
        </div>
      </div>
    </div>
  );
}

export function DashboardShell({
  user,
  botCount,
  usage,
  locale,
  dict,
  isAdmin,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="bg-muted/40 min-h-screen">
      <aside className="bg-background fixed inset-y-0 left-0 z-30 hidden w-64 border-r lg:block">
        <SidebarContent
          pathname={pathname}
          user={user}
          botCount={botCount}
          usage={usage}
          locale={locale}
          dict={dict}
          isAdmin={isAdmin}
        />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="bg-background absolute inset-y-0 left-0 w-64 shadow-xl">
            <SidebarContent
              pathname={pathname}
              user={user}
              botCount={botCount}
              usage={usage}
              locale={locale}
              dict={dict}
              isAdmin={isAdmin}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <div className="bg-background flex h-16 items-center gap-3 border-b px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="hover:bg-accent flex size-9 items-center justify-center rounded-lg"
            aria-label={dict.dashboard.nav.openMenu}
          >
            <Menu className="size-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo />
            <span className="font-bold tracking-tight">Wizetalk</span>
          </Link>
        </div>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
