'use client';

import Link, { useLinkStatus } from 'next/link';
import { Plus, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { Dictionary, Locale } from '@/lib/i18n';
import { Logo } from '@/components/landing/logo';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { isNavActive, navItems, secondaryNavItems, type NavItem } from './nav-items';
import { isExhausted, isNearLimit, remaining, type MessageBalance } from '@/lib/plans';
import { UpgradeButton } from './upgrade-button';
import type { UpgradeOffer } from './upgrade-dialog';

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

/**
 * Jauge de credits.
 *
 * A zero, elle ne se contente pas d'afficher un compteur vide : elle dit ce
 * que l'assistant fait encore. Un client qui voit « epuise » sans autre
 * precision suppose que son widget est mort sur son site  alors qu'il
 * continue de recuperer des adresses.
 */
function CreditMeter({
  balance,
  offer,
  locale,
  dict,
}: {
  balance: MessageBalance;
  offer: UpgradeOffer | null;
  locale: Locale;
  dict: Dictionary;
}) {
  const t = dict.dashboard.quota;
  const numberLocale = locale === 'fr' ? 'fr-FR' : 'en-US';

  const left = remaining(balance);
  const exhausted = isExhausted(balance);
  const nearLimit = isNearLimit(balance);

  return (
    <div className="px-3 pb-3">
      <div className="border-border bg-surface-subtle/60 rounded-lg border p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium">{t.title}</p>
          <Badge variant={balance.plan === 'trial' ? 'neutral' : 'brand'}>
            {t.plans[balance.plan]}
          </Badge>
        </div>

        <Progress
          value={balance.used}
          max={Math.max(1, balance.included)}
          label={t.title}
          tone={exhausted ? 'danger' : nearLimit ? 'warning' : 'brand'}
          className="mt-2.5"
        />

        <p className="text-muted-foreground mt-2 text-[11px] tabular-nums">
          {left.toLocaleString(numberLocale)} {t.remaining} {t.of}{' '}
          {balance.included.toLocaleString(numberLocale)}
        </p>

        {exhausted && (
          <p className="mt-2 rounded-md bg-amber-500/10 px-2 py-1.5 text-[11px] leading-snug text-amber-700 dark:text-amber-400">
            {t.exhaustedHint}
          </p>
        )}

        {/*
          Quota epuise : on ouvre la comparaison des paliers plutot que de
          renvoyer vers les reglages. Le client voit alors ce que le palier
          suivant lui rendrait, au moment precis ou la limite le gene.

          Tant qu'il reste des messages, le lien discret suffit : rien ne
          justifie d'interrompre quelqu'un qui n'est bloque par rien.
        */}
        {offer ? (
          <UpgradeButton
            offer={offer}
            label={t.action}
            locale={locale}
            dict={dict}
            variant="ghost"
            size="sm"
            className="text-brand mt-2 h-7 px-0 text-[11px] font-semibold hover:bg-transparent hover:underline"
          />
        ) : (
          <Link
            href="/dashboard/settings#abonnement"
            className="focus-ring text-brand mt-2 inline-block rounded text-[11px] font-semibold hover:underline"
          >
            {t.action}
          </Link>
        )}
      </div>
    </div>
  );
}

export function SidebarContent({
  pathname,
  botCount,
  balance,
  messagesOffer,
  locale,
  dict,
  onNavigate,
}: {
  pathname: string;
  botCount: number;
  balance: MessageBalance | null;
  /** Non nul uniquement quand le quota est epuise. */
  messagesOffer: UpgradeOffer | null;
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

      {balance && (
        <CreditMeter
          balance={balance}
          offer={messagesOffer}
          locale={locale}
          dict={dict}
        />
      )}
    </div>
  );
}
