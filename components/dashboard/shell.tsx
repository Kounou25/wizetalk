'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

import type { Dictionary, Locale } from '@/lib/i18n';
import { useFocusTrap } from '@/components/ui/use-focus-trap';
import { SidebarContent } from './sidebar';
import { TopBar } from './topbar';
import type { CreditBalance } from '@/lib/credits';
import type { ShellUser } from './types';

export type { ShellUser };

interface DashboardShellProps {
  user: ShellUser;
  botCount: number;
  /** `null` tant que le profil n'a pas ete cree. */
  balance: CreditBalance | null;
  locale: Locale;
  dict: Dictionary;
  /** Affiche l'entree vers le back-office. Le droit reel est verifie cote serveur. */
  isAdmin: boolean;
  children: React.ReactNode;
}

/**
 * Coquille du produit connecte : barre laterale fixe, barre superieure
 * collante, zone de contenu.
 *
 * Elle ne fait que composer — la navigation vit dans `sidebar.tsx`, le compte
 * et la langue dans `topbar.tsx`, la liste des sections dans `nav-items.ts`.
 */
export function DashboardShell({
  user,
  botCount,
  balance,
  locale,
  dict,
  isAdmin,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);

  useFocusTrap(drawerRef, mobileOpen);

  // Le tiroir se referme au changement de page et a la touche Echap : sur
  // mobile, un panneau qui reste ouvert masque la page qu'on vient d'ouvrir.
  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  return (
    <div className="bg-surface-page min-h-screen">
      <aside className="bg-surface border-border fixed inset-y-0 left-0 z-30 hidden w-60 border-r lg:block">
        <SidebarContent
          pathname={pathname}
          botCount={botCount}
          balance={balance}
          locale={locale}
          dict={dict}
        />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside
            ref={drawerRef}
            className="bg-surface absolute inset-y-0 left-0 w-64 shadow-[var(--elevation-overlay)]"
            role="dialog"
            aria-modal="true"
            aria-label={dict.dashboard.nav.section}
          >
            <SidebarContent
              pathname={pathname}
              botCount={botCount}
              balance={balance}
              locale={locale}
              dict={dict}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="lg:pl-60">
        <TopBar
          user={user}
          locale={locale}
          dict={dict}
          isAdmin={isAdmin}
          onOpenMenu={() => setMobileOpen(true)}
        />

        {/* 1280 px : au-dela, une grille de tableau de bord se delite — les
            lignes de liste deviennent des rubans et le regard perd la colonne. */}
        <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
