import { en } from './en';
import { fr, type Dictionary } from './fr';
import { DEFAULT_LOCALE, type Locale } from './config';

const DICTIONARIES: Record<Locale, Dictionary> = { fr, en };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
}

export type { Dictionary };
export * from './config';
