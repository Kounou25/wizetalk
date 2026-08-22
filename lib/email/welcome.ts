import type { Locale } from '@/lib/i18n/config';
import { PUBLIC_ASSET_URL } from '@/lib/public-url';

/**
 * Message de bienvenue.
 *
 * Ecrit en HTML a la main, avec des styles en ligne : les clients de
 * messagerie ignorent les feuilles de style externes, et beaucoup nettoient
 * meme les balises <style> d'en-tete. Des tableaux et du style inline restent
 * ce qui s'affiche le plus surement, de Gmail a Outlook.
 *
 * Une version texte accompagne toujours la version HTML : elle sert aux
 * clients en mode texte et ameliore nettement le classement anti-spam.
 */

/** Expediteur. Adresse publique, pas un secret : elle vit avec le gabarit. */
export const FROM = 'Deezy <hello@deezy.chat>';

/**
 * Logo du message.
 *
 * Une copie calibree pour la messagerie : l'original fait 2172 px de large et
 * 438 Ko, telecharges a chaque ouverture. Celle-ci en fait 440 — deux fois la
 * taille d'affichage, pour rester net sur ecran haute densite — et 29 Ko.
 */
const LOGO = {
  src: `${PUBLIC_ASSET_URL}/email-logo.png`,
  width: 150,
  height: 50,
};

/**
 * Palette, reprise de l'application (--brand converti en hexadecimal : aucun
 * client de messagerie ne comprend oklch()).
 */
const BRAND = '#0069E8';
const BRAND_SOFT = '#EAF3FF';
const INK = '#0F172A';
const TEXT = '#334155';
const MUTED = '#64748B';
const LINE = '#E7ECF3';
const PAGE = '#F1F5F9';

const FONT = "-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

export interface WelcomeContent {
  subject: string;
  html: string;
  text: string;
}

interface Step {
  title: string;
  detail: string;
}

interface Copy {
  subject: string;
  /** Ligne affichee par la boite de reception a cote de l'objet. */
  preheader: string;
  greeting: (name: string) => string;
  intro: string;
  stepsLabel: string;
  steps: Step[];
  cta: string;
  ctaHint: string;
  linkFallback: string;
  trialTitle: string;
  trial: string;
  helpTitle: string;
  help: string;
  signature: string;
  tagline: string;
  reason: string;
}

const COPY: Record<Locale, Copy> = {
  fr: {
    subject: 'Bienvenue chez Deezy — créons votre assistant',
    preheader: 'Trois étapes : votre site, vos documents, une ligne de code.',
    greeting: (name) => `Bienvenue, ${name}.`,
    intro:
      'Votre compte est prêt. Dans quelques minutes, votre site pourra répondre seul aux questions de vos visiteurs — avec vos mots, vos tarifs, vos conditions.',
    stepsLabel: 'Mise en route',
    steps: [
      {
        title: 'Indiquez l’adresse de votre site',
        detail: 'Deezy le parcourt et retient ce qui compte.',
      },
      {
        title: 'Ajoutez vos documents',
        detail: 'Tarifs, catalogue, conditions — en PDF, Word ou texte.',
      },
      {
        title: 'Collez une ligne de code',
        detail: 'Votre assistant apparaît sur votre site. C’est tout.',
      },
    ],
    cta: 'Créer mon assistant',
    ctaHint: 'Aucune compétence technique requise.',
    linkFallback: 'Le bouton ne fonctionne pas ? Copiez cette adresse dans votre navigateur :',
    trialTitle: 'Votre essai de 7 jours a commencé',
    trial:
      'Sept jours pour l’essayer sur votre propre site. Résiliable en un clic, sans justification.',
    helpTitle: 'Une question ?',
    help: 'Répondez simplement à ce message : une vraie personne le lira.',
    signature: 'L’équipe Deezy',
    tagline: 'Deezy — l’assistant chatbot IA de votre site',
    reason: 'Vous recevez ce message parce qu’un compte Deezy vient d’être créé avec cette adresse.',
  },
  en: {
    subject: 'Welcome to Deezy — let’s build your assistant',
    preheader: 'Three steps: your website, your documents, one line of code.',
    greeting: (name) => `Welcome, ${name}.`,
    intro:
      'Your account is ready. In a few minutes, your website will answer visitors on its own — in your words, with your prices and your terms.',
    stepsLabel: 'Getting started',
    steps: [
      {
        title: 'Give us your website address',
        detail: 'Deezy reads through it and keeps what matters.',
      },
      {
        title: 'Add your documents',
        detail: 'Prices, catalogue, terms — as PDF, Word or plain text.',
      },
      {
        title: 'Paste one line of code',
        detail: 'Your assistant appears on your site. That is all.',
      },
    ],
    cta: 'Create my assistant',
    ctaHint: 'No technical skills required.',
    linkFallback: 'Button not working? Copy this address into your browser:',
    trialTitle: 'Your 7-day trial has started',
    trial:
      'Seven days to try it on your own website. Cancel in one click, no questions asked.',
    helpTitle: 'Any questions?',
    help: 'Just reply to this message — a real person will read it.',
    signature: 'The Deezy team',
    tagline: 'Deezy — the AI chatbot assistant for your website',
    reason: 'You are receiving this because a Deezy account was just created with this address.',
  },
};

/**
 * Prenom exploitable a partir de ce que l'on sait du compte.
 *
 * Le formulaire d'inscription demande desormais le nom, et Google le fournit
 * aussi. Reste le cas des comptes anterieurs : on retombe alors sur la partie
 * locale de l'adresse, nettoyee — mieux vaut « Bienvenue marie » qu'un
 * « Bienvenue » sec ou, pire, un prenom invente.
 */
export function firstNameFrom(email: string, fullName?: string | null): string {
  const fromName = (fullName ?? '').trim().split(/\s+/)[0];
  if (fromName && fromName.length >= 2) return fromName;

  const local = email.split('@')[0] ?? '';
  const cleaned = local.split(/[._+-]/)[0] ?? local;
  if (!cleaned) return email;

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildWelcomeEmail(
  locale: Locale,
  name: string,
  dashboardUrl: string,
): WelcomeContent {
  const t = COPY[locale] ?? COPY.fr;

  /*
   * Echappement en un seul endroit : le texte brut circule tel quel jusqu'ici,
   * et n'est protege qu'au moment d'entrer dans le HTML. Echapper plus tot
   * afficherait « Jean &amp; Marie » au lieu de « Jean & Marie ».
   */
  const e = escapeHtml;
  const url = e(dashboardUrl);

  const steps = t.steps
    .map(
      (step, index) => `
              <tr>
                <td width="34" style="padding:0 0 18px 0;vertical-align:top;">
                  <div style="width:26px;height:26px;border-radius:13px;background:${BRAND_SOFT};color:${BRAND};font:600 13px/26px ${FONT};text-align:center;">${index + 1}</div>
                </td>
                <td style="padding:0 0 18px 0;">
                  <div style="font:600 15px/22px ${FONT};color:${INK};">${e(step.title)}</div>
                  <div style="font:400 14px/21px ${FONT};color:${MUTED};padding-top:2px;">${e(step.detail)}</div>
                </td>
              </tr>`,
    )
    .join('');

  const html = `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<!-- Le logo est un PNG transparent : sans ces deux declarations, Apple Mail et
     Outlook assombrissent le message et le mot devient illisible. -->
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${e(t.subject)}</title>
</head>
<body style="margin:0;padding:0;background:${PAGE};-webkit-font-smoothing:antialiased;">
  <!-- Texte de previsualisation : ce que la boite de reception montre a cote
       de l'objet. Masque dans le corps du message. -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${e(t.preheader)}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAGE};">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:16px;border:1px solid ${LINE};">

          <!-- En-tete -->
          <tr>
            <td style="padding:28px 40px;border-bottom:1px solid ${LINE};">
              <img src="${LOGO.src}" alt="Deezy" width="${LOGO.width}" height="${LOGO.height}" style="display:block;border:0;outline:none;text-decoration:none;width:${LOGO.width}px;max-width:${LOGO.width}px;height:auto;">
            </td>
          </tr>

          <!-- Accueil -->
          <tr>
            <td style="padding:36px 40px 0 40px;">
              <h1 style="margin:0;font:700 24px/32px ${FONT};color:${INK};letter-spacing:-0.3px;">${e(t.greeting(name))}</h1>
              <p style="margin:12px 0 0 0;font:400 16px/25px ${FONT};color:${TEXT};">${e(t.intro)}</p>
            </td>
          </tr>

          <!-- Appel a l'action -->
          <tr>
            <td style="padding:28px 40px 0 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <!-- bgcolor en attribut : Outlook ignore background en CSS. -->
                  <td align="center" bgcolor="${BRAND}" style="border-radius:10px;">
                    <a href="${url}" style="display:inline-block;padding:14px 30px;font:600 16px/20px ${FONT};color:#ffffff;text-decoration:none;border-radius:10px;">${e(t.cta)}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:10px 0 0 0;font:400 13px/20px ${FONT};color:${MUTED};">${e(t.ctaHint)}</p>
            </td>
          </tr>

          <!-- Etapes -->
          <tr>
            <td style="padding:32px 40px 0 40px;">
              <div style="font:600 11px/16px ${FONT};color:${MUTED};letter-spacing:1.2px;text-transform:uppercase;padding-bottom:16px;">${e(t.stepsLabel)}</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${steps}</table>
            </td>
          </tr>

          <!-- Essai -->
          <tr>
            <td style="padding:14px 40px 0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND_SOFT};border-radius:12px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <div style="font:600 15px/22px ${FONT};color:${INK};">${e(t.trialTitle)}</div>
                    <div style="font:400 14px/21px ${FONT};color:${TEXT};padding-top:4px;">${e(t.trial)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Aide et signature -->
          <tr>
            <td style="padding:28px 40px 36px 40px;">
              <div style="border-top:1px solid ${LINE};padding-top:24px;">
                <div style="font:600 15px/22px ${FONT};color:${INK};">${e(t.helpTitle)}</div>
                <p style="margin:4px 0 0 0;font:400 14px/21px ${FONT};color:${TEXT};">${e(t.help)}</p>
                <p style="margin:20px 0 0 0;font:400 15px/22px ${FONT};color:${INK};">${e(t.signature)}</p>
              </div>
            </td>
          </tr>
        </table>

        <!-- Pied de page, hors de la carte -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
          <tr>
            <td style="padding:22px 8px 0 8px;">
              <p style="margin:0;font:400 12px/19px ${FONT};color:${MUTED};word-break:break-all;">
                ${e(t.linkFallback)}<br>
                <a href="${url}" style="color:${BRAND};text-decoration:none;">${url}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:20px 8px 8px 8px;">
              <p style="margin:0;font:400 12px/19px ${FONT};color:${MUTED};">${e(t.tagline)}</p>
              <p style="margin:6px 0 0 0;font:400 12px/19px ${FONT};color:#94A3B8;">${e(t.reason)}</p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    t.greeting(name),
    '',
    t.intro,
    '',
    t.stepsLabel.toUpperCase(),
    ...t.steps.map((step, index) => `${index + 1}. ${step.title} — ${step.detail}`),
    '',
    `${t.cta} : ${dashboardUrl}`,
    t.ctaHint,
    '',
    `${t.trialTitle} — ${t.trial}`,
    '',
    `${t.helpTitle} ${t.help}`,
    '',
    t.signature,
    '',
    '—',
    t.tagline,
    t.reason,
  ].join('\n');

  return { subject: t.subject, html, text };
}
