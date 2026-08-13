'use client';

import { useTransition } from 'react';
import { LOCALES, type Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';
import { setLocale } from '@/app/dashboard/locale-actions';

/** Bascule de langue du dashboard : ecrit la preference, puis rafraichit. */
export function LocaleSwitch({ locale }: { locale: Locale }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center rounded-lg border p-0.5" role="group">
      {LOCALES.map((target) => (
        <button
          key={target}
          type="button"
          disabled={pending || target === locale}
          aria-current={target === locale ? 'true' : undefined}
          onClick={() => startTransition(() => setLocale(target))}
          className={cn(
            'cursor-pointer rounded-md px-2 py-0.5 text-xs font-semibold uppercase transition-colors disabled:cursor-default',
            target === locale
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {target}
        </button>
      ))}
    </div>
  );
}
