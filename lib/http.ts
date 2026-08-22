/** Utilitaires reseau : fetch avec timeout, robots.txt, concurrence bornee. */

export const USER_AGENT =
  'Mozilla/5.0 (compatible; DeezyBot/0.1; +https://deezy.app/bot)';

const MAX_BYTES = 2_000_000; // 2 Mo : au-dela, ce n'est pas une page de contenu

export interface FetchResult {
  ok: boolean;
  status: number;
  /** URL apres redirections : indispensable pour la deduplication. */
  finalUrl: string;
  contentType: string;
  body: string;
}

export async function fetchText(url: string, timeoutMs = 15_000): Promise<FetchResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr,en;q=0.8',
      },
    });

    const contentType = res.headers.get('content-type') ?? '';
    const length = Number(res.headers.get('content-length') ?? 0);
    if (length > MAX_BYTES) {
      return { ok: false, status: res.status, finalUrl: res.url, contentType, body: '' };
    }

    const body = await res.text();
    return {
      ok: res.ok,
      status: res.status,
      finalUrl: res.url || url,
      contentType,
      body: body.length > MAX_BYTES ? body.slice(0, MAX_BYTES) : body,
    };
  } catch {
    return { ok: false, status: 0, finalUrl: url, contentType: '', body: '' };
  } finally {
    clearTimeout(timer);
  }
}

/** robots.txt reduit a ce dont on a besoin : les regles Disallow et les sitemaps. */
export interface Robots {
  disallow: string[];
  sitemaps: string[];
}

export async function fetchRobots(origin: string): Promise<Robots> {
  const res = await fetchText(new URL('/robots.txt', origin).toString(), 8000);
  const robots: Robots = { disallow: [], sitemaps: [] };
  if (!res.ok) return robots;

  // On ne retient que les groupes qui nous concernent : "*" et notre propre agent.
  let applies = false;
  for (const raw of res.body.split('\n')) {
    const line = raw.split('#')[0]?.trim() ?? '';
    if (!line) continue;
    const sep = line.indexOf(':');
    if (sep === -1) continue;

    const field = line.slice(0, sep).trim().toLowerCase();
    const value = line.slice(sep + 1).trim();

    if (field === 'user-agent') {
      applies = value === '*' || value.toLowerCase().includes('deezy');
    } else if (field === 'disallow' && applies && value) {
      robots.disallow.push(value);
    } else if (field === 'sitemap' && value) {
      robots.sitemaps.push(value);
    }
  }
  return robots;
}

export function isAllowed(robots: Robots, url: string): boolean {
  const path = new URL(url).pathname;
  return !robots.disallow.some((rule) => path.startsWith(rule));
}

/** map avec concurrence bornee : evite d'assommer le site du client. */
export async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i] as T, i);
    }
  });

  await Promise.all(workers);
  return results;
}
