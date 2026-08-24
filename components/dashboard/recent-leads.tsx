import Link from 'next/link';
import { ChevronRight, Mail } from 'lucide-react';

import type { Dictionary, Locale } from '@/lib/i18n';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Panel, PanelHeader, panelLinkClass } from './panel';

export interface RecentLead {
  id: string;
  email: string;
  question: string;
  status: 'new' | 'handled';
  createdAt: string;
  botId: string;
  botName: string;
}

/**
 * Colonne laterale de la vue d'ensemble : les derniers visiteurs qui ont
 * laisse leur adresse faute de reponse.
 *
 * C'est le seul bloc du tableau de bord qui demande une action immediate ; il
 * est place a cote du graphique plutot qu'en bas de page pour cette raison.
 */
export function RecentLeads({
  leads,
  locale,
  dict,
}: {
  leads: RecentLead[];
  locale: Locale;
  dict: Dictionary;
}) {
  const t = dict.dashboard.overview;
  const tag = locale === 'fr' ? 'fr-FR' : 'en-US';

  /* Les prospects se consultent par assistant : « tout voir » n'a de sens que
     si la liste n'en concerne qu'un seul. Sinon chaque ligne mene au sien. */
  const first = leads[0];
  const sharedBotId =
    first && leads.every((lead) => lead.botId === first.botId) ? first.botId : null;

  return (
    <Panel className="flex flex-col">
      <PanelHeader
        title={t.recentLeadsTitle}
        description={t.recentLeadsLead}
        action={
          sharedBotId ? (
            <Link href={`/dashboard/bots/${sharedBotId}/leads`} className={panelLinkClass}>
              {t.seeAll}
              <ChevronRight className="size-3.5" aria-hidden />
            </Link>
          ) : undefined
        }
      />

      {leads.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-12 text-center">
          <span className="bg-surface-subtle text-muted-foreground border-border flex size-9 items-center justify-center rounded-full border">
            <Mail className="size-4" aria-hidden />
          </span>
          <p className="text-muted-foreground text-sm text-pretty">{t.recentLeadsEmpty}</p>
        </div>
      ) : (
        <ul className="divide-border flex-1 divide-y">
          {leads.map((lead) => (
            <li key={lead.id}>
              <Link
                href={`/dashboard/bots/${lead.botId}/leads`}
                className="focus-ring hover:bg-surface-subtle group flex gap-3 px-4 py-3 transition-colors"
              >
                <Avatar
                  initials={(lead.email[0] ?? '?').toUpperCase()}
                  size="sm"
                  tone="neutral"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{lead.email}</span>
                    <span className="text-muted-foreground shrink-0 text-[11px] tabular-nums">
                      {new Date(lead.createdAt).toLocaleDateString(tag, {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>

                  <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs text-pretty">
                    {lead.question}
                  </p>

                  <div className="mt-1.5 flex items-center gap-2">
                    {/* L'etat est ecrit, pas seulement colore. */}
                    {lead.status === 'new' && (
                      <Badge variant="brand">{t.recentLeadsNew}</Badge>
                    )}
                    <span className="text-muted-foreground truncate text-[11px]">
                      {lead.botName}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
