/**
 * Nettoyage HTML -> texte structure.
 *
 * Uniquement cheerio, deliberement : jsdom + Readability ont ete retires.
 *
 *  - Readability tirait `require()` sur un module ES via html-encoding-sniffer,
 *    ce que le runtime serverless refuse — le code marchait en local et cassait
 *    en production.
 *  - Mesure faite sur python.org : cette extraction rend 125 % du texte que
 *    produisait Readability, page par page. On ne perd donc rien.
 *  - Et ~10 Mo de moins dans la fonction serverless.
 */

import { createHash } from 'node:crypto';
import * as cheerio from 'cheerio';
import type { CleanPage, Section } from './types';

/**
 * Elements structurellement hors-contenu.
 *
 * ATTENTION : ne jamais ajouter ici un nom de classe generique. `.menu`,
 * `.content`, `.social` ou `.share` designent du vrai contenu sur quantite de
 * sites — le menu d'un restaurant, une rubrique sociale. Un `.menu` trop
 * gourmand a deja vide 7 491 caracteres de la page /jobs de python.org, soit
 * la page entiere. Le repetitif se traite dans boilerplate.ts, sur preuve
 * (ce qui revient d'une page a l'autre) et non sur un nom.
 */
const NOISE_SELECTORS = [
  'script',
  'style',
  'noscript',
  'iframe',
  'svg',
  'form',
  'nav',
  'header',
  'footer',
  'aside',
  '[role="navigation"]',
  '[role="banner"]',
  '[role="contentinfo"]',
  '[aria-hidden="true"]',
  '.navbar',
  '.breadcrumb',
  '.breadcrumbs',
  '.cookie-banner',
  '.cookie-consent',
  '#cookie-banner',
  '.advertisement',
].join(', ');

/** Conteneurs susceptibles de porter le corps de la page. */
const MAIN_CANDIDATES = 'main, article, [role="main"], #content, #main, .content';

/** Elements porteurs de texte, dans l'ordre du document. */
const BLOCK_SELECTOR = 'h1, h2, h3, h4, p, li, blockquote, pre, td, dd, dt, figcaption';

const HEADING_LEVEL: Record<string, number> = { h1: 0, h2: 1, h3: 2, h4: 3 };

function squash(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function extractTitle(html: string, url: string): string {
  const $ = cheerio.load(html);
  const candidates = [
    $('meta[property="og:title"]').attr('content'),
    $('title').first().text(),
    $('h1').first().text(),
  ];
  for (const candidate of candidates) {
    const clean = squash(candidate ?? '');
    if (clean) {
      // "Nos services | Mon Entreprise" -> on garde la partie specifique
      return clean.split(/\s+[|–—-]\s+/)[0]?.trim() || clean;
    }
  }
  return new URL(url).pathname;
}

/**
 * Choisit le conteneur du corps de page.
 *
 * On retient le candidat le plus fourni, jamais le premier venu : un <main>
 * ou un .content vide ferait sinon perdre toute la page. En deca de 60 % du
 * texte du body, c'est un encart et non le corps.
 */
function pickMainScope($: cheerio.CheerioAPI): string | null {
  let best = $('body');
  let bestLength = squash(best.text()).length;

  $(MAIN_CANDIDATES).each((_, element) => {
    const candidate = $(element);
    const length = squash(candidate.text()).length;
    if (length > bestLength * 0.6 && length > 200) {
      best = candidate;
      bestLength = length;
    }
  });

  return best.html();
}

/**
 * Parcourt le HTML nettoye et regroupe le texte par titre.
 * Le fil d'Ariane produit ici est ce qui prefixera chaque chunk.
 */
function buildSections(html: string): Section[] {
  const $ = cheerio.load(html);

  const sections: Section[] = [];
  const headingStack: string[] = [];
  let buffer: string[] = [];

  const flush = () => {
    const text = buffer.join('\n').trim();
    if (text) sections.push({ headings: [...headingStack], text });
    buffer = [];
  };

  $(BLOCK_SELECTOR).each((_, el) => {
    const tag = (el as { tagName?: string }).tagName?.toLowerCase() ?? '';
    const text = squash($(el).text());
    if (!text) return;

    const level = HEADING_LEVEL[tag];
    if (level !== undefined) {
      flush();
      headingStack.length = level; // on remonte l'arborescence
      headingStack[level] = text;
      return;
    }

    // Les listes gardent leur puce : ca aide le LLM a restituer une enumeration.
    buffer.push(tag === 'li' ? `- ${text}` : text);
  });

  flush();
  return sections.filter((s) => s.text.length >= 20);
}

export function cleanPage(html: string, url: string): CleanPage | null {
  const title = extractTitle(html, url);

  const $ = cheerio.load(html);
  $(NOISE_SELECTORS).remove();

  const scope = pickMainScope($);
  const sections = scope ? buildSections(scope) : [];

  const text = sections
    .map((s) => (s.headings.length ? `${s.headings.join(' > ')}\n${s.text}` : s.text))
    .join('\n\n')
    .trim();

  // Une page de moins de 150 caracteres utiles ne merite pas d'etre indexee.
  if (text.length < 150) return null;

  return {
    url,
    title,
    sections,
    text,
    contentHash: createHash('sha256').update(text).digest('hex'),
  };
}

/**
 * Adresse absolue de l'icone declaree par une page.
 *
 * L'ordre des selecteurs suit la qualite du resultat : `apple-touch-icon` est
 * la plus grande version disponible (180 px en general), `icon` peut etre un
 * SVG ou un PNG de taille variable, `shortcut icon` est la forme historique
 * qu'on rencontre encore sur les sites anciens.
 *
 * Retourne `null` si la page ne declare rien : l'appelant retombera alors sur
 * `/favicon.ico`, que la plupart des serveurs servent encore par convention.
 */
export function extractFaviconUrl(html: string, pageUrl: string): string | null {
  const $ = cheerio.load(html);

  const selectors = [
    'link[rel="apple-touch-icon"]',
    'link[rel="icon"]',
    'link[rel="shortcut icon"]',
    'link[rel="apple-touch-icon-precomposed"]',
  ];

  for (const selector of selectors) {
    const href = $(selector).attr('href')?.trim();
    if (!href) continue;

    /*
     * Les icones en `data:` sont rejetees : elles peuvent peser plusieurs
     * dizaines de kilo-octets, et on les recopierait dans chaque ligne de
     * chaque liste d'assistants.
     */
    if (href.startsWith('data:')) continue;

    try {
      const absolute = new URL(href, pageUrl);
      // Seuls http(s) : un `javascript:` ou un `file:` n'a rien a faire dans
      // un attribut src rendu par le navigateur du proprietaire.
      if (absolute.protocol !== 'http:' && absolute.protocol !== 'https:') continue;
      return absolute.toString();
    } catch {
      // href malforme : on tente le selecteur suivant.
    }
  }

  return null;
}
