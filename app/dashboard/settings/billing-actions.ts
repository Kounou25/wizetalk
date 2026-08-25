'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { customerPortalLink, startSubscription } from '@/lib/billing/dodo';
import { isPaidPlan, type BillingPeriod } from '@/lib/billing/plans';
import { linkSubscription } from '@/lib/billing/sync';
import { getRequestLocale } from '@/lib/i18n/server';

/**
 * Pays de facturation par defaut.
 *
 * Dodo exige un pays a la creation de l'abonnement, alors que nous n'en
 * demandons jamais a l'inscription. On propose celui que suggere la langue, et
 * le client le corrige sur la page de paiement — c'est elle qui collecte
 * l'adresse de facturation reelle, et elle seule qui fait foi pour la taxe.
 */
const DEFAULT_COUNTRY: Record<string, string> = { fr: 'FR', en: 'US' };

/**
 * Ouvre un abonnement et envoie le client vers la page de paiement de Dodo.
 *
 * Le plan n'est PAS accorde ici. L'abonnement part en statut `pending` ; seul
 * le webhook `subscription.active` lui donne effet. Un client qui abandonne sur
 * la page de paiement, ou qui reviendrait a la main sur l'URL de retour, ne
 * gagne donc rien.
 */
export async function subscribe(formData: FormData): Promise<void> {
  const plan = String(formData.get('plan') ?? '');
  const period = String(formData.get('period') ?? 'monthly') as BillingPeriod;

  if (!isPaidPlan(plan)) redirect('/dashboard/settings?checkout=invalid');
  if (period !== 'monthly' && period !== 'annual') {
    redirect('/dashboard/settings?checkout=invalid');
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) redirect('/login');

  const locale = await getRequestLocale();

  let paymentLink: string;

  try {
    const started = await startSubscription({
      plan,
      period,
      userId: user.id,
      email: user.email,
      name:
        (user.user_metadata?.full_name as string | undefined) ??
        user.email.split('@')[0] ??
        'Client',
      country: DEFAULT_COUNTRY[locale] ?? 'FR',
      locale,
    });

    /*
     * Le rattachement est ecrit AVANT la redirection.
     *
     * C'est ce qui garantit qu'aucun webhook n'arrivera sans destinataire
     * connu : Dodo ne peut pas notifier une activation avant que le client
     * n'ait paye, donc avant cette ligne.
     */
    await linkSubscription(user.id, started.subscriptionId, started.customerId);
    paymentLink = started.paymentLink;
  } catch (cause) {
    console.error('[billing] ouverture d’abonnement impossible', cause);
    redirect('/dashboard/settings?checkout=error');
  }

  // `redirect` leve : il doit rester hors du try, sinon le catch l'intercepte
  // et transforme une redirection normale en erreur.
  redirect(paymentLink);
}

/**
 * Envoie le client vers son portail de gestion Dodo.
 *
 * Annulation, moyen de paiement et factures y sont geres par le prestataire.
 * Les reimplementer demanderait de repliquer une logique de facturation qu'il
 * tient deja a jour, et de la maintenir a chaque evolution de son cote.
 */
export async function openBillingPortal(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('dodo_customer_id')
    .eq('user_id', user.id)
    .maybeSingle();

  const customerId = profile?.dodo_customer_id as string | undefined;
  if (!customerId) redirect('/dashboard/settings?portal=absent');

  let link: string;

  try {
    link = await customerPortalLink(customerId);
  } catch (cause) {
    console.error('[billing] portail indisponible', cause);
    redirect('/dashboard/settings?portal=error');
  }

  redirect(link);
}
