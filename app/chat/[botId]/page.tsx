import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { WidgetChat } from './widget-chat';

/**
 * Interieur de l'iframe du widget.
 *
 * Page publique : aucune session, le bot_id suffit. Elle est servie sur notre
 * domaine, donc totalement isolee du CSS du site client.
 */
export default async function ChatPage({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = await params;

  const { data: bot } = await createAdminClient()
    .from('bots')
    .select('id, name, welcome_message, primary_color, is_active')
    .eq('id', botId)
    .maybeSingle();

  if (!bot || !bot.is_active) notFound();

  return (
    <WidgetChat
      botId={bot.id}
      name={bot.name}
      welcomeMessage={bot.welcome_message}
      primaryColor={bot.primary_color}
    />
  );
}
