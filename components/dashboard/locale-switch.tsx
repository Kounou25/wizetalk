'use client';

import { useTransition } from 'react';
import { LOCALE_NAMES, LOCALES, type Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';
import { Flag } from '@/components/ui/flag';
import { setLocale } from '@/app/dashboard/locale-actions';

/** Bascule de langue du dashboard : ecrit la preference, puis rafraichit. */
export function LocaleSwitch({ locale }: { locale: Locale }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="bg-surface-subtle border-border flex items-center rounded-lg border p-0.5" role="group">
      {LOCALES.map((target) => (
        <button
          key={target}
          type="button"
          disabled={pending || target === locale}
          aria-current={target === locale ? 'true' : undefined}
          onClick={() => startTransition(() => setLocale(target))}
          aria-label={LOCALE_NAMES[target]}
          title={LOCALE_NAMES[target]}
          className={cn(
            'focus-ring flex cursor-pointer items-center rounded-md px-1.5 py-1 transition-colors disabled:cursor-default',
            target === locale
              ? 'bg-surface border-border border shadow-[var(--elevation-flat)]'
              : 'border border-transparent opacity-55 hover:opacity-100',
          )}
        >
          {/* Le drapeau porte seul l'information : d'ou `aria-label`, sans
              lequel le bouton n'aurait aucun libelle, et l'opacite qui
              distingue la langue active  la couleur ne suffirait pas. */}
          <Flag locale={target} />
        </button>
      ))}
    </div>
  );
}
