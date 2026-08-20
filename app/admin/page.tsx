import Link from 'next/link';
import {
  Bot,
  FileText,
  Layers,
  Mail,
  MessageSquare,
  ShieldCheck,
  TriangleAlert,
  Users,
} from 'lucide-react';

import { requireAdmin } from '@/lib/admin/guard';
import { getPlatformStats, listBots } from '@/lib/admin/queries';
import { StatCard } from '@/components/dashboard/stat-card';
import { BotStatusBadge } from '@/components/dashboard/bot-status';
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
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vue d&apos;ensemble</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          L&apos;état de la plateforme, tous comptes confondus.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Comptes" value={stats.users} icon={Users} />
        <StatCard
          label="Assistants"
          value={stats.bots}
          hint={`${stats.activeBots} actifs`}
          icon={Bot}
        />
        <StatCard label="Conversations" value={stats.conversations} icon={MessageSquare} />
        <StatCard label="Prospects" value={stats.leads} icon={Mail} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pages indexées" value={stats.pages} icon={FileText} />
        <StatCard label="Sections" value={stats.chunks} icon={Layers} />
        <StatCard label="Messages" value={stats.messages} icon={MessageSquare} />
        <StatCard
          label="Sans réponse"
          value={stats.unanswered}
          hint={`${refusalRate} % des messages`}
          icon={TriangleAlert}
        />
      </div>

      {/*
        Le taux de refus est l'indicateur de sante du produit : s'il grimpe,
        soit le seuil de similarite est trop haut, soit les sites indexes sont
        trop pauvres. C'est le premier chiffre a surveiller.
      */}
      <section className="bg-background rounded-xl p-6 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-brand size-4" aria-hidden />
          <h2 className="font-semibold">Santé des réponses</h2>
        </div>
        <p className="text-muted-foreground mt-2 text-sm text-pretty">
          {stats.unanswered} message{stats.unanswered > 1 ? 's' : ''} sur {stats.messages}{' '}
          {stats.unanswered > 1 ? 'sont restés' : 'est resté'} sans réponse, soit{' '}
          <strong className="text-foreground">{refusalRate} %</strong>. Au-delà de 20 %,
          soupçonnez un seuil de similarité trop élevé ou des sites clients trop pauvres
          en contenu.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Derniers assistants créés</h2>
          <Link
            href="/admin/bots"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            Tout voir →
          </Link>
        </div>

        <div className="bg-background overflow-x-auto rounded-xl shadow-sm ring-1 ring-black/5 dark:ring-white/10">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground border-b text-left text-xs">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Assistant</th>
                <th scope="col" className="px-4 py-3 font-medium">Compte</th>
                <th scope="col" className="px-4 py-3 font-medium">État</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Pages</th>
              </tr>
            </thead>
            <tbody>
              {bots.map((bot) => (
                <tr key={bot.id} className="border-b last:border-0">
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
