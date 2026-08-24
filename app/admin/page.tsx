import Link from 'next/link';
import { ChevronRight, ShieldCheck } from 'lucide-react';

import { requireAdmin } from '@/lib/admin/guard';
import { getPlatformStats, listBots } from '@/lib/admin/queries';
import { StatCell, StatGroup } from '@/components/dashboard/stat-card';
import { BotStatusBadge } from '@/components/dashboard/bot-status';
import { PageHeader, panelLinkClass } from '@/components/dashboard/panel';
import { getDictionary } from '@/lib/i18n';

export default async function AdminOverviewPage() {
  // Le layout a deja verifie, mais requireAdmin() est ce qui rend le client
  // privilegie : impossible de lire ces donnees sans repasser le controle.
  const { db } = await requireAdmin();

  const [stats, bots] = await Promise.all([getPlatformStats(db), listBots(db, 8)]);
  const dict = getDictionary('fr');

  const refusalRate =
    stats.messages > 0 ? ((stats.unanswered / stats.messages) * 100).toFixed(1) : '0';

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Vue d'ensemble"
        description="L'état de la plateforme, tous comptes confondus."
      />

      <StatGroup columns={4}>
        <StatCell label="Comptes" value={stats.users} />
        <StatCell label="Assistants" value={stats.bots} hint={`${stats.activeBots} actifs`} />
        <StatCell label="Conversations" value={stats.conversations} />
        <StatCell label="Prospects" value={stats.leads} />
      </StatGroup>

      <StatGroup columns={4}>
        <StatCell label="Pages indexées" value={stats.pages} />
        <StatCell label="Sections" value={stats.chunks} />
        <StatCell label="Messages" value={stats.messages} />
        <StatCell
          label="Sans réponse"
          value={stats.unanswered}
          hint={`${refusalRate} % des messages`}
        />
      </StatGroup>

      {/*
        Le taux de refus est l'indicateur de sante du produit : s'il grimpe,
        soit le seuil de similarite est trop haut, soit les sites indexes sont
        trop pauvres. C'est le premier chiffre a surveiller.
      */}
      <section className="panel p-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-brand size-4" aria-hidden />
          <h2 className="text-sm font-semibold">Santé des réponses</h2>
        </div>
        <p className="text-muted-foreground mt-2 text-sm text-pretty">
          {stats.unanswered} message{stats.unanswered > 1 ? 's' : ''} sur {stats.messages}{' '}
          {stats.unanswered > 1 ? 'sont restés' : 'est resté'} sans réponse, soit{' '}
          <strong className="text-foreground">{refusalRate} %</strong>. Au-delà de 20 %,
          soupçonnez un seuil de similarité trop élevé ou des sites clients trop pauvres
          en contenu.
        </p>
      </section>

      <section className="panel flex flex-col">
        <div className="border-border flex items-center justify-between border-b px-4 py-3.5">
          <h2 className="text-sm font-semibold">Derniers assistants créés</h2>
          <Link href="/admin/bots" className={panelLinkClass}>
            Tout voir
            <ChevronRight className="size-3.5" aria-hidden />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground border-border border-b text-left text-xs">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Assistant</th>
                <th scope="col" className="px-4 py-3 font-medium">Compte</th>
                <th scope="col" className="px-4 py-3 font-medium">État</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Pages</th>
              </tr>
            </thead>
            <tbody>
              {bots.map((bot) => (
                <tr key={bot.id} className="border-border border-b last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{bot.name}</p>
                    <p className="text-muted-foreground text-xs">{bot.websiteUrl}</p>
                  </td>
                  <td className="text-muted-foreground px-4 py-3">{bot.ownerEmail}</td>
                  <td className="px-4 py-3">
                    <BotStatusBadge status={bot.status} dict={dict} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{bot.pages}</td>
                </tr>
              ))}
              {bots.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-muted-foreground px-4 py-8 text-center">
                    Aucun assistant sur la plateforme.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
