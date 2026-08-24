'use client';

import { useTransition } from 'react';
import { LOCALES, type Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';
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
          className={cn(
            'focus-ring cursor-pointer rounded-md px-1.5 py-0.5 text-[11px] font-semibold uppercase transition-colors disabled:cursor-default',
            target === locale
              ? 'bg-surface text-foreground border-border border shadow-[var(--elevation-flat)]'
              : 'text-muted-foreground hover:text-foreground border border-transparent',
          )}
        >
          {target}
        </button>
      ))}
    </div>
  );
}
