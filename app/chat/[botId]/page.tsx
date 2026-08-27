import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

import { getDictionary, isLocale, negotiateLocale } from '@/lib/i18n';
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
  searchParams,
}: {
  params: Promise<{ botId: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { botId } = await params;

  /*
   * Langue du VISITEUR, pas celle du proprietaire.
   *
   * `?lang=` est pose par widget.js, qui lit la langue du navigateur sur le
   * site du client. On le prefere a l'en-tete parce qu'il garantit que la
   * bulle d'invitation, ecrite sur la page du client, et cette fenetre parlent
   * la meme langue — deux sources independantes finiraient par se contredire.
   *
   * L'en-tete prend le relais quand le parametre manque : quelqu'un qui ouvre
   * /chat/<id> directement doit tomber sur une langue sensee.
   */
  const { lang } = await searchParams;
  const locale = isLocale(lang) ? lang : negotiateLocale((await headers()).get('accept-language'));
  const dict = getDictionary(locale);

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
      t={dict.widget}
    />
  );
}
