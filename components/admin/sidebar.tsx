'use client';

import Link, { useLinkStatus } from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft,
  Bot,
  CreditCard,
  Gauge,
  ScrollText,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

const ITEMS = [
  { href: '/admin', label: "Vue d'ensemble", icon: Gauge, exact: true },
  { href: '/admin/users', label: 'Comptes', icon: Users, exact: false },
  { href: '/admin/bots', label: 'Assistants', icon: Bot, exact: false },
  { href: '/admin/billing', label: 'Paiements', icon: CreditCard, exact: false },
  { href: '/admin/plans', label: 'Paliers', icon: SlidersHorizontal, exact: false },
  { href: '/admin/audit', label: 'Journal', icon: ScrollText, exact: false },
];

/** Voir le commentaire de NavIcon dans components/dashboard/shell.tsx. */
function NavIcon({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
  const { pending } = useLinkStatus();
  return pending ? <Spinner className="size-4" /> : <Icon className="size-4" />;
}

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="bg-surface border-border w-full shrink-0 border-b lg:h-screen lg:w-60 lg:border-r lg:border-b-0">
      <div className="border-border flex h-14 items-center gap-2 border-b px-4">
        <ShieldCheck className="size-5 text-red-600" aria-hidden />
        <span className="text-sm font-semibold tracking-tight">Administration</span>
      </div>

      <nav className="flex gap-1 overflow-x-auto p-3 lg:flex-col lg:overflow-visible">
        {ITEMS.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'focus-ring flex shrink-0 items-center gap-2.5 rounded-lg border px-2.5 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-surface-subtle text-foreground border-border'
                  : 'text-muted-foreground hover:bg-surface-subtle hover:text-foreground border-transparent',
              )}
            >
              <NavIcon icon={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-border hidden border-t p-3 lg:block">
        <Link
          href="/dashboard"
          className="focus-ring text-muted-foreground hover:bg-surface-subtle hover:text-foreground flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors"
        >
          <NavIcon icon={ArrowLeft} />
          Retour au tableau de bord
        </Link>
        <p className="text-muted-foreground truncate px-3 pt-2 text-xs">{email}</p>
      </div>
    </aside>
  );
}
