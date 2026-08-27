import 'server-only';

import { SUPPORT_EMAIL } from '@/lib/public-url';
import { buildDemoRequestEmail, type DemoRequestDetails } from './demo-request';
import { getTransport, readSmtpConfig } from './smtp';
import { FROM } from './welcome';

/**
 * Previent l'equipe qu'une organisation vient de demander une demonstration.
 *
 * NE LEVE JAMAIS.
 *
 * Meme raison que pour l'alerte de prospect : au moment ou cette fonction
 * s'execute, la demande est deja en base et le visiteur a deja vu sa
 * confirmation. Une panne du serveur de messagerie ne doit pas transformer une
 * prise de contact reussie en erreur affichee — la demande reste consultable
 * depuis /admin/demos, ou l'alerte n'est qu'un raccourci.
 *
 * A appeler depuis `after()`, jamais dans le fil de la reponse.
 *
 * DESTINATAIRE
 *
 * `ENTERPRISE_INBOX` permet de router ces demandes vers une boite commerciale
 * distincte du support. Non renseignee, elles arrivent a l'adresse de contact
 * publique — ce qui est le comportement voulu tant qu'une seule personne les
 * traite, et evite de perdre une demande a cause d'une variable oubliee au
 * deploiement.
 */
export async function sendDemoAlert(details: DemoRequestDetails): Promise<void> {
  try {
    const config = readSmtpConfig();
    if (!config) return;

    const recipient = process.env.ENTERPRISE_INBOX || SUPPORT_EMAIL;
    const message = buildDemoRequestEmail(details);

    await getTransport(config).sendMail({
      from: FROM,
      to: recipient,
      // Repondre depuis sa boite atterrit chez le demandeur : c'est le geste
      // le plus rapide, autant le rendre naturel.
      replyTo: details.email,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
  } catch (cause) {
    console.error('[enterprise] alerte non envoyee', details.email, cause);
  }
}
