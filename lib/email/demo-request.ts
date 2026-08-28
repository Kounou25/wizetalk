import type { Locale } from '@/lib/i18n/config';
import { PUBLIC_ASSET_URL, SUPPORT_EMAIL } from '@/lib/public-url';
import { BRAND_SOFT, escapeHtml, FONT, INK, LINE, MUTED, PAGE, TEXT } from './theme';

/**
 * Alerte interne : une organisation vient de demander une demonstration.
 *
 * REDIGEE EN FRANCAIS, SANS TRADUCTION
 *
 * Contrairement a l'alerte de prospect, qui part chez un client et suit donc
 * sa langue, celle-ci ne quitte jamais l'equipe. La langue du DEMANDEUR figure
 * en revanche dans le corps du message : c'est dans celle-la qu'il faudra lui
 * repondre, et elle ne se devine pas depuis son adresse.
 *
 * L'adresse est mise en evidence et cliquable, comme dans l'alerte de
 * prospect : le geste attendu apres lecture est de repondre, pas d'ouvrir une
 * interface.
 */
const LOGO = {
  src: `${PUBLIC_ASSET_URL}/deezy-logo.png`,
  width: 130,
  height: 42,
};

const INTENT_LABEL: Record<'demo' | 'contact', string> = {
  demo: 'Demande de démonstration',
  contact: 'Prise de contact commerciale',
};

const INDUSTRY_LABEL: Record<string, string> = {
  banking: 'Banque',
  insurance: 'Assurance',
  telecom: 'Télécoms',
  education: 'Éducation',
  healthcare: 'Santé',
  public: 'Secteur public',
  retail: 'Commerce et distribution',
  other: 'Autre',
};

export interface DemoRequestDetails {
  intent: 'demo' | 'contact';
  fullName: string;
  email: string;
  company: string;
  website: string | null;
  industry: string | null;
  message: string | null;
  /** Langue de la page au moment de l'envoi : celle de la reponse attendue. */
  locale: Locale;
}

export interface DemoRequestContent {
  subject: string;
  html: string;
  text: string;
}

export function buildDemoRequestEmail(details: DemoRequestDetails): DemoRequestContent {
  const e = escapeHtml;
  const intent = INTENT_LABEL[details.intent];
  const industry = details.industry
    ? (INDUSTRY_LABEL[details.industry] ?? details.industry)
    : null;

  const subject = `${intent}  ${details.company}`;

  /* Les lignes vides ne sont pas rendues : un tableau a moitie vide de tirets
     donne l'impression d'un formulaire mal rempli, alors que ces champs sont
     facultatifs par choix. */
  const rows: [string, string][] = [
    ['Organisation', details.company],
    ...(details.website ? ([['Site web', details.website]] as [string, string][]) : []),
    ...(industry ? ([['Secteur', industry]] as [string, string][]) : []),
    ['Langue de la page', details.locale === 'fr' ? 'Français' : 'English'],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) => `
                  <tr>
                    <td style="padding:6px 0;font:400 13px/20px ${FONT};color:${MUTED};width:150px;vertical-align:top;">${e(label)}</td>
                    <td style="padding:6px 0;font:500 13px/20px ${FONT};color:${INK};">${e(value)}</td>
                  </tr>`,
    )
    .join('');

  const messageHtml = details.message
    ? `
          <tr>
            <td style="padding:22px 32px 0 32px;">
              <div style="font:400 12px/18px ${FONT};color:${MUTED};text-transform:uppercase;letter-spacing:0.06em;">Son message</div>
              <div style="font:400 15px/23px ${FONT};color:${TEXT};padding-top:6px;white-space:pre-wrap;">${e(details.message)}</div>
            </td>
          </tr>`
    : '';

  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${e(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${PAGE};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${e(`${details.fullName} · ${details.company}`)}</div>

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
              <div style="font:600 20px/27px ${FONT};color:${INK};">${e(intent)}</div>
              <div style="font:400 15px/23px ${FONT};color:${TEXT};padding-top:10px;">Depuis la page Deezy Enterprise.</div>
            </td>
          </tr>

          <!-- Le nom et l'adresse d'abord : c'est la seule chose a faire apres
               avoir lu ce message. -->
          <tr>
            <td style="padding:24px 32px 0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND_SOFT};border-radius:12px;">
                <tr><td style="padding:20px 22px;">
                  <div style="font:700 18px/26px ${FONT};color:${INK};">${e(details.fullName)}</div>
                  <div style="padding-top:4px;">
                    <a href="mailto:${e(details.email)}" style="font:500 15px/23px ${FONT};color:${INK};text-decoration:none;word-break:break-all;">${e(details.email)}</a>
                  </div>
                </td></tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 32px 0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rowsHtml}
              </table>
            </td>
          </tr>
${messageHtml}
          <tr>
            <td style="padding:28px 32px 32px 32px;">
              <div style="border-top:1px solid ${LINE};padding-top:18px;font:400 12px/18px ${FONT};color:${MUTED};">Répondez directement à cette adresse : votre réponse part chez le demandeur.</div>
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
    intent,
    '',
    details.fullName,
    details.email,
    '',
    ...rows.map(([label, value]) => `${label} : ${value}`),
    ...(details.message ? ['', 'Son message :', details.message] : []),
    '',
    'Répondez directement à cette adresse.',
    `Deezy · ${SUPPORT_EMAIL}`,
  ].join('\n');

  return { subject, html, text };
}
