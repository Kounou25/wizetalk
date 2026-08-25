import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * Panneau : l'unite de composition du produit connecte.
 *
 * Le chrome (surface, bordure, rayon, elevation) vit dans la classe `.panel`
 * de globals.css. Les composants ne portent plus que leur contenu, et deux
 * panneaux voisins sont garantis identiques au pixel pres.
 */
export function Panel({ className, ...props }: React.ComponentProps<'section'>) {
  return <section className={cn('panel', className)} {...props} />;
}

/**
 * En-tete de panneau.
 *
 * Le filet bas est present par defaut : un panneau contient presque toujours
 * une liste ou un graphique, et l'en-tete doit s'en detacher. On le retire
 * (`divided={false}`) quand le contenu est un simple bloc de texte.
 */
export function PanelHeader({
  title,
  description,
  action,
  divided = true,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  divided?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3.5',
        divided && 'border-border border-b',
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-sm font-semibold">{title}</h2>
        {description && (
          <p className="text-muted-foreground mt-0.5 text-xs text-pretty">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/**
 * En-tete de page : le titre, ce qu'on y fait, et l'action principale.
 * Partage par toutes les pages du tableau de bord pour que le regard trouve
 * toujours le titre et le bouton au meme endroit.
 */
export function PageHeader({
  title,
  description,
  action,
  meta,
  icon,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** Compteur, etiquette d'etat… pose a cote du titre. */
  meta?: React.ReactNode;
  /** Vignette a gauche du titre — icone du site, logo… */
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
      <div className="flex min-w-0 items-center gap-3">
        {icon}
        <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <h1 className="truncate text-xl font-semibold tracking-tight">{title}</h1>
          {meta}
        </div>
        {description && (
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm text-pretty">
            {description}
          </p>
        )}
        </div>
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}

/** Style des liens « tout voir » d'un en-tete de panneau. */
export const panelLinkClass =
  'focus-ring text-muted-foreground hover:text-foreground inline-flex shrink-0 items-center gap-1 rounded-md text-xs font-medium transition-colors';

/**
 * Retour vers le niveau superieur. Discret et place au-dessus du titre : c'est
 * un fil d'Ariane a une marche, pas une action de la page.
 */
export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="focus-ring text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1.5 rounded text-xs font-medium transition-colors"
    >
      <ArrowLeft className="size-3.5" aria-hidden />
      {children}
    </Link>
  );
}
