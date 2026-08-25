import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import { PUBLIC_APP_URL } from '@/lib/public-url';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/i18n/config';
import { buildInvoiceEmail } from '@/lib/email/invoice';
import { FROM } from '@/lib/email/welcome';
import { getTransport, readSmtpConfig } from '@/lib/email/smtp';
import { dodo } from './dodo';
import { planFromProductId } from './plans';

const PLAN_LABELS: Record<string, Record<Locale, string>> = {
  essential: { fr: 'Essentiel', en: 'Essential' },
  growth: { fr: 'Croissance', en: 'Growth' },
  business: { fr: 'Entreprise', en: 'Business' },
};

/** « 1900 » + « USD » -> « 19,00 $ ». Les montants Dodo sont en centimes. */
function formatAmount(cents: number, currency: string, locale: Locale): string {
  try {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency,
    }).format(cents / 100);
  } catch {
    // Devise inconnue d'Intl : on degrade plutot que d'echouer l'envoi.
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}

export interface PaymentNotice {
  paymentId: string;
  subscriptionId: string | null;
  productId: string | null;
  totalAmount: number | null;
  currency: string | null;
  customerEmail: string | null;
  customerName: string | null;
  metadata: Record<string, unknown> | null;
}

/**
 * Envoie la facture au client, depuis l'adresse de Deezy.
 *
 * Le PDF vient de Dodo et n'est pas regenere : c'est la piece comptable qui
 * fait foi. En produire une nous-memes garantirait qu'un jour les deux
 * divergent — sur un montant de taxe, un numero ou une mention legale — et
 * c'est nous qui aurions tort.
 *
 * Leve en cas d'echec, volontairement : l'appelant relaie l'erreur au
 * prestataire, qui rejoue l'evenement. Une facture perdue en silence est un
 * probleme comptable, pas un incident technique mineur.
 */
export async function sendInvoiceEmail(notice: PaymentNotice): Promise<void> {
  const config = readSmtpConfig();
  if (!config) throw new Error('Configuration SMTP absente : facture non envoyee.');

  const recipient = notice.customerEmail ?? (await emailFromSubscription(notice.subscriptionId));
  if (!recipient) throw new Error(`Aucun destinataire pour le paiement ${notice.paymentId}.`);

  /*
   * Langue du message.
   *
   * Envoyee dans les metadonnees de l'abonnement, ou nous la connaissons
   * encore : le webhook, lui, n'a aucun contexte de requete. A defaut, on
   * retombe sur la langue par defaut du produit plutot que de deviner.
   */
  const fromMetadata = notice.metadata?.locale;
  const locale: Locale =
    typeof fromMetadata === 'string' && isLocale(fromMetadata) ? fromMetadata : DEFAULT_LOCALE;

  const match = await resolvePlan(notice);
  const planLabel = match ? (PLAN_LABELS[match.plan]?.[locale] ?? match.plan) : 'Deezy';

  const pdf = await fetchInvoicePdf(notice.paymentId);

  const email = buildInvoiceEmail({
    locale,
    name: firstNameOf(notice.customerName, recipient),
    planLabel,
    amount: formatAmount(notice.totalAmount ?? 0, notice.currency ?? 'USD', locale),
    period: match?.period ?? 'monthly',
    reference: notice.paymentId,
    settingsUrl: `${PUBLIC_APP_URL}/dashboard/settings`,
  });

  await getTransport(config).sendMail({
    from: FROM,
    to: recipient,
    subject: email.subject,
    html: email.html,
    text: email.text,
    attachments: pdf
      ? [
          {
            filename: `deezy-facture-${notice.paymentId}.pdf`,
            content: pdf,
            contentType: 'application/pdf',
          },
        ]
      : undefined,
  });
}

/**
 * Retrouve le plan facture, par trois chemins successifs.
 *
 * L'ordre vient de l'observation : sur un paiement d'abonnement, Dodo laisse
 * `product_cart` a null — l'identifiant de produit, qui semblait la voie
 * evidente, n'est jamais renseigne. Les metadonnees de l'abonnement, elles,
 * sont bien repercutees sur le paiement.
 *
 * Notre propre base sert de recours : c'est la seule source qu'aucune
 * evolution du prestataire ne peut nous retirer.
 */
async function resolvePlan(
  notice: PaymentNotice,
): Promise<{ plan: string; period: 'monthly' | 'annual' } | null> {
  const fromMetadata = notice.metadata?.plan;
  const periodFromMetadata = notice.metadata?.period;

  if (typeof fromMetadata === 'string' && PLAN_LABELS[fromMetadata]) {
    return {
      plan: fromMetadata,
      period: periodFromMetadata === 'annual' ? 'annual' : 'monthly',
    };
  }

  if (notice.subscriptionId) {
    const db = createAdminClient();
    const { data } = await db
      .from('profiles')
      .select('plan, billing_period')
      .eq('dodo_subscription_id', notice.subscriptionId)
      .maybeSingle();

    const plan = data?.plan as string | undefined;
    if (plan && PLAN_LABELS[plan]) {
      return { plan, period: data?.billing_period === 'annual' ? 'annual' : 'monthly' };
    }
  }

  // Dernier recours, utile a un paiement hors abonnement.
  return notice.productId ? planFromProductId(notice.productId) : null;
}

/**
 * Recupere le PDF de la facture.
 *
 * Retourne `null` plutot que de lever si Dodo ne l'a pas encore genere : un
 * message annoncant le paiement sans sa piece jointe vaut mieux qu'aucun
 * message. Le client retrouve de toute facon ses factures dans son portail.
 */
async function fetchInvoicePdf(paymentId: string): Promise<Buffer | null> {
  try {
    const response = await dodo().invoices.payments.retrieve(paymentId);
    return Buffer.from(await response.arrayBuffer());
  } catch (cause) {
    console.error('[billing] facture PDF indisponible', paymentId, cause);
    return null;
  }
}

/** Adresse du compte proprietaire, quand le paiement n'en porte pas. */
async function emailFromSubscription(subscriptionId: string | null): Promise<string | null> {
  if (!subscriptionId) return null;

  const db = createAdminClient();
  const { data } = await db
    .from('profiles')
    .select('user_id')
    .eq('dodo_subscription_id', subscriptionId)
    .maybeSingle();

  if (!data?.user_id) return null;

  const { data: user } = await db.auth.admin.getUserById(data.user_id as string);
  return user?.user?.email ?? null;
}

function firstNameOf(fullName: string | null, email: string): string {
  const first = (fullName ?? '').trim().split(/\s+/)[0];
  if (first && first.length >= 2) return first;

  const local = email.split('@')[0] ?? '';
  const cleaned = local.split(/[._+-]/)[0] ?? local;
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : email;
}
