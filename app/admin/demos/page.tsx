import { Building2 } from 'lucide-react';

import { requireAdmin } from '@/lib/admin/guard';
import { channelOf } from '@/lib/acquisition';
import { EmptyState } from '@/components/dashboard/empty-state';
import { PageHeader } from '@/components/dashboard/panel';
import { Badge, type BadgeVariant } from '@/components/ui/badge';
import { DemoStatusActions } from '@/components/admin/demo-actions';

/** Le back-office reste en francais : il ne s'adresse qu'a l'equipe. */
const INTENT_LABELS: Record<string, string> = {
  demo: 'Démo',
  contact: 'Contact',
};

const INDUSTRY_LABELS: Record<string, string> = {
  banking: 'Banque',
  insurance: 'Assurance',
  telecom: 'Télécoms',
  education: 'Éducation',
  healthcare: 'Santé',
  public: 'Secteur public',
  retail: 'Commerce',
  other: 'Autre',
};

export const STATUS_LABELS: Record<string, string> = {
  new: 'Nouvelle',
  contacted: 'Contactée',
  qualified: 'Qualifiée',
  closed: 'Close',
};

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  new: 'brand',
  contacted: 'warning',
  qualified: 'success',
  closed: 'neutral',
};

interface DemoRequestRow {
  id: string;
  intent: string;
  full_name: string;
  email: string;
  company: string;
  website: string | null;
  industry: string | null;
  message: string | null;
  locale: string;
  acq_referrer: string | null;
  acq_source: string | null;
  acq_medium: string | null;
  status: string;
  created_at: string;
}

/**
 * Demandes issues de la page Enterprise.
 *
 * LA LECTURE PASSE FORCEMENT PAR requireAdmin()
 *
 * `demo_requests` a le RLS active sans aucune politique : ni la cle anonyme ni
 * un compte connecte n'y voient quoi que ce soit. Seul le client service_role
 * rendu par requireAdmin() traverse. Une page qui utiliserait le client de
 * session recevrait une liste vide, sans la moindre erreur — d'ou ce rappel.
 *
 * La provenance est affichee parce qu'elle repond a la question qui decide du
 * budget d'acquisition : d'ou viennent les demandes qui aboutissent. Elle est
 * recalculee a la lecture par channelOf(), comme pour les comptes, pour qu'un
 * classement affine corrige tout l'historique d'un coup.
 */
export default async function AdminDemosPage() {
  const { db } = await requireAdmin();

  const { data } = await db
    .from('demo_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  const requests = (data ?? []) as unknown as DemoRequestRow[];
  const pending = requests.filter((row) => row.status === 'new').length;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Demandes Enterprise"
        description={
          requests.length === 0
            ? 'Les demandes de démo et de contact arriveront ici.'
            : `${requests.length} demande${requests.length > 1 ? 's' : ''}, dont ${pending} non traitée${pending > 1 ? 's' : ''}.`
        }
      />

      {requests.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Aucune demande"
          description="Les envois du formulaire de la page Enterprise apparaîtront ici."
        />
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground border-border border-b text-left text-xs">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Demandeur</th>
                <th scope="col" className="px-4 py-3 font-medium">Organisation</th>
                <th scope="col" className="px-4 py-3 font-medium">Type</th>
                <th scope="col" className="px-4 py-3 font-medium">Provenance</th>
                <th scope="col" className="px-4 py-3 font-medium">Reçue le</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Suivi</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((row) => (
                <tr key={row.id} className="border-border border-b align-top last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">{row.full_name}</div>
                    {/* Cliquable : repondre est le geste attendu, et il part
                        d'ici plus vite que depuis une boite ouverte a cote. */}
                    <a
                      href={`mailto:${row.email}`}
                      className="text-muted-foreground hover:text-foreground text-xs break-all"
                    >
                      {row.email}
                    </a>
                    {row.message && (
                      <p className="text-muted-foreground mt-1.5 max-w-sm text-xs leading-relaxed whitespace-pre-wrap">
                        {row.message}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-medium">{row.company}</div>
                    <div className="text-muted-foreground text-xs">
                      {row.industry
                        ? (INDUSTRY_LABELS[row.industry] ?? row.industry)
                        : '—'}
                    </div>
                    {row.website && (
                      <div className="text-muted-foreground text-xs break-all">
                        {row.website}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <Badge variant={row.intent === 'demo' ? 'brand' : 'neutral'}>
                      {INTENT_LABELS[row.intent] ?? row.intent}
                    </Badge>
                    <div className="text-muted-foreground mt-1 text-xs uppercase">
                      {row.locale}
                    </div>
                  </td>

                  <td className="text-muted-foreground px-4 py-3 text-xs">
                    {channelOf({
                      referrer: row.acq_referrer,
                      source: row.acq_source,
                      medium: row.acq_medium,
                    })}
                  </td>

                  <td className="text-muted-foreground px-4 py-3 text-xs">
                    {new Date(row.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-col items-end gap-1.5">
                      <Badge variant={STATUS_VARIANTS[row.status] ?? 'neutral'} dot>
                        {STATUS_LABELS[row.status] ?? row.status}
                      </Badge>
                      <DemoStatusActions id={row.id} status={row.status} />
                    </div>
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
