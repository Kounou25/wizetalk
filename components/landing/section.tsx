import { Reveal } from '@/components/reveal';
import { cn } from '@/lib/utils';

/**
 * Cadre commun a toutes les sections de la landing.
 *
 * Le rythme vertical d'une page de vente est un argument a lui seul : des
 * sections qui respirent inegalement se lisent comme un assemblage, pas comme
 * un raisonnement. Une seule definition ici garantit le meme souffle du haut
 * en bas de la page.
 */
export function Section({
  id,
  tone = 'default',
  className,
  children,
}: {
  id?: string;
  /** `muted` marque une rupture de fond, `dark` le creux du recit. */
  tone?: 'default' | 'muted' | 'dark';
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        'scroll-mt-20',
        tone === 'muted' && 'bg-muted/40 border-y',
        tone === 'dark' && 'bg-foreground text-background',
        className,
      )}
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = 'center',
  tone = 'default',
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: 'center' | 'left';
  tone?: 'default' | 'dark';
}) {
  return (
    <Reveal
      className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}
    >
      {eyebrow && (
        <p
          className={cn(
            'text-sm font-semibold tracking-widest uppercase',
            tone === 'dark' ? 'text-background/60' : 'text-muted-foreground',
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          'text-3xl font-bold tracking-tight text-balance md:text-[2.75rem] md:leading-[1.1]',
          eyebrow && 'mt-3',
        )}
      >
        {title}
      </h2>
      {lead && (
        <p
          className={cn(
            'mt-5 text-lg leading-relaxed text-pretty',
            tone === 'dark' ? 'text-background/70' : 'text-muted-foreground',
          )}
        >
          {lead}
        </p>
      )}
    </Reveal>
  );
}
