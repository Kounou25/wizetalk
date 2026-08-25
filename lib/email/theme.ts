/**
 * Jetons de style des messages sortants.
 *
 * Un e-mail ne peut pas lire de feuille de style : chaque couleur est ecrite
 * en ligne, dans chaque balise. Les rassembler ici est la seule facon d'eviter
 * que deux gabarits derivent l'un de l'autre au fil des retouches.
 *
 * Les couleurs sont en hexadecimal, pas en oklch : aucun client de messagerie
 * ne comprend les espaces colorimetriques modernes.
 */
export const BRAND = '#0069E8';
export const BRAND_SOFT = '#EAF3FF';
export const INK = '#0F172A';
export const TEXT = '#334155';
export const MUTED = '#64748B';
export const LINE = '#E7ECF3';
export const PAGE = '#F1F5F9';

export const FONT = "-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

/** Protege une valeur avant insertion dans le HTML du message. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
