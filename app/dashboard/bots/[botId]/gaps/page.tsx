import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Lock, RefreshCw, Sparkles } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { getDictionary } from '@/lib/i18n';
import { getRequestLocale } from '@/lib/i18n/server';
import { EmptyState } from '@/components/dashboard/empty-state';
import { PageHeader, BackLink } from '@/components/dashboard/panel';
import { getLimitsFor } from '@/lib/plans-db';
import { getPlan } from '@/lib/quotas';
import { UpgradeButton } from '@/components/dashboard/upgrade-button';
import { buildUpgradeOffer } from '@/lib/upgrade';

interface MessageRow {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  refused: boolean;
  created_at: string;
}

interface Gap {
  question: string;
  count: number;
  lastAsked: string;
}

const COMBINING_MARKS = new RegExp('[\\u0300-\\u036f]', 'g');

/** Regroupe « Vous livrez en Belgique ? » et « vous livrez en belgique ». */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(/[^\p{L}\p{N} ]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export default async function GapsPage({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = await params;
  const supabase = await createClient();
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const t = dict.dashboard.gaps;
  // Les libelles du verrouillage vivent avec les autres textes de la fiche.
  const tb = dict.dashboard.botPage;

  const { data: bot } = await supabase
    .from('bots')
    .select('id, name, user_id')
    .eq('id', botId)
    .maybeSingle();

  if (!bot) notFound();

  // Le palier decide si ce rapport est accessible. Lu avant les donnees : sur
  // un plan qui ne l'inclut pas, on ne lit meme pas les conversations.
  const plan = await getPlan(supabase, bot.user_id as string);
  const limits = await getLimitsFor(plan);

  // Calculee seulement quand l'ecran verrouille va s'afficher.
  const offer = limits.gapsReport ? null : await buildUpgradeOffer(plan, 'gapsReport');

  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, messages(id, role, content, refused, created_at)')
    .eq('bot_id', botId)
    .order('created_at', { ascending: false })
    .limit(200);

  /*
   * Un refus est porte par la reponse de l'assistant, mais l'information utile
   * est la question qui l'a precede. On reconstitue donc la paire en parcourant
   * chaque conversation dans l'ordre.
   */
  const grouped = new Map<string, Gap>();

  for (const conversation of conversations ?? []) {
    const messages = ((conversation.messages ?? []) as MessageRow[])
      .slice()
      .sort((a, b) => a.created_at.localeCompare(b.created_at));

    messages.forEach((message, index) => {
      if (message.role !== 'assistant' || !message.refused) return;

      const question = messages[index - 1];
      if (!question || question.role !== 'user') return;

      const key = normalize(question.content);
      if (!key) return;

      const existing = grouped.get(key);
      if (existing) {
        existing.count += 1;
        if (message.created_at > existing.lastAsked) existing.lastAsked = message.created_at;
      } else {
        grouped.set(key, {
          question: question.content,
          count: 1,
          lastAsked: message.created_at,
        });
      }
    });
  }

  const gaps = [...grouped.values()].sort(
    (a, b) => b.count - a.count || b.lastAsked.localeCompare(a.lastAsked),
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <BackLink href={`/dashboard/bots/${botId}`}>{bot.name}</BackLink>
        <PageHeader title={t.title} description={t.lead} />
      </div>

      {/*
        Le rapport est reserve aux paliers qui l'incluent.
        
        Le controle est ici, cote serveur, et pas seulement sur le lien qui y
        mene : une URL se tape a la main. On decrit ce que le rapport apporte
        plutot que d'afficher un refus sec — le lecteur doit comprendre ce
        qu'il gagne a monter en gamme, pas juste qu'on lui ferme la porte.
      */}
      {!limits.gapsReport ? (
        <div className="panel flex flex-col items-center gap-3 p-8 text-center">
          <span className="bg-brand-soft text-brand flex size-11 items-center justify-center rounded-xl">
            <Lock className="size-5" aria-hidden />
          </span>
          <h2 className="text-lg font-semibold">{tb.gapsLockedTitle}</h2>
          <p className="text-muted-foreground max-w-md text-sm text-pretty">
            {tb.gapsLockedBody}
          </p>
          {offer && (
            <UpgradeButton
              offer={offer}
              label={tb.gapsLockedCta}
              locale={locale}
              dict={dict}
              className="bg-brand hover:bg-brand/90 text-brand-foreground mt-2"
            />
          )}
        </div>
      ) : gaps.length === 0 ? (
        <EmptyState icon={Sparkles} title={t.emptyTitle} description={t.emptyBody} />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {gaps.map((gap) => (
              <article
                key={gap.question}
                className="panel flex items-start justify-between gap-4 p-5"
              >
                <div className="min-w-0">
                  <p className="font-medium text-pretty">« {gap.question} »</p>
                  <p className="text-muted-foreground mt-1.5 text-xs">
                    {t.lastTime} {new Date(gap.lastAsked).toLocaleDateString()}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${
                    gap.count > 1
                      ? 'bg-amber-500/15 text-amber-700'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {gap.count}×
                </span>
              </article>
            ))}
          </div>

          <div className="bg-brand-soft flex flex-wrap items-center justify-between gap-4 rounded-xl p-5">
            <p className="text-sm text-pretty">{t.cta}</p>
            <Link
              href={`/dashboard/bots/${botId}`}
              className="text-brand inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold hover:underline"
            >
              <RefreshCw className="size-3.5" />
              {t.ctaAction}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
