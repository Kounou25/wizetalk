import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Le couple d'appels a l'action de la page Enterprise.
 *
 * DEUX LIBELLES, DEUX ANCRES, UN SEUL FORMULAIRE
 *
 * « Demander une demo » pointe sur #demo, « Parler a notre equipe » sur
 * #contact. Les deux ancres vivent dans la meme section : le formulaire lit le
 * fragment d'URL et pre-selectionne l'intention correspondante.
 *
 * L'interet n'est pas cosmetique. L'intention part en base avec la demande,
 * donc on saura lequel des deux libelles amene reellement des rendez-vous —
 * ce qu'un bouton unique, ou deux boutons menant a la meme page neutre,
 * rendrait impossible a mesurer.
 *
 * `lead` DIT LEQUEL EST MIS EN AVANT, PAS LEQUEL EST AFFICHE
 *
 * Le heros pousse la demo, la section benefices pousse le contact commercial.
 * Les deux boutons restent les memes, seule leur hierarchie change — et
 * surtout, l'ancre reste attachee au LIBELLE, jamais a la position. Sans cette
 * distinction, inverser l'ordre des boutons enverrait « Parler a notre
 * equipe » sur l'ancre de la demo, et l'intention enregistree serait fausse.
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
