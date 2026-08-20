'use client';

import { useState, useTransition } from 'react';
import { ShieldCheck, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { setUserAdmin } from '@/app/admin/actions';

/**
 * Accorde ou retire le droit d'administration.
 *
 * Confirmation en deux temps : accorder ce droit ouvre la totalite des donnees
 * de tous les comptes, ce n'est pas une case a cocher anodine.
 */
export function UserActions({
  userId,
  email,
  isAdmin,
  isSelf,
}: {
  userId: string;
  email: string;
  isAdmin: boolean;
  isSelf: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apply = () => {
    setError(null);
    startTransition(async () => {
      try {
        await setUserAdmin(userId, email, !isAdmin);
        setConfirming(false);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Action impossible.');
      }
    });
  };

  if (confirming) {
    return (
      <div className="flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="destructive" onClick={apply} disabled={pending}>
            {pending ? '…' : isAdmin ? 'Retirer' : 'Confirmer'}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
            Annuler
          </Button>
        </div>
        {error && <p className="max-w-64 text-right text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => setConfirming(true)}
      disabled={pending}
      title={
        isSelf && isAdmin
          ? 'Vous pouvez vous retirer le droit, sauf si vous êtes le dernier administrateur.'
          : undefined
      }
    >
      {isAdmin ? <ShieldOff /> : <ShieldCheck />}
      {isAdmin ? 'Retirer admin' : 'Nommer admin'}
    </Button>
  );
}
