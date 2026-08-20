'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

/**
 * Bouton d'envoi qui montre son propre etat.
 *
 * useFormStatus ne fonctionne que DANS le <form> qu'il observe : ce composant
 * doit donc rester un enfant du formulaire, jamais son parent. C'est ce qui
 * evite de remonter un etat de chargement jusqu'a la page.
 */
export function SubmitButton({
  children,
  icon,
  pendingLabel,
  ...props
}: React.ComponentProps<typeof Button> & {
  icon?: React.ReactNode;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending || props.disabled} {...props}>
      {pending ? <Spinner /> : icon}
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}
