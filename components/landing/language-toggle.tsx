'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LOCALES, switchLocalePath, type Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';

/**
 * Bascule de langue.
 *
 * De vrais liens vers l'autre URL, pas un changement d'etat : c'est ce qui
 * permet a un moteur de recherche de suivre les deux versions, et a
 * l'utilisateur de partager la page dans la langue qu'il lit.
 */
export function LanguageToggle({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  return (
    <div className="flex items-center rounded-lg border p-0.5" role="group">
      {LOCALES.map((target) => (
        <Link
          key={target}
          href={switchLocalePath(pathname, target)}
          hrefLang={target}
          aria-current={target === locale ? 'true' : undefined}
          className={cn(
            'rounded-md px-2 py-0.5 text-xs font-semibold uppercase transition-colors',
            target === locale
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {target}
        </Link>
      ))}
    </div>
  );
}
