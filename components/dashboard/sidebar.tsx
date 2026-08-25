'use client';

import Link, { useLinkStatus } from 'next/link';
import { Plus, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { Dictionary, Locale } from '@/lib/i18n';
import { Logo } from '@/components/landing/logo';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { isNavActive, navItems, secondaryNavItems, type NavItem } from './nav-items';
import type { ShellUsage } from './types';

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

function NavLink({
  item,
  active,
  badge,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  badge?: number;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'focus-ring flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-surface-subtle text-foreground border-border border'
          : 'text-muted-foreground hover:bg-surface-subtle hover:text-foreground border border-transparent',
      )}
    >
      <NavIcon icon={item.icon} />
      <span className="flex-1 truncate">{item.label}</span>
      {typeof badge === 'number' && badge > 0 && (
        <span className="text-muted-foreground text-xs font-semibold tabular-nums">
          {badge}
        </span>
      )}
    </Link>
  );
}

/** Jauge de consommation : le premier signal qu'un client approche sa limite. */
function UsageMeter({
  usage,
  locale,
  dict,
}: {
  usage: ShellUsage;
  locale: Locale;
  dict: Dictionary;
}) {
  const t = dict.dashboard.nav;
  const ratio = usage.quota > 0 ? Math.min(1, usage.used / usage.quota) : 0;
  // Au-dela de 80 %, la jauge change de ton : c'est la que le client doit
  // envisager un plan superieur, pas quand le quota est deja atteint.
  const nearLimit = ratio >= 0.8;
  const numberLocale = locale === 'fr' ? 'fr-FR' : 'en-US';

  return (
    <div className="px-3 pb-3">
      <div className="border-border bg-surface-subtle/60 rounded-lg border p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium">{t.usageTitle}</p>
          <p
            className={cn(
              'text-xs font-semibold tabular-nums',
              nearLimit ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground',
            )}
          >
            {Math.round(ratio * 100)} %
          </p>
        </div>

        <Progress
          value={usage.used}
          max={usage.quota}
          label={t.usageTitle}
          tone={nearLimit ? 'warning' : 'brand'}
          className="mt-2.5"
        />

        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-muted-foreground text-[11px] tabular-nums">
            {usage.used.toLocaleString(numberLocale)} {t.usageOf}{' '}
            {usage.quota.toLocaleString(numberLocale)}
          </p>
          <Link
            href={`/${locale}#tarifs`}
            className="focus-ring text-brand rounded text-[11px] font-semibold hover:underline"
          >
            {t.usageAction}
          </Link>
        </div>
      </div>
    </div>
  );
}

export function SidebarContent({
  pathname,
  botCount,
  usage,
  locale,
  dict,
  onNavigate,
}: {
  pathname: string;
  botCount: number;
  usage: ShellUsage;
  locale: Locale;
  dict: Dictionary;
  /** Fourni uniquement dans le tiroir mobile : ferme apres navigation. */
  onNavigate?: () => void;
}) {
  const t = dict.dashboard.nav;
  const items = navItems(dict);
  const secondary = secondaryNavItems(dict);

  return (
    <div className="flex h-full flex-col">
      <div className="border-border flex h-14 shrink-0 items-center justify-between border-b px-4">
        <Link href="/dashboard" aria-label="Deezy" onClick={onNavigate} className="focus-ring rounded">
          <Logo className="h-6" />
        </Link>
        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            className="focus-ring hover:bg-surface-subtle flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
            aria-label={t.closeMenu}
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* <div className="px-3 pt-3">
        <Link
          href="/dashboard/bots/new"
          onClick={onNavigate}
          className="focus-ring bg-brand text-brand-foreground hover:bg-brand/90 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          <NavIcon icon={Plus} />
          {t.newBot}
        </Link>
      </div> */}

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label={t.section}>
        <p className="text-muted-foreground px-2.5 pb-1.5 text-[11px] font-semibold tracking-wider uppercase">
          {t.section}
        </p>
        <div className="space-y-0.5">
          {items.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isNavActive(pathname, item)}
              badge={item.href === '/dashboard/bots' ? botCount : undefined}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </nav>

      {/* Reglages et aide : on y passe, on n'y travaille pas. Detaches du bloc
          principal par un filet plutot que ranges sous un intitule de plus. */}
      <div className="border-border space-y-0.5 border-t px-3 py-3">
        {secondary.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={isNavActive(pathname, item)}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      {usage.quota > 0 && <UsageMeter usage={usage} locale={locale} dict={dict} />}
    </div>
  );
}
