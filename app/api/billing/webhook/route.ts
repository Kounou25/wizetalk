/**
 * Reception des webhooks Dodo Payments.
 *
 * C'EST LA SEULE SOURCE DE VERITE DE LA FACTURATION.
 *
 * L'URL de retour apres paiement n'accorde aucun droit : elle est visitable par
 * n'importe qui, et un plan ne se donne pas sur la foi d'une redirection. Rien
 * n'est accorde ici non plus sans que la signature soit verifiee.
 *
 * REPARTITION AVEC LE RESTE DU SYSTEME
 *
 *   Ce webhook          plan, allocation, statut.
 *   consume_credits()   rythme mensuel des credits, inchange.
 *
 * D'ou le fait que `subscription.renewed` ne remette PAS le compteur a zero :
 * un abonnement annuel ne se renouvelle qu'une fois par an, alors que ses
 * credits doivent se recharger tous les mois. Confier le rechargement au
 * webhook priverait le client annuel de onze mois de credits.
 */

import { Webhooks } from '@dodopayments/nextjs';

import {
  applyPlan,
  claimEvent,
  expireSubscription,
  releaseEvent,
  touchSubscription,
  type SubscriptionSnapshot,
} from '@/lib/billing/sync';
import { sendInvoiceEmail, type PaymentNotice } from '@/lib/billing/send-invoice';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Payload = any;

/** Extrait ce dont on a besoin, sans dependre de la forme complete du payload. */
function snapshot(payload: Payload): SubscriptionSnapshot | null {
  const data = payload?.data;
  const subscriptionId = data?.subscription_id;

  if (typeof subscriptionId !== 'string' || !subscriptionId) return null;

  return {
    subscriptionId,
    productId: String(data?.product_id ?? ''),
    customerId: data?.customer?.customer_id ?? null,
    status: String(data?.status ?? 'active'),
    nextBillingDate: data?.next_billing_date ?? null,
    cancelAtNextBillingDate: Boolean(data?.cancel_at_next_billing_date),
    metadata: data?.metadata ?? null,
  };
}

/**
 * Enveloppe commune : reserve l'evenement, puis agit.
 *
 * `webhook-id` sert de cle de deduplication. Il est relu depuis l'en-tete
 * plutot que depuis le corps, car c'est lui que le prestataire garantit unique
 * par evenement — le corps peut etre identique d'une livraison a l'autre.
 */
function handle(
  type: string,
  action: (snap: SubscriptionSnapshot) => Promise<void>,
) {
  return async (payload: Payload) => {
    const snap = snapshot(payload);
    if (!snap) return;

    const webhookId = payload?.webhookId ?? payload?.['webhook-id'] ?? payload?.id;
    const key =
      typeof webhookId === 'string' && webhookId
        ? webhookId
        : // Repli : la paire evenement + abonnement + horodatage identifie la
          // livraison de facon suffisamment sure pour la deduplication.
          `${type}:${snap.subscriptionId}:${payload?.timestamp ?? ''}`;

    if (!(await claimEvent(key, type, snap.subscriptionId))) return;

    try {
      await action(snap);
    } catch (cause) {
      // La reservation est levee : sans cela l'evenement serait marque comme
      // traite alors qu'il ne l'est pas, et le rejeu serait ignore.
      await releaseEvent(key);
      throw cause;
    }
  };
}

/**
 * Meme enveloppe, pour les evenements de paiement.
 *
 * Le payload d'un paiement n'a pas la forme d'un abonnement : il porte un
 * `payment_id` et un montant, la ou l'autre porte un statut et une echeance.
 */
function handlePayment(type: string, action: (notice: PaymentNotice) => Promise<void>) {
  return async (payload: Payload) => {
    const data = payload?.data;
    const paymentId = data?.payment_id;
    if (typeof paymentId !== 'string' || !paymentId) return;

    const notice: PaymentNotice = {
      paymentId,
      subscriptionId: data?.subscription_id ?? null,
      productId: data?.product_cart?.[0]?.product_id ?? data?.product_id ?? null,
      totalAmount: typeof data?.total_amount === 'number' ? data.total_amount : null,
      currency: data?.currency ?? null,
      customerEmail: data?.customer?.email ?? null,
      customerName: data?.customer?.name ?? null,
      metadata: data?.metadata ?? null,
    };

    const webhookId = payload?.webhookId ?? payload?.['webhook-id'] ?? payload?.id;
    const key =
      typeof webhookId === 'string' && webhookId
        ? webhookId
        : `${type}:${paymentId}:${payload?.timestamp ?? ''}`;

    if (!(await claimEvent(key, type, notice.subscriptionId))) return;

    try {
      await action(notice);
    } catch (cause) {
      await releaseEvent(key);
      throw cause;
    }
  };
}

/*
 * Le handler est construit au premier appel, pas au chargement du module.
 *
 * `Webhooks()` refuse une cle vide en levant immediatement. Construit a
 * l'import, il faisait echouer `next build` sur toute machine ou
 * DODO_WEBHOOK_KEY n'est pas renseignee — un poste de developpement, ou une
 * chaine d'integration. Or un build ne doit jamais exiger un secret de
 * production : il compile du code, il ne se connecte a rien.
 */
let handler: ((req: Request) => Promise<Response>) | null = null;

function webhookHandler() {
  if (handler) return handler;

  const webhookKey = process.env.DODO_WEBHOOK_KEY;
  if (!webhookKey) throw new Error('DODO_WEBHOOK_KEY manquante.');

  handler = buildHandler(webhookKey) as unknown as (req: Request) => Promise<Response>;
  return handler;
}

export async function POST(request: Request): Promise<Response> {
  try {
    return await webhookHandler()(request);
  } catch (cause) {
    /*
     * On repond 500, jamais 200.
     *
     * Un 2xx dit au prestataire « c'est traite » et lui fait abandonner
     * l'evenement pour de bon. Sur une panne de notre cote, on veut au
     * contraire qu'il rejoue.
     */
    console.error('[billing] webhook non traite', cause);
    return Response.json({ error: 'webhook_unavailable' }, { status: 500 });
  }
}

const buildHandler = (webhookKey: string) =>
  Webhooks({
    webhookKey,

    // Ouverture de l'abonnement : le plan prend effet ici, et nulle part avant.
    onSubscriptionActive: handle('subscription.active', async (snap) => {
      await applyPlan(snap);
    }),

    // Changement de palier : nouvelle allocation, compteur remis a zero et
    // periode redemarree — la regle retenue, y compris en descente de gamme.
    onSubscriptionPlanChanged: handle('subscription.plan_changed', async (snap) => {
      await applyPlan(snap);
    }),

    // Renouvellement : on ne touche pas au portefeuille. Voir l'en-tete.
    onSubscriptionRenewed: handle('subscription.renewed', async (snap) => {
      await touchSubscription(snap);
    }),

    /*
     * Annulation : le client garde ce qu'il a paye jusqu'a l'echeance.
     *
     * Couper le jour de la demande produit des litiges et n'avance a rien : la
     * periode est deja reglee. `subscription.expired` fera le retrait, le moment
     * venu.
     */
    onSubscriptionCancelled: handle('subscription.cancelled', async (snap) => {
      await touchSubscription({ ...snap, cancelAtNextBillingDate: true });
    }),

    // Paiement en echec, abonnement suspendu par le prestataire. Le service se
    // degrade de lui-meme quand les credits s'epuisent : rien a retirer ici.
    onSubscriptionOnHold: handle('subscription.on_hold', async (snap) => {
      await touchSubscription(snap);
    }),

    onSubscriptionPaused: handle('subscription.paused', async (snap) => {
      await touchSubscription(snap);
    }),

    // Fin effective : le portefeuille tombe a zero. L'assistant reste installe et
    // continue de recuperer les adresses de ses visiteurs.
    onSubscriptionExpired: handle('subscription.expired', async (snap) => {
      await expireSubscription(snap.subscriptionId);
    }),

    onSubscriptionFailed: handle('subscription.failed', async (snap) => {
      await touchSubscription(snap);
    }),

    /*
     * Facture envoyee depuis l'adresse de Deezy, avec le PDF de Dodo en piece
     * jointe.
     *
     * Sur un evenement distinct de `subscription.active`, et c'est voulu : un
     * incident de messagerie ne doit pas empecher l'attribution du plan, et un
     * envoi rate doit pouvoir etre rejoue sans reappliquer l'abonnement. Les
     * deux evenements ont chacun leur reservation.
     *
     * L'erreur remonte : le rejeu du prestataire est notre seule chance de
     * renvoyer la facture. Une facture perdue en silence est un probleme
     * comptable, pas un incident technique mineur.
     */
    onPaymentSucceeded: handlePayment('payment.succeeded', async (notice) => {
      await sendInvoiceEmail(notice);
    }),
  });
