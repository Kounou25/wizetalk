/**
 * Crawler HTTP simple : fetch + parsing HTML, sans navigateur headless.
 *
 * Choix assume pour le MVP : la cible (sites vitrines d'entreprise) est
 * quasi toujours rendue cote serveur. Un fetch coute ~50 ms la ou Playwright
 * coute ~3 s et 300 Mo de binaire  incompatible avec le serverless.
 * Un fallback Playwright pourra etre ajoute pour les SPA (voir needsJavaScript).
 */

import * as cheerio from 'cheerio';
import { fetchRobots, fetchText, isAllowed, mapLimit, type Robots } from './http';
import type { CrawledPage } from './types';

export interface CrawlOptions {
  maxPages: number;
  concurrency: number;
  timeoutMs: number;
  respectRobots: boolean;
  onProgress?: (event: CrawlProgress) => void;
}

export interface CrawlProgress {
  found: number;
  done: number;
  url: string;
  status: 'ok' | 'skipped' | 'error';
}

export const DEFAULT_CRAWL_OPTIONS: CrawlOptions = {
  maxPages: 50,
  concurrency: 5,
  timeoutMs: 15_000,
  respectRobots: true,
};

/** Extensions qui ne contiennent jamais de contenu textuel exploitable. */
const SKIP_EXTENSIONS =
  /\.(pdf|zip|rar|7z|gz|tar|docx?|xlsx?|pptx?|jpe?g|png|gif|webp|avif|svg|ico|bmp|mp[34]|wav|avi|mov|webm|css|js|json|xml|rss|woff2?|ttf|eot)$/i;

/** Chemins sans interet pour une base de connaissances (et souvent infinis). */
const SKIP_PATHS = [
  '/wp-admin',
  '/wp-login',
  '/wp-json',
  '/xmlrpc.php',
  '/cdn-cgi/',
  '/feed',
  '/cart',
  '/panier',
  '/checkout',
  '/commande',
  '/login',
  '/connexion',
  '/signin',
  '/signup',
  '/inscription',
  '/logout',
  '/deconnexion',
  '/my-account',
  '/mon-compte',
  '/admin',
];

/** Parametres de tracking : les retirer evite de crawler 10 fois la meme page. */
const TRACKING_PARAMS =
  /^(utm_|fbclid|gclid|msclkid|mc_cid|mc_eid|_ga|ref|referrer|source)/i;

/**
 * Normalise une URL pour la deduplication.
 * Retourne null si l'URL doit etre ignoree (autre domaine, extension binaire, etc.).
 */
export function normalizeUrl(raw: string, origin: string): string | null {
  let url: URL;
  try {
    url = new URL(raw, origin);
  } catch {
    return null;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

  // Meme domaine uniquement : on ignore facebook.com, instagram.com, etc.
  const base = new URL(origin);
  if (url.hostname.replace(/^www\./, '') !== base.hostname.replace(/^www\./, '')) {
    return null;
  }

  if (SKIP_EXTENSIONS.test(url.pathname)) return null;
  const lowerPath = url.pathname.toLowerCase();
  if (SKIP_PATHS.some((p) => lowerPath.startsWith(p))) return null;

  url.hash = '';
  for (const key of [...url.searchParams.keys()]) {
    if (TRACKING_PARAMS.test(key)) url.searchParams.delete(key);
  }
  url.searchParams.sort();

  // Trailing slash : /about et /about/ sont la meme page
  if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1);
  }

  return url.toString();
}

/** Recupere les URLs declarees dans un sitemap (gere les index de sitemaps). */
async function readSitemap(
  sitemapUrl: string,
  origin: string,
  depth = 0,
): Promise<string[]> {
  if (depth > 2) return [];

  const res = await fetchText(sitemapUrl, 10_000);
  if (!res.ok || !res.body.includes('<')) return [];

  const $ = cheerio.load(res.body, { xmlMode: true });
  const urls: string[] = [];

  // Index de sitemaps -> on descend d'un niveau
  const nested = $('sitemapindex > sitemap > loc')
    .map((_, el) => $(el).text().trim())
    .get()
    .slice(0, 10);

  for (const child of nested) {
    urls.push(...(await readSitemap(child, origin, depth + 1)));
  }

  $('urlset > url > loc').each((_, el) => {
    const normalized = normalizeUrl($(el).text().trim(), origin);
    if (normalized) urls.push(normalized);
  });

  return urls;
}

/** Cherche un sitemap aux emplacements habituels + ceux declares dans robots.txt. */
async function discoverFromSitemaps(origin: string, robots: Robots): Promise<string[]> {
  const candidates = [
    ...robots.sitemaps,
    new URL('/sitemap.xml', origin).toString(),
    new URL('/sitemap_index.xml', origin).toString(),
  ];

  const seen = new Set<string>();
  for (const candidate of candidates) {
    const urls = await readSitemap(candidate, origin);
    for (const url of urls) seen.add(url);
    if (seen.size > 0) break; // un sitemap valide suffit
  }
  return [...seen];
}

/** Extrait les liens internes d'une page. */
export function extractLinks(html: string, pageUrl: string, origin: string): string[] {
  const $ = cheerio.load(html);
  const links = new Set<string>();

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return;
    }
    let absolute: string;
    try {
      absolute = new URL(href, pageUrl).toString();
    } catch {
      return;
    }
    const normalized = normalizeUrl(absolute, origin);
    if (normalized) links.add(normalized);
  });

  return [...links];
}

/**
 * Heuristique : la page a-t-elle besoin d'un rendu JavaScript ?
 * Sert a signaler les sites ou un fallback Playwright sera necessaire.
 */
export function needsJavaScript(html: string): boolean {
  const $ = cheerio.load(html);
  $('script, style, noscript').remove();
  const textLength = $('body').text().replace(/\s+/g, ' ').trim().length;
  const hasAppRoot = /<div[^>]+id=["'](root|app|__next|__nuxt)["']/i.test(html);
  return textLength < 500 && hasAppRoot;
}

export interface CrawlResult {
  pages: CrawledPage[];
  /** Sites detectes comme SPA : le contenu recupere sera probablement vide. */
  jsWarning: boolean;
  discoveredVia: 'sitemap' | 'links';
}

export async function crawlSite(
  startUrl: string,
  options: Partial<CrawlOptions> = {},
): Promise<CrawlResult> {
  const opts = { ...DEFAULT_CRAWL_OPTIONS, ...options };
  const origin = new URL(startUrl).origin;
  const start = normalizeUrl(startUrl, origin) ?? startUrl;

  const robots = opts.respectRobots
    ? await fetchRobots(origin)
    : { disallow: [], sitemaps: [] };

  // 1. Le sitemap donne la liste des pages instantanement quand il existe.
  const sitemapUrls = await discoverFromSitemaps(origin, robots);
  const discoveredVia = sitemapUrls.length > 0 ? 'sitemap' : 'links';

  const visited = new Set<string>();
  const queue: string[] = [start, ...sitemapUrls.filter((u) => u !== start)];
  const pages: CrawledPage[] = [];
  let jsWarning = false;

  // 2. BFS par vagues, avec concurrence bornee.
  while (queue.length > 0 && pages.length < opts.maxPages) {
    const batch: string[] = [];
    while (queue.length > 0 && batch.length < opts.concurrency) {
      const url = queue.shift() as string;
      if (visited.has(url)) continue;
      if (opts.respectRobots && !isAllowed(robots, url)) {
        opts.onProgress?.({ found: visited.size + queue.length, done: pages.length, url, status: 'skipped' });
        continue;
      }
      visited.add(url);
      batch.push(url);
    }
    if (batch.length === 0) continue;

    const results = await mapLimit(batch, opts.concurrency, async (url) => {
      const res = await fetchText(url, opts.timeoutMs);
      return { url, res };
    });

    for (const { url, res } of results) {
      if (pages.length >= opts.maxPages) break;

      if (!res.ok || !res.contentType.includes('html') || res.body.length < 200) {
        opts.onProgress?.({ found: visited.size + queue.length, done: pages.length, url, status: 'error' });
        continue;
      }

      // Une redirection peut nous ramener sur une page deja traitee.
      const finalUrl = normalizeUrl(res.finalUrl, origin) ?? url;
      if (finalUrl !== url && visited.has(finalUrl)) continue;
      visited.add(finalUrl);

      if (needsJavaScript(res.body)) jsWarning = true;

      pages.push({ url: finalUrl, html: res.body });
      opts.onProgress?.({ found: visited.size + queue.length, done: pages.length, url: finalUrl, status: 'ok' });

      // Sans sitemap, on decouvre les pages en suivant les liens.
      if (discoveredVia === 'links') {
        for (const link of extractLinks(res.body, finalUrl, origin)) {
          if (!visited.has(link)) queue.push(link);
        }
      }
    }
  }

  return { pages, jsWarning, discoveredVia };
}
