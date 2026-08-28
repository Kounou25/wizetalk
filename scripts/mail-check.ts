/**
 * Verifie le message de bienvenue, et en ecrit un apercu ouvrable.
 *
 *   npm run mail:check                        contrôles seuls, aucun envoi
 *   npm run mail:check -- --send vous@ex.fr   envoie un vrai message de test
 *
 * Sans --send, on éprouve la construction du message, pas la messagerie.
 * Les deux fichiers produits dans .preview/ s'ouvrent dans un navigateur.
 */

import 'dotenv/config';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { buildWelcomeEmail, firstNameFrom, FROM } from '../lib/email/welcome';

const OK = '\x1b[32m✓\x1b[0m';
const KO = '\x1b[31m✗\x1b[0m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

let failures = 0;

function check(condition: boolean, label: string, detail = '') {
  console.log(`${condition ? OK : KO} ${label}${detail ? ` ${DIM}${detail}${RESET}` : ''}`);
  if (!condition) failures++;
}

async function main() {
  // --- Expediteur ---------------------------------------------------------
  check(FROM.includes('hello@deezy.chat'), 'expéditeur : hello@deezy.chat', FROM);

  // --- Personnalisation du prenom ----------------------------------------
  const names: [string, string | null, string][] = [
    ['marie.dupont@exemple.fr', null, 'Marie'],
    ['contact@boutique.fr', null, 'Contact'],
    ['j.martin@exemple.fr', 'Julien Martin', 'Julien'],
    ['info@exemple.fr', '  ', 'Info'],
  ];
  for (const [email, fullName, expected] of names) {
    const got = firstNameFrom(email, fullName);
    check(got === expected, `prénom depuis « ${email} »`, `→ ${got}`);
  }

  // --- Contenu des deux langues ------------------------------------------
  const outDir = path.resolve(process.cwd(), '.preview');
  await mkdir(outDir, { recursive: true });
  const logoBase64 = (await readFile(path.resolve(process.cwd(), 'public/email-logo.png'))).toString('base64');

  for (const locale of ['fr', 'en'] as const) {
    const mail = buildWelcomeEmail(locale, 'Marie', 'https://www.deezy.chat/dashboard');

    check(mail.subject.length > 0 && mail.subject.length < 70,
      `${locale} : objet de longueur raisonnable`, `${mail.subject.length} car.  « ${mail.subject} »`);
    check(mail.html.includes('Marie'), `${locale} : prénom présent dans le HTML`);
    check(mail.html.includes('https://www.deezy.chat/dashboard'), `${locale} : lien vers le tableau de bord`);

    // Le logo part chez le destinataire : une adresse relative ou en localhost
    // s'affiche parfaitement ici et reste blanche dans sa boite.
    const logo = mail.html.match(/<img src="([^"]+)"[^>]*alt="([^"]*)"/);
    check(logo?.[1]?.startsWith('https://') === true,
      `${locale} : logo servi en https absolu`, logo?.[1] ?? 'aucune balise img');
    check((logo?.[2]?.length ?? 0) > 0,
      `${locale} : logo doté d'un texte alternatif`, logo?.[2] ?? '');
    check(mail.text.length > 200, `${locale} : version texte fournie`, `${mail.text.length} car.`);
    check(!mail.html.includes('class="'), `${locale} : aucune classe CSS`, 'styles en ligne uniquement');
    check(mail.html.includes('display:none'), `${locale} : texte de prévisualisation présent`);

    /*
     * Pour l'apercu seulement : le logo est incorpore en data: URI.
     * Le message reel garde une URL https  les data: URI sont bloquees par
     * la plupart des clients de messagerie. Sans cela, l'apercu afficherait
     * une image cassee tant que le domaine ne sert pas encore le fichier.
     */
    const inlineLogo = `data:image/png;base64,${logoBase64}`;
    const file = path.join(outDir, `welcome-${locale}.html`);
    await writeFile(file, mail.html.replace(/src="https:\/\/[^"]+email-logo\.png"/, `src="${inlineLogo}"`), 'utf8');
    console.log(`${DIM}   aperçu : ${file}${RESET}`);
  }

  // --- Echappement --------------------------------------------------------
  const hostile = buildWelcomeEmail('fr', '<script>alert(1)</script>', 'https://www.deezy.chat/dashboard');
  check(!hostile.html.includes('<script>alert'), 'un nom hostile est échappé');

  // Echapper deux fois afficherait « Jean &amp; Marie » a l'ecran.
  const ampersand = buildWelcomeEmail('fr', 'Jean & Marie', 'https://www.deezy.chat/dashboard');
  check(ampersand.html.includes('Jean &amp; Marie') && !ampersand.html.includes('&amp;amp;'),
    'une esperluette est échappée une seule fois');

  // --- Connexion SMTP (sans envoi) ----------------------------------------
  // verify() ouvre la session et s'authentifie, puis raccroche. C'est le seul
  // moyen de distinguer « mal configuré » de « message parti mais non reçu ».
  const { readSmtpConfig, verifySmtp } = await import('../lib/email/smtp');
  if (!readSmtpConfig()) {
    console.log(`${DIM}   SMTP non configuré : connexion non testée.${RESET}`);
  } else {
    const result = await verifySmtp();
    check(result.ok, 'connexion et authentification SMTP', result.error ?? '');

    // --- Envoi reel, sur demande explicite ---------------------------------
    // Une connexion qui s'ouvre ne prouve pas qu'un message arrive : le
    // serveur peut refuser l'expediteur, ou le message finir en indesirables.
    const to = process.argv[process.argv.indexOf('--send') + 1];
    if (result.ok && process.argv.includes('--send')) {
      if (!to || to.startsWith('--')) {
        check(false, 'destinataire manquant', 'usage : -- --send vous@exemple.fr');
      } else {
        const { getTransport } = await import('../lib/email/smtp');
        const mail = buildWelcomeEmail('fr', firstNameFrom(to), 'https://www.deezy.chat/dashboard');
        try {
          const info = await getTransport(readSmtpConfig()!).sendMail({
            from: FROM, to, subject: mail.subject, html: mail.html, text: mail.text,
            replyTo: 'hello@deezy.chat',
          });
          check(true, `message envoyé à ${to}`, info.messageId);
          console.log(`${DIM}   vérifiez la boîte, y compris les indésirables.${RESET}`);
        } catch (error) {
          check(false, `envoi vers ${to}`, error instanceof Error ? error.message : String(error));
        }
      }
    }
  }

  console.log(failures === 0 ? '\nMessage de bienvenue validé.\n' : `\n${failures} échec(s).\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
