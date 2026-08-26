import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import { PUBLIC_APP_URL } from '@/lib/public-url';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/i18n/config';
import { buildLeadAlertEmail } from './lead-alert';
import { getTransport, readSmtpConfig } from './smtp';
import { FROM } from './welcome';

/**
 * Previent le proprietaire qu'un prospect vient d'etre capture.
 *
 * NE LEVE JAMAIS.
 *
 * Contrairement a la facture, ou l'echec doit remonter pour que le prestataire
 * rejoue, il n'y a ici personne pour rejouer : le visiteur a deja recu sa
 * confirmation et ne repassera pas. Une panne de messagerie ne doit surtout pas
 * faire echouer la capture elle-meme — le prospect est enregistre, c'est
 * l'essentiel. L'alerte est un confort, la donnee est le produit.
 *
 * A appeler depuis `after()` : l'envoi part une fois la reponse rendue, donc le
 * visiteur n'attend pas le serveur de messagerie.
 */
export async function sendLeadAlert(botId: string, email: string, question: string) {
  try {
    const config = readSmtpConfig();
    if (!config) return;

    const db = createAdminClient();

    const { data: bot } = await db
      .from('bots')
      .select('name, user_id, notify_leads')
      .eq('id', botId)
      .maybeSingle();

    if (!bot || bot.notify_leads === false) return;

    const [{ data: profile }, { data: owner }] = await Promise.all([
      db.from('profiles').select('locale').eq('user_id', bot.user_id).maybeSingle(),
      db.auth.admin.getUserById(bot.user_id as string),
    ]);

    const recipient = owner?.user?.email;
    if (!recipient) return;

    /*
     * La langue du PROPRIETAIRE, pas celle du visiteur.
     *
     * C'est lui qui recoit le message. Le visiteur qui declenche l'envoi peut
     * naviguer dans une tout autre langue — s'en servir enverrait au client une
     * alerte qu'il ne lit pas.
     */
    const stored = profile?.locale;
    const locale: Locale = isLocale(stored) ? stored : DEFAULT_LOCALE;

    const message = buildLeadAlertEmail({
      locale,
      botName: (bot.name as string) ?? 'Deezy',
      visitorEmail: email,
      question,
      leadsUrl: `${PUBLIC_APP_URL}/dashboard/bots/${botId}/leads`,
    });

    await getTransport(config).sendMail({
      from: FROM,
      to: recipient,
      // Repondre depuis sa boite atterrit chez le visiteur, pas chez nous :
      // c'est le geste le plus rapide, autant le rendre naturel.
      replyTo: email,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
  } catch (cause) {
    console.error('[leads] alerte non envoyee', botId, cause);
  }
}
