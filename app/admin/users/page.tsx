import { Users } from 'lucide-react';

import { requireAdmin } from '@/lib/admin/guard';
import { listUsers } from '@/lib/admin/queries';
import { EmptyState } from '@/components/dashboard/empty-state';
import { CreditActions, UserActions } from '@/components/admin/user-actions';
import { Badge } from '@/components/ui/badge';
import type { PlanId } from '@/lib/credits';

/** Le back-office reste en francais : il ne s'adresse qu'a l'equipe. */
const PLAN_LABELS: Record<PlanId, string> = {
  trial: 'Essai',
  essential: 'Essentiel',
  growth: 'Croissance',
  business: 'Entreprise',
};
import { PageHeader } from '@/components/dashboard/panel';

export default async function AdminUsersPage() {
  // requireAdmin() est ce qui rend le client privilegie : impossible de lire
  // ces donnees sans repasser le controle, meme si le layout a deja verifie.
  const { db, admin } = await requireAdmin();
  const users = await listUsers(db);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Comptes"
        description={`${users.length} compte${users.length > 1 ? 's' : ''} sur la plateforme.`}
      />

      {users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun compte"
          description="Les inscriptions apparaîtront ici."
        />
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground border-border border-b text-left text-xs">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Adresse</th>
                <th scope="col" className="px-4 py-3 font-medium">Inscrit le</th>
                <th scope="col" className="px-4 py-3 font-medium">Dernière visite</th>
                <th scope="col" className="px-4 py-3 font-medium">Plan</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Assistants</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Crédits</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Portefeuille</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Droits</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-border border-b last:border-0">
                  <td className="px-4 py-3">
                    <span className="font-medium">{user.email}</span>
                    {user.isAdmin && (
                      <span className="ml-2 rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                        admin
                      </span>
                    )}
                    {user.id === admin.id && (
                      <span className="text-muted-foreground ml-2 text-[11px]">(vous)</span>
                    )}
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {user.lastSignInAt
                      ? new Date(user.lastSignInAt).toLocaleDateString('fr-FR')
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.plan === 'trial' ? 'neutral' : 'brand'}>
                      {PLAN_LABELS[user.plan]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{user.botCount}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {user.creditsUsed.toLocaleString('fr-FR')}
                    <span className="text-muted-foreground">
                      {' / '}
                      {user.creditsIncluded.toLocaleString('fr-FR')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <CreditActions
                      userId={user.id}
                      email={user.email}
                      credits={user.creditsIncluded}
                      used={user.creditsUsed}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <UserActions
                      userId={user.id}
                      email={user.email}
                      isAdmin={user.isAdmin}
                      isSelf={user.id === admin.id}
                    />
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
