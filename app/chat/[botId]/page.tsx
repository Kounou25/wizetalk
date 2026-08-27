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

  const db = createAdminClient();

  const { data: bot } = await db
    .from('bots')
    .select('id, name, welcome_message, primary_color, is_active, hide_branding, widget_locale, user_id')
    .eq('id', botId)
    .maybeSingle();

  if (!bot || !bot.is_active) notFound();

  /*
   * Langue de la fenetre, par ordre de priorite :
   *
   *   1. le reglage de l'assistant, quand le proprietaire l'a fige
   *   2. `?lang=`, pose par widget.js d'apres la page puis le navigateur
   *   3. l'en-tete Accept-Language
   *
   * Le reglage est verifie ici et pas seulement dans widget.js : cette page
   * s'ouvre aussi par son adresse directe, et un `?lang=` fabrique ne doit pas
   * contourner le choix du proprietaire.
   *
   * L'etape 2 vient de widget.js plutot que d'une detection propre a cette
   * page : la bulle d'invitation, ecrite sur le site du client, et cette
   * fenetre doivent parler la meme langue. Deux detections independantes
   * finiraient par se contredire.
   */
  const { lang } = await searchParams;
  const forced = bot.widget_locale as string | null;

  const locale = isLocale(forced)
    ? forced
    : isLocale(lang)
      ? lang
      : negotiateLocale((await headers()).get('accept-language'));

  const dict = getDictionary(locale);

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
      // NULL = pas d'accueil choisi : on sert le notre, dans la langue
      // resolue plus haut.
      welcomeMessage={bot.welcome_message ?? dict.widget.welcomeDefault}
      primaryColor={bot.primary_color}
      showBranding={!(limits.removeBranding && bot.hide_branding)}
      appUrl={PUBLIC_APP_URL}
      t={dict.widget}
    />
  );
}
