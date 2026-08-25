'use client';

import { useState, useTransition } from 'react';
import { Check, RotateCcw, ShieldCheck, ShieldOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  resetAccountUsage,
  setAccountCredits,
  setUserAdmin,
} from '@/app/admin/actions';

/**
 * Reglage du portefeuille de credits d'un compte.
 *
 * Separe du droit d'administration : ce sont deux gestes de nature differente
 * — l'un commercial, l'autre securitaire — et les melanger dans un meme groupe
 * de boutons invite a la fausse manoeuvre.
 */
export function CreditActions({
  userId,
  email,
  credits,
  used,
}: {
  userId: string;
  email: string;
  credits: number;
  used: number;
}) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(credits));

  if (editing) {
    return (
      <div className="flex items-center justify-end gap-1.5">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          inputMode="numeric"
          className="h-8 w-24"
          aria-label={`Crédits alloués à ${email}`}
        />
        <Button
          size="icon"
          className="size-8"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await setAccountCredits(userId, email, Number(draft) || 0);
              setEditing(false);
            })
          }
          aria-label="Enregistrer l’allocation"
        >
          <Check />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="size-8"
          onClick={() => {
            setDraft(String(credits));
            setEditing(false);
          }}
          aria-label="Annuler"
        >
          <X />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() => setEditing(true)}
        title="Modifier l’allocation de crédits"
      >
        Crédits
      </Button>

      {used > 0 && (
        <Button
          size="icon"
          variant="ghost"
          className="size-8"
          disabled={pending}
          onClick={() => startTransition(() => resetAccountUsage(userId, email))}
          aria-label="Remettre les crédits consommés à zéro"
          title="Remettre le compteur à zéro"
        >
          <RotateCcw />
        </Button>
      )}
    </div>
  );
}

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
