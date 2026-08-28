import 'server-only';

import DodoPayments from 'dodopayments';

import { PUBLIC_APP_URL } from '@/lib/public-url';
import { productIdFor, type BillingPeriod, type PaidPlanId } from './plans';

/**
 * Client Dodo Payments.
 *
 * `test_mode` et `live_mode` ont leurs propres cles ET leurs propres produits :
 * une cle de test avec un identifiant de produit de production echoue avec une
 * erreur peu parlante. D'ou le controle explicite au demarrage.
 */
function environment(): 'test_mode' | 'live_mode' {
  const value = process.env.DODO_ENVIRONMENT;

  if (value !== 'test_mode' && value !== 'live_mode') {
    throw new Error(
      `DODO_ENVIRONMENT doit valoir 'test_mode' ou 'live_mode' (recu : ${value ?? 'vide'}).`,
    );
  }

  return value;
}

let client: DodoPayments | null = null;

export function dodo(): DodoPayments {
  if (client) return client;

  const bearerToken = process.env.DODO_API_KEY;
  if (!bearerToken) throw new Error('DODO_API_KEY manquante.');

  client = new DodoPayments({ bearerToken, environment: environment() });
  return client;
}

export interface StartedSubscription {
  subscriptionId: string;
  customerId: string;
  /** Page de paiement hebergee par Dodo, ou rediriger le client. */
  paymentLink: string;
}

/**
 * Ouvre un abonnement et renvoie le lien de paiement.
 *
 * Le paiement se fait sur la page de Dodo, pas sur la notre : aucune donnee
 * bancaire ne traverse l'application, et les moyens de paiement locaux comme la
 * conformite restent a la charge du prestataire.
 *
 * L'abonnement est cree en statut `pending`. Il ne donne AUCUN droit tant que
 * le webhook `subscription.active` n'est pas arrive  la redirection de retour
 * n'accorde rien, sinon il suffirait de visiter l'URL de succes pour s'offrir
 * un plan.
 */
export async function startSubscription({
  plan,
  period,
  userId,
  email,
  name,
  country,
  locale,
}: {
  plan: PaidPlanId;
  period: BillingPeriod;
  userId: string;
  email: string;
  name: string;
  /** Code ISO 3166-1 alpha-2. Exige par Dodo pour le calcul des taxes. */
  country: string;
  /** Langue du client, pour les messages declenches par webhook. */
  locale: string;
}): Promise<StartedSubscription> {
  const subscription = await dodo().subscriptions.create({
    product_id: productIdFor(plan, period),
    quantity: 1,
    customer: { email, name },
    billing: { country: country as never, state: '', city: '', street: '', zipcode: '' },
    payment_link: true,
    return_url: `${PUBLIC_APP_URL}/dashboard/settings?checkout=done`,
    /*
     * Les metadonnees sont envoyees par confort de lecture dans le tableau de
     * bord Dodo. Le rapprochement, lui, ne s'appuie PAS dessus : la
     * documentation ne garantit pas qu'elles reviennent dans les webhooks. On
     * ecrit `subscription_id -> user_id` en base des le retour de cet appel.
     */
    /*
     * `locale` est la seule facon de connaitre la langue du client au moment
     * d'un webhook : celui-ci n'a aucun contexte de requete, donc ni cookie ni
     * en-tete. On l'enregistre ici, ou on la connait encore.
     */
    metadata: { user_id: userId, plan, period, locale },
  });

  if (!subscription.payment_link) {
    throw new Error('Dodo n’a pas renvoye de lien de paiement.');
  }

  return {
    subscriptionId: subscription.subscription_id,
    customerId: subscription.customer.customer_id,
    paymentLink: subscription.payment_link,
  };
}

/**
 * Lien vers le portail de gestion du client.
 *
 * C'est la que se font l'annulation, le changement de moyen de paiement et le
 * telechargement des factures. Les reimplementer chez nous demanderait de
 * repliquer une logique de facturation que le prestataire tient deja a jour.
 */
export async function customerPortalLink(customerId: string): Promise<string> {
  const session = await dodo().customers.customerPortal.create(customerId);
  return session.link;
}
