'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LOCALE_NAMES, LOCALES, switchLocalePath, type Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';
import { Flag } from '@/components/ui/flag';

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
          aria-label={LOCALE_NAMES[target]}
          title={LOCALE_NAMES[target]}
          className={cn(
            'flex items-center rounded-md px-2 py-1 transition-colors',
            target === locale ? 'bg-muted' : 'opacity-55 hover:opacity-100',
          )}
        >
          {/* Le drapeau porte seul l'information : `aria-label` lui donne son
              nom, le lien resterait sinon muet pour un lecteur d'ecran. */}
          <Flag locale={target} />
        </Link>
      ))}
    </div>
  );
}
