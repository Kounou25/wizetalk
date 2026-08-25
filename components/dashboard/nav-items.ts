import { Bot, LayoutDashboard, LifeBuoy, Settings } from 'lucide-react';

import type { Dictionary } from '@/lib/i18n';

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** `/dashboard` ne doit pas s'allumer sur `/dashboard/bots`. */
  exact: boolean;
}

/**
 * Sections principales du produit — celles ou l'on travaille.
 *
 * Definies ici plutot que dans la barre laterale : la barre superieure a
 * besoin de la meme liste pour nommer la page courante, et deux listes qui
 * doivent rester synchronisees finissent toujours par diverger.
 */
export function navItems(dict: Dictionary): NavItem[] {
  const t = dict.dashboard.nav;

  return [
    { href: '/dashboard', label: t.overview, icon: LayoutDashboard, exact: true },
    { href: '/dashboard/bots', label: t.bots, icon: Bot, exact: false },
  ];
}

/**
 * Sections d'appoint : on y va ponctuellement, pas pour travailler. Elles
 * vivent en pied de barre laterale, detachees des precedentes.
 */
export function secondaryNavItems(dict: Dictionary): NavItem[] {
  const t = dict.dashboard.nav;

  return [
    { href: '/dashboard/settings', label: t.settings, icon: Settings, exact: false },
    { href: '/dashboard/help', label: t.help, icon: LifeBuoy, exact: false },
  ];
}

export function isNavActive(pathname: string, item: NavItem): boolean {
  return item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/**
 * Section a laquelle appartient le chemin courant, toutes listes confondues.
 *
 * On prend la correspondance la plus longue : `/dashboard/bots/xxx` appartient
 * a « Mes assistants », pas a « Vue d'ensemble », alors que les deux prefixes
 * correspondent.
 */
export function currentSection(pathname: string, dict: Dictionary): NavItem | undefined {
  return [...navItems(dict), ...secondaryNavItems(dict)]
    .filter((item) => isNavActive(pathname, item))
    .sort((a, b) => b.href.length - a.href.length)[0];
}
