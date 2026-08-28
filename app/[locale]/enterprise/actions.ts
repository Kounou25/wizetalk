'use server';

import { cookies } from 'next/headers';
import { after } from 'next/server';
import { z } from 'zod';

import { ACQ_COOKIE, decodeAcquisition } from '@/lib/acquisition';
import { sendDemoAlert } from '@/lib/email/send-demo-alert';
import { getDictionary, isLocale, DEFAULT_LOCALE } from '@/lib/i18n';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Depot d'une demande de demonstration ou de contact commercial.
 *
 * UNE SERVER ACTION, PAS UNE ROUTE API
 *
 * /api/lead est une route parce qu'elle est appelee depuis les sites de nos
 * clients : elle doit gerer CORS, verifier l'origine, et vivre hors du proxy.
 * Ce formulaire-ci n'est poste que depuis notre propre page. Une action lui
 * evite la mecanique CORS, lui donne la protection anti-CSRF de Next, et
 * permet au bouton de connaitre son etat d'envoi sans etat remonte a la page.
 *
 * ELLE NE LEVE JAMAIS D'EXCEPTION VISIBLE
 *
 * Une demande commerciale perdue ne se rejoue pas : le visiteur ne remplira
 * pas le formulaire une seconde fois. Chaque sortie renvoie donc un etat, et
 * l'adresse de secours figure dans le message d'erreur  si notre base tombe,
 * il reste un e-mail a ecrire.
 */

/** Ce que le formulaire rend au client. */
export interface DemoRequestState {
  ok?: boolean;
  /** Panne d'enregistrement : rien a corriger cote visiteur. */
  error?: string;
  /**
   * Erreurs de saisie, par nom de champ.
   *
   * Un message global obligeait le visiteur a relire les six champs pour
   * deviner lequel coincait. Ici l'erreur s'affiche sous le champ fautif, et
   * `aria-invalid` la rend audible pour un lecteur d'ecran.
   */
  fieldErrors?: Partial<Record<'fullName' | 'email' | 'company', string>>;
}

const INDUSTRIES = [
  'banking',
  'insurance',
  'telecom',
  'education',
  'healthcare',
  'public',
  'retail',
  'other',
] as const;

/**
 * Le schema est construit par requete, pas au chargement du module.
 *
 * Les messages viennent du dictionnaire : ils doivent donc etre resolus dans
 * la langue de la page, que seul l'appel connait. Un schema fige au niveau du
 * module renverrait un message francais a un visiteur anglophone.
 */
function schemaFor(t: {
  errorName: string;
  errorEmail: string;
  errorCompany: string;
}) {
  return z.object({
    intent: z.enum(['demo', 'contact']).catch('demo'),
    fullName: z.string().trim().min(2, t.errorName).max(120, t.errorName),
    email: z.email(t.errorEmail).max(200, t.errorEmail),
    company: z.string().trim().min(2, t.errorCompany).max(160, t.errorCompany),
    /* Le site est facultatif, et volontairement pas contraint a une URL : on
       recoit « banque-exemple.com » aussi souvent que l'adresse complete, et
       refuser la premiere forme ferait perdre la demande pour un slash. */
    website: z.string().trim().max(200).optional(),
    industry: z.enum(INDUSTRIES).optional(),
    message: z.string().trim().max(4000).optional(),
  });
}

/**
 * Delai minimal entre l'affichage du formulaire et son envoi.
 *
 * Un humain qui remplit six champs met plus de trois secondes ; un robot qui
 * poste le formulaire des qu'il l'a lu en met zero. C'est un filtre grossier,
 * volontairement : il ne coute rien, n'ajoute aucun captcha a franchir pour le
 * visiteur, et se combine avec le champ leurre ci-dessous.
 */
const MIN_FILL_MS = 3_000;

export async function submitDemoRequest(
  _prev: DemoRequestState,
  formData: FormData,
): Promise<DemoRequestState> {
  const rawLocale = String(formData.get('locale') ?? '');
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = getDictionary(locale).enterprise.form;

  /*
   * Champ leurre et delai : les deux repondent « c'est envoye ».
   *
   * Renvoyer une erreur apprendrait au robot ce qui l'a trahi, et il
   * reessaierait sans le champ. Une fausse confirmation le fait passer a la
   * cible suivante, en croyant avoir reussi.
   */
  if (String(formData.get('company_size') ?? '').trim() !== '') {
    return { ok: true };
  }

  const startedAt = Number(formData.get('startedAt') ?? 0);
  if (startedAt > 0 && Date.now() - startedAt < MIN_FILL_MS) {
    return { ok: true };
  }

  const parsed = schemaFor(t).safeParse({
    intent: String(formData.get('intent') ?? 'demo'),
    fullName: String(formData.get('fullName') ?? ''),
    email: String(formData.get('email') ?? ''),
    company: String(formData.get('company') ?? ''),
    website: String(formData.get('website') ?? '') || undefined,
    industry: String(formData.get('industry') ?? '') || undefined,
    message: String(formData.get('message') ?? '') || undefined,
  });

  if (!parsed.success) {
    // Une seule erreur par champ : la premiere suffit a corriger la saisie.
    const fieldErrors: DemoRequestState['fieldErrors'] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === 'fullName' || field === 'email' || field === 'company') {
        fieldErrors[field] ??= issue.message;
      }
    }

    // Un echec qui ne porte sur aucun champ affichable (intent bricole, champ
    // hors schema) n'a rien a montrer sous un libelle : il repart en global.
    return Object.keys(fieldErrors).length > 0
      ? { fieldErrors }
      : { error: t.errorGeneric };
  }

  const data = parsed.data;
  const db = createAdminClient();

  /*
   * Anti-doublon, meme regle que la capture de prospects : une meme adresse
   * dans l'heure ne cree pas de seconde ligne. Quelqu'un qui renvoie le
   * formulaire parce qu'il doute de l'avoir envoye ne doit pas apparaitre
   * deux fois dans la liste commerciale  et doit tout de meme voir une
   * confirmation.
   */
  const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString();
  const { data: recent } = await db
    .from('demo_requests')
    .select('id')
    .eq('email', data.email)
    .gte('created_at', oneHourAgo)
    .maybeSingle();

  if (recent) return { ok: true };

  // Provenance de la premiere visite, posee par le proxy sur toute entree.
  const acq = decodeAcquisition((await cookies()).get(ACQ_COOKIE)?.value);

  const { error } = await db.from('demo_requests').insert({
    intent: data.intent,
    full_name: data.fullName,
    email: data.email,
    company: data.company,
    website: data.website ?? null,
    industry: data.industry ?? null,
    message: data.message ?? null,
    locale,
    acq_referrer: acq?.referrer ?? null,
    acq_source: acq?.source ?? null,
    acq_medium: acq?.medium ?? null,
    acq_campaign: acq?.campaign ?? null,
    acq_at: acq?.at ?? null,
  });

  if (error) {
    console.error('[enterprise] demande non enregistree', error);
    return { error: t.errorGeneric };
  }

  /*
   * L'alerte part APRES la reponse.
   *
   * Meme raison que pour les prospects du widget : le visiteur n'attend pas le
   * serveur de messagerie, et un incident SMTP ne peut pas transformer une
   * demande enregistree en erreur affichee. La donnee est en base, c'est
   * l'essentiel ; l'alerte est un confort.
   */
  after(() =>
    sendDemoAlert({
      intent: data.intent,
      fullName: data.fullName,
      email: data.email,
      company: data.company,
      website: data.website ?? null,
      industry: data.industry ?? null,
      message: data.message ?? null,
      locale,
    }),
  );

  return { ok: true };
}
