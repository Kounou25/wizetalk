/**
 * Provenance des comptes : capture, lecture, classement.
 *
 * Le principe tient en une phrase : on retient la PREMIERE visite, jamais la
 * derniere. Quelqu'un qui decouvre Deezy par une recherche, revient trois fois
 * en direct, puis s'inscrit, vient de la recherche  l'attribuer au « direct »
 * reviendrait a crediter le canal qui ne fait que le ramener, et a effacer
 * celui qui l'a trouve.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/* Meme convention que lib/quotas.ts : le schema n'est pas genere. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = SupabaseClient<any, any, any>;

/** Ce qu'on retient d'une premiere visite. Aucune donnee identifiante. */
export interface Acquisition {
  /** Domaine referent, sans le chemin. `null` en acces direct. */
  referrer: string | null;
  source: string | null;
  medium: string | null;
  campaign: string | null;
  /** Date de la visite, en ISO. Sert a verifier qu'elle precede l'inscription. */
  at: string;
}

export const ACQ_COOKIE = 'deezy-acq';

/** 30 jours : au-dela, le lien entre une visite et une inscription est douteux. */
export const ACQ_MAX_AGE = 60 * 60 * 24 * 30;

/*
 * Un referent de notre propre domaine n'est pas une provenance : c'est une
 * navigation interne. Le confondre avec une source ferait de Deezy sa
 * propre premiere source de trafic.
 */
function isInternal(host: string, selfHost: string): boolean {
  return host === selfHost || host.endsWith('.' + selfHost);
}

/**
 * Construit la provenance d'une requete d'entree.
 *
 * Renvoie TOUJOURS une provenance, meme entierement vide.
 *
 * Une arrivee sans referent ni campagne n'est pas une absence d'information :
 * c'est l'acces direct, qui est un canal a part entiere  quelqu'un qui tape
 * l'adresse, la retrouve dans ses favoris, ou clique depuis une application.
 * Ne rien ecrire dans ce cas ferait tomber tout ce trafic dans « inconnu », au
 * milieu des comptes crees avant la mesure. Les deux seraient alors
 * indistinguables, alors qu'ils ne disent pas du tout la meme chose.
 */
export function readAcquisition(
  referer: string | null,
  params: URLSearchParams,
  selfHost: string,
): Acquisition {
  const source = params.get('utm_source');
  const medium = params.get('utm_medium');
  const campaign = params.get('utm_campaign');

  let referrer: string | null = null;
  if (referer) {
    try {
      const host = new URL(referer).hostname.replace(/^www\./, '');
      if (!isInternal(host, selfHost.replace(/^www\./, ''))) referrer = host;
    } catch {
      /* referent illisible : on l'ignore plutot que d'inventer un domaine. */
    }
  }

  return {
    referrer,
    source: source?.slice(0, 80) ?? null,
    medium: medium?.slice(0, 80) ?? null,
    campaign: campaign?.slice(0, 120) ?? null,
    at: new Date().toISOString(),
  };
}

export function encodeAcquisition(acq: Acquisition): string {
  return encodeURIComponent(JSON.stringify(acq));
}

export function decodeAcquisition(raw: string | undefined): Acquisition | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<Acquisition>;
    if (typeof parsed.at !== 'string') return null;

    return {
      referrer: typeof parsed.referrer === 'string' ? parsed.referrer : null,
      source: typeof parsed.source === 'string' ? parsed.source : null,
      medium: typeof parsed.medium === 'string' ? parsed.medium : null,
      campaign: typeof parsed.campaign === 'string' ? parsed.campaign : null,
      at: parsed.at,
    };
  } catch {
    // Cookie tronque ou bricole : on prefere aucune provenance a une fausse.
    return null;
  }
}

/*
 * Classement des referents en canaux.
 *
 * Volontairement court : chaque entree doit correspondre a un endroit d'ou
 * vos visiteurs viennent reellement. Une liste exhaustive de moteurs et de
 * reseaux donnerait un tableau plein de lignes a zero, qui cache les trois
 * qui comptent.
 */
const HOSTS: [RegExp, string][] = [
  [/(^|\.)google\./, 'Google'],
  [/(^|\.)bing\./, 'Bing'],
  [/(^|\.)duckduckgo\./, 'DuckDuckGo'],
  [/(^|\.)ecosia\./, 'Ecosia'],
  [/(^|\.)qwant\./, 'Qwant'],
  [/(^|\.)yandex\./, 'Yandex'],
  [/(^|\.)linkedin\.|lnkd\.in/, 'LinkedIn'],
  [/(^|\.)(facebook|fb)\.|fb\.me/, 'Facebook'],
  [/(^|\.)instagram\./, 'Instagram'],
  [/(^|\.)(twitter|x)\.com|t\.co/, 'X'],
  [/(^|\.)reddit\.|redd\.it/, 'Reddit'],
  [/(^|\.)youtube\.|youtu\.be/, 'YouTube'],
  [/(^|\.)tiktok\./, 'TikTok'],
  [/(^|\.)whatsapp\./, 'WhatsApp'],
  [/(^|\.)producthunt\./, 'Product Hunt'],
  [/(^|\.)github\./, 'GitHub'],
];

/** Ce qu'un moteur de recherche met dans utm_medium quand il y en a un. */
const PAID = /^(cpc|ppc|paid|ads?|display|sponsored)$/i;

/** Nom connu d'un domaine ou d'un utm_source, `null` si on ne le reconnait pas. */
function nameOf(value: string): string | null {
  const probe = value.includes('.') ? value : value + '.';
  return HOSTS.find(([pattern]) => pattern.test(probe))?.[1] ?? null;
}

/**
 * Nom lisible du canal d'un compte.
 *
 * L'ordre compte : une campagne explicite l'emporte sur le referent, parce
 * qu'elle a ete posee par vous et decrit une intention, la ou le referent
 * n'est qu'un constat technique.
 */
export function channelOf(acq: {
  referrer: string | null;
  source: string | null;
  medium: string | null;
}): string {
  if (acq.source) {
    // Notre propre widget, sur le site d'un client : c'est la boucle produit.
    if (acq.source === 'widget') return 'Widget Deezy';

    // Les motifs decrivent des domaines (« google. ») ; un utm_source porte le
    // nom nu (« google »). Le point ajoute les fait coincider, ce qui evite
    // d'afficher « google (payant) » a cote de « Google (organique) ».
    const named = nameOf(acq.source);
    const label = named ?? acq.source;
    return PAID.test(acq.medium ?? '') ? `${label} (payant)` : label;
  }

  if (!acq.referrer) return 'Direct';

  const named = nameOf(acq.referrer);
  // Un moteur sans campagne = trafic organique, ce qui merite d'etre dit :
  // c'est la seule ligne qui ne se pilote pas a coups de budget.
  if (named && /Google|Bing|DuckDuckGo|Ecosia|Qwant|Yandex/.test(named)) {
    return `${named} (organique)`;
  }

  return named ?? acq.referrer;
}

/**
 * Rattache la provenance a un compte, une seule fois.
 *
 * LA REGLE QUI REND L'ATTRIBUTION HONNETE
 *
 * On n'ecrit que si la visite PRECEDE la creation du compte. Sans ce
 * controle, un client inscrit il y a six mois qui revient aujourd'hui depuis
 * LinkedIn se verrait attribuer LinkedIn  et le tableau raconterait que vos
 * anciens clients viennent de la ou vos visiteurs passent maintenant.
 *
 * Les comptes crees avant cette mesure restent donc sans provenance. C'est le
 * resultat correct : on ne la connait pas, et l'inventer serait pire que la
 * case vide.
 *
 * `is('acq_at', null)` fait le reste : deux onglets ouverts en meme temps ne
 * peuvent pas ecrire deux fois, et un compte deja attribue n'est jamais
 * reecrit par une visite ulterieure.
 */
export async function recordAcquisitionOnce(
  db: Db,
  userId: string,
  accountCreatedAt: string,
  acq: Acquisition | null,
): Promise<void> {
  if (!acq) return;
  if (new Date(acq.at) > new Date(accountCreatedAt)) return;

  await db
    .from('profiles')
    .update({
      acq_referrer: acq.referrer,
      acq_source: acq.source,
      acq_medium: acq.medium,
      acq_campaign: acq.campaign,
      acq_at: acq.at,
    })
    .eq('user_id', userId)
    .is('acq_at', null);
}
