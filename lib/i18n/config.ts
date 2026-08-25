export const LOCALES = ['fr', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'fr';

/**
 * Nom de chaque langue, ecrit dans cette langue.
 *
 * « English » et non « Anglais » : celui qui cherche sa langue la reconnait
 * telle qu'il l'ecrit, pas traduite dans une langue qu'il ne lit pas.
 *
 * Sert de nom accessible aux bascules de langue, qui n'affichent qu'un
 * drapeau : sans lui, le bouton n'a aucun libelle pour un lecteur d'ecran.
 */
export const LOCALE_NAMES: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
};

export function isLocale(value: string | undefined | null): value is Locale {
  return LOCALES.includes(value as Locale);
}

/**
 * Choisit la langue a servir a partir de l'en-tete Accept-Language.
 *
 * Volontairement simple : on cherche la premiere langue proposee que l'on
 * gere, en ignorant les qualites (`q=`). Avec deux locales, un algorithme de
 * negociation complet n'apporterait rien.
 */
export function negotiateLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  for (const part of acceptLanguage.split(',')) {
    const tag = part.split(';')[0]?.trim().toLowerCase() ?? '';
    const base = tag.split('-')[0];
    if (isLocale(base)) return base;
  }

  return DEFAULT_LOCALE;
}

/** Chemin equivalent dans l'autre langue : /fr/login -> /en/login */
export function switchLocalePath(pathname: string, target: Locale): string {
  const segments = pathname.split('/').filter(Boolean);
  if (isLocale(segments[0])) {
    segments[0] = target;
    return `/${segments.join('/')}`;
  }
  return `/${target}${pathname === '/' ? '' : pathname}`;
}
