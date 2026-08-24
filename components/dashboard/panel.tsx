import { cn } from '@/lib/utils';

/**
 * Bloc de contenu du tableau de bord.
 *
 * Toutes les cartes partagent desormais le meme chrome (classe `.panel` dans
 * globals.css) et le meme en-tete. C'est ce qui donne au tableau de bord son
 * rythme : un panneau = un sujet, avec toujours le titre au meme endroit.
 */
export function Panel({ className, ...props }: React.ComponentProps<'section'>) {
  return <section className={cn('panel', className)} {...props} />;
}

export function PanelHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  /** Lien « tout voir », bascule, legende… aligne a droite du titre. */
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn('flex flex-wrap items-start justify-between gap-x-4 gap-y-2', className)}
    >
      <div className="min-w-0">
        <h2 className="font-semibold">{title}</h2>
        {description && (
          <p className="text-muted-foreground mt-0.5 text-sm text-pretty">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/**
 * Style des liens « tout voir » des en-tetes de panneau. Une constante plutot
 * qu'un composant : ils sont tantot des <Link>, tantot des <a> externes.
 */
export const panelLinkClass =
  'text-muted-foreground hover:text-foreground inline-flex shrink-0 items-center gap-1 text-sm font-medium transition-colors';
