import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import type { Locale } from '@/lib/i18n/config';
import { buildWelcomeEmail, firstNameFrom, FROM } from './welcome';
import { getTransport, readSmtpConfig } from './smtp';

/**
 * Envoie le message de bienvenue, une fois et une seule.
 *
 * Appelee a chaque arrivee sur le tableau de bord — c'est le seul point par
 * lequel passent TOUS les chemins d'inscription (mot de passe, Google, et
 * ceux qu'on ajoutera). Le marqueur en base fait le tri.
 *
 * L'envoi ne doit jamais faire echouer le rendu : un probleme de messagerie
 * n'est pas une raison d'empecher quelqu'un d'utiliser son compte. Toute
 * erreur est donc journalisee, jamais propagee.
 */
export async function sendWelcomeEmailOnce(user: {
  id: string;
  email: string;
  fullName?: string | null;
  locale: Locale;
  appUrl: string;
}): Promise<void> {
  const db = createAdminClient();

  /** Rend le droit d'envoyer, pour qu'une prochaine visite reessaie. */
  const release = async () => {
    await db.from('profiles').update({ welcome_email_sent_at: null }).eq('user_id', user.id);
  };

  try {
    const { data: profile } = await db
      .from('profiles')
      .select('welcome_email_sent_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profile?.welcome_email_sent_at) return;

    /*
     * On pose le verrou AVANT d'envoyer.
     *
     * Deux onglets ouverts en meme temps declencheraient sinon deux messages.
     * `ignoreDuplicates` fait echouer silencieusement la seconde insertion :
     * seule la premiere obtient le droit d'envoyer.
     */
    const { data: claimed } = await db
      .from('profiles')
      .upsert(
        { user_id: user.id, welcome_email_sent_at: new Date().toISOString() },
        { onConflict: 'user_id', ignoreDuplicates: true },
      )
      .select('user_id');

    if (!claimed || claimed.length === 0) return;

    const config = readSmtpConfig();
    if (!config) {
      console.warn('[welcome] configuration SMTP absente : message non envoyé.');
      // Sans ce relachement, configurer le SMTP plus tard ne rattraperait
      // jamais les comptes crees entre-temps.
      await release();
      return;
    }

    const name = firstNameFrom(user.email, user.fullName);
    const { subject, html, text } = buildWelcomeEmail(
      user.locale,
      name,
      `${user.appUrl}/dashboard`,
    );

    await getTransport(config).sendMail({
      from: FROM,
      to: user.email,
      subject,
      html,
      text,
      // Le message invite a repondre : les reponses doivent arriver dans la
      // boite que vous relevez en IMAP.
      replyTo: 'hello@deezy.chat',
    });
  } catch (error) {
    console.error('[welcome]', error instanceof Error ? error.message : error);
    await release().catch(() => undefined);
  }
}
