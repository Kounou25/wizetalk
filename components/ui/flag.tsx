import type { Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';

/**
 * Drapeau d'une langue.
 *
 * DESSINE EN SVG, PAS EN EMOJI
 *
 * Les emoji drapeaux sont des paires d'indicateurs regionaux — 🇫🇷 est
 * techniquement « F » suivi de « R ». Windows n'embarque aucun glyphe pour ces
 * paires : le systeme affiche donc les deux lettres, « FR », au lieu du
 * drapeau. Sur un produit dont une partie des utilisateurs est sous Windows,
 * l'emoji casse pour eux seuls, ce qui est le pire cas — invisible en
 * developpement sur Mac, visible en production.
 *
 * Quinze lignes de SVG s'affichent partout, restent nettes a toute taille et
 * n'ajoutent aucune dependance.
 *
 * L'anneau exterieur n'est pas decoratif : le blanc du drapeau francais et
 * celui de l'Union Jack disparaitraient sinon sur un fond clair.
 */
export function Flag({ locale, className }: { locale: Locale; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'ring-border inline-block h-3 w-4 shrink-0 overflow-hidden rounded-[2px] ring-1',
        className,
      )}
    >
      {locale === 'fr' ? <FranceFlag /> : <UnionJack />}
    </span>
  );
}

function FranceFlag() {
  return (
    <svg viewBox="0 0 60 30" className="block size-full" role="presentation">
      <rect width="20" height="30" fill="#002654" />
      <rect x="20" width="20" height="30" fill="#ffffff" />
      <rect x="40" width="20" height="30" fill="#ED2939" />
    </svg>
  );
}

/**
 * Union Jack simplifie.
 *
 * Les diagonales rouges d'un vrai Union Jack sont decalees dans leur bande
 * blanche — un detail heraldique qui demanderait un `clipPath`, donc un
 * identifiant unique par instance. A seize pixels de large, ce decalage est
 * invisible : les diagonales sont centrees, et le rendu est identique a l'oeil.
 *
 * Les traits qui debordent du viewBox sont rognes par le `<svg>` lui-meme, qui
 * decoupe a son cadre par defaut. Aucun masque n'est donc necessaire.
 */
function UnionJack() {
  return (
    <svg viewBox="0 0 60 30" className="block size-full" role="presentation">
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#ffffff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="2.5" />
      <path d="M30,0 v30 M0,15 h60" stroke="#ffffff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}
