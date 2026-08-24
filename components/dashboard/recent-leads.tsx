import Link from 'next/link';
import { Mail } from 'lucide-react';

import type { Dictionary, Locale } from '@/lib/i18n';
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
 * C'est le seul bloc du tableau de bord qui demande une action immediate ;
 * il est place a cote du graphique plutot qu'en bas de page pour cette raison.
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
    <Panel className="flex flex-col p-5">
      <PanelHeader
        title={t.recentLeadsTitle}
        description={t.recentLeadsLead}
        action={
          sharedBotId ? (
            <Link href={`/dashboard/bots/${sharedBotId}/leads`} className={panelLinkClass}>
              {t.seeAll} →
            </Link>
          ) : undefined
        }
      />

      {leads.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
          <span className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-full">
            <Mail className="size-4" aria-hidden />
          </span>
          <p className="text-muted-foreground text-sm text-pretty">{t.recentLeadsEmpty}</p>
        </div>
      ) : (
        <ul className="divide-border mt-4 divide-y">
          {leads.map((lead) => (
            <li key={lead.id}>
              <Link
                href={`/dashboard/bots/${lead.botId}/leads`}
                className="hover:bg-accent -mx-2 flex flex-col gap-1 rounded-lg px-2 py-3 transition-colors"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-medium">{lead.email}</span>
                  <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                    {new Date(lead.createdAt).toLocaleDateString(tag, {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>

                <p className="text-muted-foreground line-clamp-2 text-xs text-pretty">
                  {lead.question}
                </p>

                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-muted-foreground truncate text-[11px]">
                    {lead.botName}
                  </span>
                  {/* Le point d'etat est double par un libelle : la couleur
                      seule ne dit pas qu'il reste a traiter. */}
                  {lead.status === 'new' && (
                    <span className="bg-brand-soft text-brand shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                      {t.recentLeadsNew}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
