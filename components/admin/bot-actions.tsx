'use client';

import { useTransition } from 'react';
import { Power, PowerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { setBotActive } from '@/app/admin/actions';

/**
 * Actions d'administration sur un assistant appartenant a un autre compte.
 *
 * Les commandes de quota ont demenage vers la fiche du compte : depuis
 * 0007_credits, le portefeuille est unique et porte par le compte, pas par
 * l'assistant. Il ne reste ici que ce qui concerne reellement l'assistant.
 *
 * L'action passe par une Server Action qui revalide le droit d'acces et
 * inscrit son effet au journal : ce bouton agit sur les donnees d'un client.
 */
export function BotActions({
  botId,
  name,
  isActive,
}: {
  botId: string;
  name: string;
  isActive: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button
        size="icon"
        variant="ghost"
        className={`size-8 ${isActive ? 'text-muted-foreground' : 'text-emerald-600'}`}
        disabled={pending}
        onClick={() => startTransition(() => setBotActive(botId, name, !isActive))}
        aria-label={isActive ? `Désactiver ${name}` : `Activer ${name}`}
        title={isActive ? 'Désactiver' : 'Activer'}
      >
        {isActive ? <PowerOff /> : <Power />}
      </Button>
    </div>
  );
}
