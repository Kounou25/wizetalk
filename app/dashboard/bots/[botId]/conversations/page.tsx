import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MessageSquare } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { getDictionary } from '@/lib/i18n';
import { getRequestLocale } from '@/lib/i18n/server';
import { EmptyState } from '@/components/dashboard/empty-state';

interface MessageRow {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export default async function ConversationsPage({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = await params;
  const supabase = await createClient();
  const dict = getDictionary(await getRequestLocale());
  const t = dict.dashboard.conversations;

  const { data: bot } = await supabase
    .from('bots')
    .select('id, name')
    .eq('id', botId)
    .maybeSingle();

  if (!bot) notFound();

  // Le RLS remonte jusqu'au proprietaire du bot : inutile de refiltrer ici.
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, session_id, created_at, messages(id, role, content, created_at)')
    .eq('bot_id', botId)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href={`/dashboard/bots/${botId}`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
        >
          <ArrowLeft className="size-3.5" />
          {bot.name}
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t.lead}</p>
      </div>

      {!conversations || conversations.length === 0 ? (
        <EmptyState icon={MessageSquare} title={t.emptyTitle} description={t.emptyBody} />
      ) : (
        <div className="flex flex-col gap-4">
          {conversations.map((conversation) => {
            const messages = ((conversation.messages ?? []) as MessageRow[])
              .slice()
              .sort((a, b) => a.created_at.localeCompare(b.created_at));

            return (
              <article
                key={conversation.id}
                className="panel p-5"
              >
                <p className="text-muted-foreground text-xs">
                  {new Date(conversation.created_at).toLocaleString()} · {messages.length}{' '}
                  {messages.length > 1 ? t.messageMany : t.messageOne}
                </p>

                <div className="mt-4 flex flex-col gap-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={
                        message.role === 'user' ? 'flex justify-end' : 'flex justify-start'
                      }
                    >
                      <p
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                          message.role === 'user'
                            ? 'bg-brand text-brand-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {message.content}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
