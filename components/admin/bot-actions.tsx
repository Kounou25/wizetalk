'use client';

import { useState, useTransition } from 'react';
import { Check, Power, PowerOff, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resetBotUsage, setBotActive, setBotQuota } from '@/app/admin/actions';

/**
 * Actions d'administration sur un assistant appartenant a un autre compte.
 *
 * Chacune passe par une Server Action qui revalide le droit d'acces et inscrit
 * son effet au journal : ces boutons agissent sur les donnees d'un client.
 */
export function BotActions({
  botId,
  name,
  isActive,
  quota,
  used,
}: {
  botId: string;
  name: string;
  isActive: boolean;
  quota: number;
  used: number;
}) {
  const [pending, startTransition] = useTransition();
  const [editingQuota, setEditingQuota] = useState(false);
  const [draftQuota, setDraftQuota] = useState(String(quota));

  const run = (task: () => Promise<void>) => {
    startTransition(async () => {
      await task();
      setEditingQuota(false);
    });
  };

  if (editingQuota) {
    return (
      <div className="flex items-center justify-end gap-1.5">
        <Input
          value={draftQuota}
          onChange={(event) => setDraftQuota(event.target.value)}
          inputMode="numeric"
          className="h-8 w-24"
          aria-label={`Quota mensuel de ${name}`}
        />
        <Button
          size="icon"
          className="size-8"
          disabled={pending}
          onClick={() => run(() => setBotQuota(botId, name, Number(draftQuota) || 0))}
          aria-label="Enregistrer le quota"
        >
          <Check />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="size-8"
          onClick={() => {
            setDraftQuota(String(quota));
            setEditingQuota(false);
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
        onClick={() => setEditingQuota(true)}
        title="Modifier le quota mensuel"
      >
        Quota
      </Button>

      {used > 0 && (
        <Button
          size="icon"
          variant="ghost"
          className="size-8"
          disabled={pending}
          onClick={() => run(() => resetBotUsage(botId, name))}
          aria-label="Remettre le compteur de messages à zéro"
          title="Remettre le compteur à zéro"
        >
          <RotateCcw />
        </Button>
      )}

      <Button
        size="icon"
        variant="ghost"
        className={`size-8 ${isActive ? 'text-muted-foreground' : 'text-emerald-600'}`}
        disabled={pending}
        onClick={() => run(() => setBotActive(botId, name, !isActive))}
        aria-label={isActive ? `Désactiver ${name}` : `Activer ${name}`}
        title={isActive ? 'Désactiver' : 'Activer'}
      >
        {isActive ? <PowerOff /> : <Power />}
      </Button>
    </div>
  );
}
