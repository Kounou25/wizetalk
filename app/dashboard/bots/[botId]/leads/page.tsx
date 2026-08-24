import { notFound } from 'next/navigation';
import { Check, Mail, RotateCcw, Trash2 } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { getDictionary } from '@/lib/i18n';
import { getRequestLocale } from '@/lib/i18n/server';
import { SubmitButton } from '@/components/ui/submit-button';
import { EmptyState } from '@/components/dashboard/empty-state';
import { deleteLead, setLeadStatus } from '@/app/dashboard/actions';
import { Badge } from '@/components/ui/badge';
import { PageHeader, BackLink } from '@/components/dashboard/panel';

interface LeadRow {
  id: string;
  email: string;
  question: string;
  status: 'new' | 'handled';
  created_at: string;
}

export default async function LeadsPage({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = await params;
  const supabase = await createClient();
  const dict = getDictionary(await getRequestLocale());
  const t = dict.dashboard.leads;

  const { data: bot } = await supabase
    .from('bots')
    .select('id, name, lead_capture')
    .eq('id', botId)
    .maybeSingle();

  if (!bot) notFound();

  const { data } = await supabase
    .from('leads')
    .select('id, email, question, status, created_at')
    .eq('bot_id', botId)
    .order('created_at', { ascending: false })
    .limit(200);

  const leads = (data ?? []) as LeadRow[];
  const pending = leads.filter((lead) => lead.status === 'new');

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <BackLink href={`/dashboard/bots/${botId}`}>{bot.name}</BackLink>
        <PageHeader
          title={t.title}
          description={t.lead}
          meta={
            pending.length > 0 ? (
              <Badge variant="brand">
                {pending.length} {t.pending}
              </Badge>
            ) : undefined
          }
        />
      </div>

      {!bot.lead_capture && (
        <p className="rounded-lg bg-amber-500/10 px-4 py-3 text-sm text-amber-700">
          {t.disabled}
        </p>
      )}

      {leads.length === 0 ? (
        <EmptyState icon={Mail} title={t.emptyTitle} description={t.emptyBody} />
      ) : (
        <div className="flex flex-col gap-3">
          {leads.map((lead) => (
            <article
              key={lead.id}
              className={`panel p-5 transition-opacity ${
                lead.status === 'handled' ? 'opacity-60' : ''
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <a
                    href={`mailto:${lead.email}?subject=${encodeURIComponent(
                      t.mailSubject,
                    )}&body=${encodeURIComponent(
                      `${t.mailGreeting}\n\n${t.mailIntro} « ${lead.question} »\n\n`,
                    )}`}
                    className="font-semibold hover:underline"
                  >
                    {lead.email}
                  </a>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {new Date(lead.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {lead.status === 'new' ? (
                    <form action={setLeadStatus.bind(null, botId, lead.id, 'handled')}>
                      <SubmitButton variant="outline" size="sm" icon={<Check />}>
                        {t.handled}
                      </SubmitButton>
                    </form>
                  ) : (
                    <form action={setLeadStatus.bind(null, botId, lead.id, 'new')}>
                      <SubmitButton variant="ghost" size="sm" icon={<RotateCcw />}>
                        {t.reopen}
                      </SubmitButton>
                    </form>
                  )}

                  <form action={deleteLead.bind(null, botId, lead.id)}>
                    <SubmitButton
                      variant="ghost"
                      size="icon"
                      aria-label={t.remove}
                      className="text-muted-foreground hover:text-red-600"
                      icon={<Trash2 />}
                    />
                  </form>
                </div>
              </div>

              <p className="bg-muted/60 mt-4 rounded-lg px-3.5 py-2.5 text-sm">
                « {lead.question} »
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
