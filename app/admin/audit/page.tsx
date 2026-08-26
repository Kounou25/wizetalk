import { ScrollText } from 'lucide-react';

import { requireAdmin } from '@/lib/admin/guard';
import { listAudit } from '@/lib/admin/queries';
import { EmptyState } from '@/components/dashboard/empty-state';
import { PageHeader } from '@/components/dashboard/panel';

/** Libelles lisibles : le code brut ne se lit pas dans un tableau. */
const ACTION_LABELS: Record<string, string> = {
  'admin.grant': 'a nommé administrateur',
  'admin.revoke': 'a retiré le droit d’administration à',
  'bot.enable': 'a activé',
  'bot.disable': 'a désactivé',
  'plan.update': 'a modifié le palier',
  'account.messages': 'a modifié le quota de messages de',
  'account.reset_messages': 'a remis à zéro les messages consommés de',
};

function describeTarget(detail: Record<string, unknown>, targetId: string | null): string {
  const name = detail.name ?? detail.email;
  if (typeof name === 'string' && name) return name;
  return targetId ? `${targetId.slice(0, 8)}…` : '—';
}

export default async function AdminAuditPage() {
  const { db } = await requireAdmin();
  const entries = await listAudit(db);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Journal"
        description="Toute action d'administration porte sur les données d'un client. Ce journal est ce qui les rend imputables — il ne peut être ni modifié ni effacé depuis l'interface."
      />

      {entries.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="Aucune action enregistrée"
          description="Les interventions sur les comptes et les assistants apparaîtront ici."
        />
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground border-border border-b text-left text-xs">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Quand</th>
                <th scope="col" className="px-4 py-3 font-medium">Qui</th>
                <th scope="col" className="px-4 py-3 font-medium">Quoi</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-border border-b last:border-0">
                  <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                    {new Date(entry.createdAt).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">{entry.actorEmail}</td>
                  <td className="px-4 py-3">
                    <span className="text-muted-foreground">
                      {ACTION_LABELS[entry.action] ?? entry.action}
                    </span>{' '}
                    <span className="font-medium">
                      {describeTarget(entry.detail, entry.targetId)}
                    </span>
                    {typeof entry.detail.quota === 'number' && (
                      <span className="text-muted-foreground">
                        {' → '}
                        {entry.detail.quota.toLocaleString('fr-FR')} messages
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
