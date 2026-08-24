import { notFound } from 'next/navigation';
import { getAdminUser } from '@/lib/admin/guard';
import { AdminSidebar } from '@/components/admin/sidebar';

/**
 * Le back-office.
 *
 * Ce layout est la premiere barriere : sans droit d'administration, la section
 * entiere renvoie un 404 — et non une page « acces refuse », qui confirmerait
 * l'existence de l'interface a qui la cherche.
 *
 * Il ne remplace pas les verifications individuelles : chaque page et chaque
 * action appelle requireAdmin(). Un layout ne protege pas les Server Actions,
 * qui sont des points d'entree a part entiere.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();
  if (!admin) notFound();

  return (
    <div className="bg-surface-page min-h-screen lg:flex">
      <AdminSidebar email={admin.email} />

      {/* min-w-0 : sans lui, un tableau large pousse la colonne et fait
          defiler la page entiere horizontalement. */}
      <main className="min-w-0 flex-1 lg:h-screen lg:overflow-y-auto">
        <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">{children}</div>
      </main>
    </div>
  );
}
