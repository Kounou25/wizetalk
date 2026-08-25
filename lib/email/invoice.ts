import type { Locale } from '@/lib/i18n/config';
import { PUBLIC_ASSET_URL, SUPPORT_EMAIL } from '@/lib/public-url';
import { BRAND_SOFT, escapeHtml, FONT, INK, LINE, MUTED, PAGE, TEXT } from './theme';

/**
 * Message d'envoi de facture.
 *
 * Le PDF est joint, pas reconstruit : c'est celui de Dodo, la piece
 * comptable qui fait foi. En regenerer une ici garantirait qu'un jour les deux
 * divergent — sur un montant de taxe, un numero de facture ou une mention
 * legale — et c'est nous qui aurions tort.
 *
 * Le corps du message ne sert donc qu'a annoncer et a situer : ce qui a ete
 * preleve, pour quel plan, et ou retrouver l'historique complet.
 */
const LOGO = {
  src: `${PUBLIC_ASSET_URL}/deezy-logo.png`,
  width: 150,
  height: 48,
};

export interface InvoiceContent {
  subject: string;
  html: string;
  text: string;
}

interface Copy {
  subject: (plan: string) => string;
  preheader: (amount: string) => string;
  greeting: (name: string) => string;
  intro: string;
  planLabel: string;
  amountLabel: string;
  periodLabel: string;
  referenceLabel: string;
  attachment: string;
  manageTitle: string;
  manageBody: string;
  manageCta: string;
  help: string;
  monthly: string;
  annual: string;
}

const COPY: Record<Locale, Copy> = {
  fr: {
    subject: (plan) => `Votre facture Deezy — ${plan}`,
    preheader: (amount) => `Paiement de ${amount} reçu. Votre facture est en pièce jointe.`,
    greeting: (name) => `Bonjour ${name},`,
    intro:
      'Votre paiement a bien été reçu et votre abonnement est actif. La facture est jointe à ce message, au format PDF.',
    planLabel: 'Plan',
    amountLabel: 'Montant',
    periodLabel: 'Facturation',
    referenceLabel: 'Référence',
    attachment: 'Facture jointe',
    manageTitle: 'Gérer votre abonnement',
    manageBody:
      'Moyen de paiement, résiliation et historique complet de vos factures se trouvent dans votre espace.',
    manageCta: 'Ouvrir mon espace',
    help: 'Une question sur cette facture ? Répondez simplement à ce message.',
    monthly: 'Mensuelle',
    annual: 'Annuelle',
  },
  en: {
    subject: (plan) => `Your Deezy invoice — ${plan}`,
    preheader: (amount) => `Payment of ${amount} received. Your invoice is attached.`,
    greeting: (name) => `Hi ${name},`,
    intro:
      'Your payment went through and your subscription is active. The invoice is attached to this message as a PDF.',
    planLabel: 'Plan',
    amountLabel: 'Amount',
    periodLabel: 'Billing',
    referenceLabel: 'Reference',
    attachment: 'Invoice attached',
    manageTitle: 'Manage your subscription',
    manageBody:
      'Payment method, cancellation and your full invoice history are available in your account.',
    manageCta: 'Open my account',
    help: 'A question about this invoice? Just reply to this message.',
    monthly: 'Monthly',
    annual: 'Annual',
  },
};

export interface InvoiceDetails {
  locale: Locale;
  name: string;
  planLabel: string;
  /** Montant deja formate, taxe comprise — ex. « 19,00 $ ». */
  amount: string;
  period: 'monthly' | 'annual';
  /** Identifiant du paiement, utile au support comme au client. */
  reference: string;
  settingsUrl: string;
}

export function buildInvoiceEmail(details: InvoiceDetails): InvoiceContent {
  const t = COPY[details.locale] ?? COPY.fr;
  const e = escapeHtml;

  const rows: [string, string][] = [
    [t.planLabel, details.planLabel],
    [t.amountLabel, details.amount],
    [t.periodLabel, details.period === 'annual' ? t.annual : t.monthly],
    [t.referenceLabel, details.reference],
  ];

  const rowsHtml = rows
    .map(
      ([label, value], index) => `
              <tr>
                <td style="padding:${index === 0 ? '0' : '10px'} 0 0 0;font:400 14px/21px ${FONT};color:${MUTED};">${e(label)}</td>
                <td align="right" style="padding:${index === 0 ? '0' : '10px'} 0 0 0;font:600 14px/21px ${FONT};color:${INK};">${e(value)}</td>
              </tr>`,
    )
    .join('');

  const html = `<!doctype html>
<html lang="${details.locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<!-- Le logo est un PNG transparent : sans ces deux declarations, Apple Mail et
     Outlook assombrissent le message et le mot devient illisible. -->
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${e(t.subject(details.planLabel))}</title>
</head>
<body style="margin:0;padding:0;background:${PAGE};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${e(t.preheader(details.amount))}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAGE};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:16px;border:1px solid ${LINE};">

          <tr>
            <td style="padding:28px 40px;border-bottom:1px solid ${LINE};">
              <img src="${LOGO.src}" alt="Deezy" width="${LOGO.width}" height="${LOGO.height}" style="display:block;border:0;outline:none;text-decoration:none;width:${LOGO.width}px;max-width:${LOGO.width}px;height:auto;">
            </td>
          </tr>

          <tr>
            <td style="padding:36px 40px 0 40px;">
              <div style="font:600 19px/26px ${FONT};color:${INK};">${e(t.greeting(details.name))}</div>
              <div style="font:400 15px/23px ${FONT};color:${TEXT};padding-top:10px;">${e(t.intro)}</div>
            </td>
          </tr>

          <!-- Recapitulatif : les memes chiffres que le PDF, pour que le
               destinataire n'ait pas a l'ouvrir pour verifier. -->
          <tr>
            <td style="padding:24px 40px 0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND_SOFT};border-radius:12px;padding:18px 20px;">
                <tr><td style="padding:18px 20px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rowsHtml}</table>
                </td></tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 40px 0 40px;">
              <div style="font:600 14px/21px ${FONT};color:${INK};">📎 ${e(t.attachment)}</div>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 40px 0 40px;">
              <div style="border-top:1px solid ${LINE};padding-top:24px;">
                <div style="font:600 15px/22px ${FONT};color:${INK};">${e(t.manageTitle)}</div>
                <div style="font:400 14px/21px ${FONT};color:${MUTED};padding-top:4px;">${e(t.manageBody)}</div>
                <div style="padding-top:14px;">
                  <a href="${e(details.settingsUrl)}" style="display:inline-block;background:${INK};color:#ffffff;font:600 14px/1 ${FONT};padding:12px 20px;border-radius:10px;text-decoration:none;">${e(t.manageCta)}</a>
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 40px 36px 40px;">
              <div style="font:400 13px/20px ${FONT};color:${MUTED};">${e(t.help)}</div>
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

  /* Version texte : elle sert aux clients en mode texte et ameliore nettement
     le classement anti-spam. Elle n'est jamais facultative. */
  const text = [
    t.greeting(details.name),
    '',
    t.intro,
    '',
    ...rows.map(([label, value]) => `${label} : ${value}`),
    '',
    t.attachment,
    '',
    `${t.manageTitle} : ${details.settingsUrl}`,
    '',
    t.help,
    `Deezy · ${SUPPORT_EMAIL}`,
  ].join('\n');

  return { subject: t.subject(details.planLabel), html, text };
}
