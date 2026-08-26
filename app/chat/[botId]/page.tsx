import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { WidgetChat } from './widget-chat';
import { getLimitsFor } from '@/lib/plans-db';
import { getPlan } from '@/lib/quotas';
import { PUBLIC_APP_URL } from '@/lib/public-url';

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

  const db = createAdminClient();

  const { data: bot } = await db
    .from('bots')
    .select('id, name, welcome_message, primary_color, is_active, hide_branding, user_id')
    .eq('id', botId)
    .maybeSingle();

  if (!bot || !bot.is_active) notFound();

  /*
   * La mention Deezy disparait quand DEUX conditions sont reunies : le palier
   * du proprietaire autorise le retrait, et il l'a demande sur cet assistant.
   *
   * Lu par le client privilegie : cette page est publique, le visiteur n'a
   * aucune session et ne doit surtout pas pouvoir influer sur ce reglage.
   */
  const plan = await getPlan(db, bot.user_id as string);
  const limits = await getLimitsFor(plan);

  return (
    <WidgetChat
      botId={bot.id}
      name={bot.name}
      welcomeMessage={bot.welcome_message}
      primaryColor={bot.primary_color}
      showBranding={!(limits.removeBranding && bot.hide_branding)}
      appUrl={PUBLIC_APP_URL}
    />
  );
}
