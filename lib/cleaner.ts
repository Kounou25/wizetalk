/**
 * Nettoyage HTML -> texte structure.
 *
 * Strategie : Readability (l'extracteur de Firefox Reader Mode) en premier,
 * car il elimine nav/footer/pub bien mieux qu'une liste de selecteurs.
 * Fallback heuristique cheerio quand Readability echoue (pages courtes,
 * pages de contact, listings...).
 */

import { createHash } from 'node:crypto';
import * as cheerio from 'cheerio';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import type { CleanPage, Section } from './types';

/** Elements qui ne portent jamais d'information utile. */
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
  '.cookie',
  '.cookies',
  '#cookie-banner',
  '.newsletter',
  '.breadcrumb',
  '.breadcrumbs',
  '.sidebar',
  '.menu',
  '.navbar',
  '.social',
  '.share',
  '.advertisement',
  '.ads',
].join(', ');

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
 * Parcourt le HTML nettoye et regroupe le texte par titre.
 * Le fil d'Ariane produit ici est ce qui prefixera chaque chunk.
 */
function buildSections(html: string): Section[] {
  const $ = cheerio.load(html);
  $(NOISE_SELECTORS).remove();

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

/** Voie de secours : Readability a rendu trop peu de contenu. */
function fallbackSections(html: string): Section[] {
  const $ = cheerio.load(html);
  $(NOISE_SELECTORS).remove();
  const main = $('main, article, [role="main"], #content, .content').first();
  const scope = main.length > 0 ? main.html() : $('body').html();
  return scope ? buildSections(scope) : [];
}

export function cleanPage(html: string, url: string): CleanPage | null {
  const title = extractTitle(html, url);

  let sections: Section[] = [];
  try {
    const dom = new JSDOM(html, { url });
    const article = new Readability(dom.window.document).parse();
    if (article?.content) sections = buildSections(article.content);
  } catch {
    // Readability est capricieux sur du HTML casse : on passe au fallback.
  }

  const totalLength = sections.reduce((sum, s) => sum + s.text.length, 0);
  if (totalLength < 200) {
    const fallback = fallbackSections(html);
    const fallbackLength = fallback.reduce((sum, s) => sum + s.text.length, 0);
    if (fallbackLength > totalLength) sections = fallback;
  }

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
