import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Le couple d'appels a l'action de la page.
 *
 * « Demander une demo » pointe sur #demo, « parler a notre equipe » sur
 * #contact. Les deux ancres vivent dans la meme section : le formulaire lit le
 * fragment d'URL et pre-selectionne l'intention, qui part ensuite en base —
 * c'est ainsi qu'on saura lequel des deux libelles amene des rendez-vous.
 *
 * `lead` change la hierarchie visuelle, jamais l'association ancre/libelle :
 * sans cette distinction, inverser l'ordre des boutons enverrait « parler a
 * notre equipe » sur l'ancre de la demo, et l'intention enregistree serait
 * fausse.
 */
export function EnterpriseCta({
  demoLabel,
  contactLabel,
  lead = 'demo',
  size = 'lg',
  className,
}: {
  demoLabel: string;
  contactLabel: string;
  lead?: 'demo' | 'contact';
  size?: 'default' | 'lg';
  className?: string;
}) {
  const height = size === 'lg' ? 'h-12 px-6 text-base' : 'h-11 px-5 text-sm';

  const demo = { href: '#demo', label: demoLabel };
  const contact = { href: '#contact', label: contactLabel };

  const [first, second] = lead === 'demo' ? [demo, contact] : [contact, demo];

  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row', className)}>
      <Button
        asChild
        size={size}
        className={cn('bg-brand hover:bg-brand/90 text-brand-foreground group', height)}
      >
        <a href={first.href}>
          {first.label}
          <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
        </a>
      </Button>

      <Button asChild size={size} variant="outline" className={height}>
        <a href={second.href}>{second.label}</a>
      </Button>
    </div>
  );
}
