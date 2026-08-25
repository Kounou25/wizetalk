import { Bot, ExternalLink } from 'lucide-react';

import { requireAdmin } from '@/lib/admin/guard';
import { listBots } from '@/lib/admin/queries';
import { getDictionary } from '@/lib/i18n';
import { BotStatusBadge } from '@/components/dashboard/bot-status';
import { EmptyState } from '@/components/dashboard/empty-state';
import { BotActions } from '@/components/admin/bot-actions';
import { PageHeader } from '@/components/dashboard/panel';

export default async function AdminBotsPage() {
  const { db } = await requireAdmin();
  const bots = await listBots(db);
  const dict = getDictionary('fr');

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Assistants"
        description={`${bots.length} assistant${bots.length > 1 ? 's' : ''}, tous comptes confondus.`}
      />

      {bots.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="Aucun assistant"
          description="Les assistants créés par vos utilisateurs apparaîtront ici."
        />
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground border-border border-b text-left text-xs">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Assistant</th>
                <th scope="col" className="px-4 py-3 font-medium">Compte</th>
                <th scope="col" className="px-4 py-3 font-medium">État</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Pages</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Échanges</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bots.map((bot) => (
                <tr
                  key={bot.id}
                  className={`border-b last:border-0 ${bot.isActive ? '' : 'opacity-60'}`}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{bot.name}</p>
                    <a
                      href={bot.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
                    >
                      {bot.websiteUrl}
                      <ExternalLink className="size-3" aria-hidden />
                    </a>
                  </td>
                  <td className="text-muted-foreground px-4 py-3">{bot.ownerEmail}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <BotStatusBadge status={bot.status} dict={dict} />
                      {!bot.isActive && (
                        <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[11px] font-medium">
                          désactivé
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{bot.pages}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{bot.conversations}</td>
                  <td className="px-4 py-3 text-right">
                    <BotActions botId={bot.id} name={bot.name} isActive={bot.isActive} />
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
