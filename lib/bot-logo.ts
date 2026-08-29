/**
 * Logo d'un assistant : formats acceptes, plafond, et adresse publique.
 *
 * Rassemble ici parce que ces valeurs servent a trois endroits qui ne se
 * voient pas — la route qui autorise l'envoi, le controle du navigateur avant
 * l'envoi, et la migration qui borne le seau. Deux copies d'un meme plafond
 * finissent par diverger, et la divergence ne se manifeste qu'au fichier de
 * trop.
 */

export const LOGO_BUCKET = 'bot-logos';

/** 1 Mo : au-dela, c'est une photographie televersee par erreur. */
export const MAX_LOGO_BYTES = 1024 * 1024;

/**
 * Formats acceptes, et leur extension de rangement.
 *
 * PAS DE SVG : un SVG est un document executable, il peut porter du script.
 * Rien ne le justifie pour un logo, et un vectoriel s'exporte en PNG.
 */
export const LOGO_MIME: Record<string, { ext: string }> = {
  'image/png': { ext: 'png' },
  'image/jpeg': { ext: 'jpg' },
  'image/webp': { ext: 'webp' },
};

/** Attribut `accept` du selecteur de fichier, deduit des types acceptes. */
export const LOGO_ACCEPT = '.png,.jpg,.jpeg,.webp';

export function isAcceptedLogoMime(mime: string): boolean {
  return mime in LOGO_MIME;
}

/**
 * Adresse publique d'un logo.
 *
 * Reconstruite a la lecture plutot que stockee : voir le commentaire de la
 * migration 0018. `NEXT_PUBLIC_SUPABASE_URL` est deja expose au navigateur,
 * cette fonction peut donc etre appelee des deux cotes.
 */
export function logoPublicUrl(path: string | null | undefined): string | null {
  if (!path) return null;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;

  return `${base.replace(/\/+$/, '')}/storage/v1/object/public/${LOGO_BUCKET}/${path}`;
}
