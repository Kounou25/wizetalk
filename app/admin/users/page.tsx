import { Users } from 'lucide-react';

import { requireAdmin } from '@/lib/admin/guard';
import { listUsers } from '@/lib/admin/queries';
import { EmptyState } from '@/components/dashboard/empty-state';
import { UserActions } from '@/components/admin/user-actions';

export default async function AdminUsersPage() {
  // requireAdmin() est ce qui rend le client privilegie : impossible de lire
  // ces donnees sans repasser le controle, meme si le layout a deja verifie.
  const { db, admin } = await requireAdmin();
  const users = await listUsers(db);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Comptes</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {users.length} compte{users.length > 1 ? 's' : ''} sur la plateforme.
        </p>
      </div>

      {users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun compte"
          description="Les inscriptions apparaîtront ici."
        />
      ) : (
        <div className="bg-background overflow-x-auto rounded-xl shadow-sm ring-1 ring-black/5 dark:ring-white/10">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground border-b text-left text-xs">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Adresse</th>
                <th scope="col" className="px-4 py-3 font-medium">Inscrit le</th>
                <th scope="col" className="px-4 py-3 font-medium">Dernière visite</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Assistants</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Messages</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Droits</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b last:border-0">
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
                  <td className="px-4 py-3 text-right tabular-nums">{user.botCount}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {user.messagesUsed.toLocaleString('fr-FR')}
                    <span className="text-muted-foreground">
                      {' / '}
                      {user.messagesQuota.toLocaleString('fr-FR')}
                    </span>
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
