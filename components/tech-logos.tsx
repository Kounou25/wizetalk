import {
  siFramer,
  siHtml5,
  siNextdotjs,
  siShopify,
  siSquarespace,
  siWebflow,
  siWix,
  siWordpress,
} from 'simple-icons';
import { cn } from '@/lib/utils';

type SimpleIcon = { title: string; hex: string; path: string };

/**
 * Marques officielles issues de simple-icons, rendues dans leur couleur.
 * Les marques appartiennent a leurs proprietaires respectifs ; elles servent
 * ici uniquement a identifier les plateformes compatibles.
 */
function BrandLogo({ icon, className }: { icon: SimpleIcon; className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      className={cn('size-7 shrink-0', className)}
      fill={`#${icon.hex}`}
      aria-hidden
    >
      <path d={icon.path} />
    </svg>
  );
}

const BRAND_LOGOS: Record<string, (className?: string) => React.ReactElement> = {
  WordPress: (className) => <BrandLogo icon={siWordpress} className={className} />,
  Shopify: (className) => <BrandLogo icon={siShopify} className={className} />,
  Wix: (className) => <BrandLogo icon={siWix} className={className} />,
  Squarespace: (className) => <BrandLogo icon={siSquarespace} className={className} />,
  Webflow: (className) => <BrandLogo icon={siWebflow} className={className} />,
  Framer: (className) => <BrandLogo icon={siFramer} className={className} />,
  'Next.js': (className) => <BrandLogo icon={siNextdotjs} className={className} />,
  HTML: (className) => <BrandLogo icon={siHtml5} className={className} />,
};

export function TechLogo({ name, className }: { name: string; className?: string }) {
  const render = BRAND_LOGOS[name];
  if (!render) {
    return <span className={cn('bg-muted size-7 shrink-0 rounded', className)} aria-hidden />;
  }
  return render(className);
}
