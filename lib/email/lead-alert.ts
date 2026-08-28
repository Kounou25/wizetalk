import type { Locale } from '@/lib/i18n/config';
import { PUBLIC_ASSET_URL, SUPPORT_EMAIL } from '@/lib/public-url';
import { BRAND_SOFT, escapeHtml, FONT, INK, LINE, MUTED, PAGE, TEXT } from './theme';

/**
 * Alerte de prospect.
 *
 * Le message doit tenir en un coup d'oeil sur telephone : l'adresse et la
 * question, rien d'autre au-dessus. C'est un signal d'action, pas un rapport —
 * ce que le proprietaire doit faire, c'est rappeler, pas lire.
 *
 * La question figure en clair dans le corps : elle donne le contexte du rappel
 * et evite d'avoir a rouvrir la conversation pour savoir de quoi il s'agit.
 */
const LOGO = {
  src: `${PUBLIC_ASSET_URL}/deezy-logo.png`,
  width: 130,
  height: 42,
};

export interface LeadAlertContent {
  subject: string;
  html: string;
  text: string;
}

interface Copy {
  subject: (bot: string) => string;
  preheader: (email: string) => string;
  title: string;
  intro: (bot: string) => string;
  emailLabel: string;
  questionLabel: string;
  cta: string;
  replyHint: string;
  why: string;
}

const COPY: Record<Locale, Copy> = {
  fr: {
    subject: (bot) => `Nouveau prospect sur ${bot}`,
    preheader: (email) => `${email} attend votre réponse.`,
    title: 'Un visiteur attend votre réponse',
    intro: (bot) =>
      `Votre assistant ${bot} n’a pas trouvé la réponse, et le visiteur a laissé son adresse pour être rappelé.`,
    emailLabel: 'Son adresse',
    questionLabel: 'Sa question',
    cta: 'Voir dans mon espace',
    /* L'incitation qui compte : repondre depuis sa boite est plus rapide que
       d'ouvrir le tableau de bord, et c'est la vitesse qui convertit. */
    replyHint:
      'Vous pouvez répondre directement à cette adresse  c’est souvent le plus rapide.',
    why: 'Vous recevez ce message parce que la collecte de prospects est active sur cet assistant. Elle se désactive depuis ses paramètres.',
  },
  en: {
    subject: (bot) => `New lead on ${bot}`,
    preheader: (email) => `${email} is waiting for your reply.`,
    title: 'A visitor is waiting for your reply',
    intro: (bot) =>
      `Your assistant ${bot} couldn’t find the answer, and the visitor left their address to be contacted.`,
    emailLabel: 'Their address',
    questionLabel: 'Their question',
    cta: 'Open my account',
    replyHint: 'You can reply straight to that address  it’s usually the fastest.',
    why: 'You are receiving this because lead capture is enabled on this assistant. It can be turned off from its settings.',
  },
};

export interface LeadAlertDetails {
  locale: Locale;
  botName: string;
  visitorEmail: string;
  question: string;
  leadsUrl: string;
}

export function buildLeadAlertEmail(details: LeadAlertDetails): LeadAlertContent {
  const t = COPY[details.locale] ?? COPY.fr;
  const e = escapeHtml;

  const html = `<!doctype html>
<html lang="${details.locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${e(t.subject(details.botName))}</title>
</head>
<body style="margin:0;padding:0;background:${PAGE};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${e(t.preheader(details.visitorEmail))}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAGE};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:16px;border:1px solid ${LINE};">

          <tr>
            <td style="padding:24px 32px;border-bottom:1px solid ${LINE};">
              <img src="${LOGO.src}" alt="Deezy" width="${LOGO.width}" height="${LOGO.height}" style="display:block;border:0;outline:none;text-decoration:none;width:${LOGO.width}px;max-width:${LOGO.width}px;height:auto;">
            </td>
          </tr>

          <tr>
            <td style="padding:32px 32px 0 32px;">
              <div style="font:600 20px/27px ${FONT};color:${INK};">${e(t.title)}</div>
              <div style="font:400 15px/23px ${FONT};color:${TEXT};padding-top:10px;">${e(t.intro(details.botName))}</div>
            </td>
          </tr>

          <!-- L'adresse d'abord, en gros et cliquable : c'est la seule chose a
               faire apres avoir lu ce message. -->
          <tr>
            <td style="padding:24px 32px 0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND_SOFT};border-radius:12px;">
                <tr><td style="padding:20px 22px;">
                  <div style="font:400 12px/18px ${FONT};color:${MUTED};text-transform:uppercase;letter-spacing:0.06em;">${e(t.emailLabel)}</div>
                  <div style="padding-top:4px;">
                    <a href="mailto:${e(details.visitorEmail)}" style="font:700 20px/28px ${FONT};color:${INK};text-decoration:none;word-break:break-all;">${e(details.visitorEmail)}</a>
                  </div>

                  <div style="font:400 12px/18px ${FONT};color:${MUTED};text-transform:uppercase;letter-spacing:0.06em;padding-top:18px;">${e(t.questionLabel)}</div>
                  <div style="font:400 15px/23px ${FONT};color:${TEXT};padding-top:4px;">“${e(details.question)}”</div>
                </td></tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 32px 0 32px;">
              <div style="font:400 14px/21px ${FONT};color:${MUTED};">${e(t.replyHint)}</div>
              <div style="padding-top:16px;">
                <a href="${e(details.leadsUrl)}" style="display:inline-block;background:${INK};color:#ffffff;font:600 14px/1 ${FONT};padding:12px 20px;border-radius:10px;text-decoration:none;">${e(t.cta)}</a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 32px 32px 32px;">
              <div style="border-top:1px solid ${LINE};padding-top:18px;font:400 12px/18px ${FONT};color:${MUTED};">${e(t.why)}</div>
            </td>
          </tr>

        </table>

        <div style="font:400 12px/18px ${FONT};color:${MUTED};padding-top:18px;">
          Deezy · <a href="mailto:${SUPPORT_EMAIL}" style="color:${MUTED};">${SUPPORT_EMAIL}</a>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    t.title,
    '',
    t.intro(details.botName),
    '',
    `${t.emailLabel} : ${details.visitorEmail}`,
    `${t.questionLabel} : ${details.question}`,
    '',
    t.replyHint,
    `${t.cta} : ${details.leadsUrl}`,
    '',
    t.why,
    `Deezy · ${SUPPORT_EMAIL}`,
  ].join('\n');

  return { subject: t.subject(details.botName), html, text };
}
