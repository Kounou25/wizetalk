/**
 * Indexation par tranches, contrainte par le serverless.
 *
 * Sur Vercel une invocation est bornee en duree : impossible de crawler
 * 50 pages puis de tout embedder d'un seul appel. Le job porte donc son etat
 * complet en base (file d'attente, pages visitees, phase), et chaque appel a
 * runIndexTick() avance d'un cran. N'importe quel appelant peut relancer un
 * tick : le dashboard pendant qu'il affiche la progression, ou une reprise
 * ulterieure si l'onglet a ete ferme.
 *
 * Deux phases, dans cet ordre :
 *
 *   crawl      recupere et nettoie les pages, les stocke telles quelles
 *      |       (aucun embedding : on ne sait pas encore ce qui est du bruit)
 *      v
 *   embedding  supprime le boilerplate en comparant TOUTES les pages entre
 *              elles, puis decoupe et embedde page par page
 *
 * Cette separation existe uniquement parce que la detection du boilerplate a
 * besoin du corpus entier, alors qu'un tick n'en voit qu'une poignee de pages.
 */

import { chunkPage } from './chunker';
import { cleanPage } from './cleaner';
import { removeBoilerplate } from './boilerplate';
import { extractLinks, normalizeUrl } from './crawler';
import { embedDocuments } from './embeddings';
import { fetchRobots, fetchText, isAllowed, mapLimit } from './http';
import { replaceChunks, upsertPage, type Db } from './database';
import type { CleanPage, EmbeddedChunk, Section } from './types';
import { CREDIT_COST } from './credits';
import { consumeCredits } from './credits-db';

/** Pages recuperees par tick. Compromis duree d'invocation / nombre d'allers-retours. */
export const CRAWL_PAGES_PER_TICK = 5;

/** Pages embeddees par tick. Plus faible : c'est l'etape la plus lente. */
export const EMBED_PAGES_PER_TICK = 3;

const FETCH_CONCURRENCY = 5;

export interface CrawlJob {
  id: string;
  bot_id: string;
  status: 'pending' | 'crawling' | 'embedding' | 'done' | 'error';
  /** URLs restantes pendant le crawl, identifiants de pages pendant l'embedding. */
  queue: string[];
  visited: string[];
  pages_found: number;
  pages_done: number;
  chunks_done: number;
  max_pages: number;
}

export interface TickResult {
  status: CrawlJob['status'];
  pagesFound: number;
  pagesDone: number;
  chunksDone: number;
  done: boolean;
  error?: string;
}

async function loadJob(db: Db, jobId: string): Promise<CrawlJob> {
  const { data, error } = await db
    .from('crawl_jobs')
    .select('id, bot_id, status, queue, visited, pages_found, pages_done, chunks_done, max_pages')
    .eq('id', jobId)
    .single();

  if (error || !data) throw new Error(`Job introuvable : ${error?.message ?? jobId}`);
  return data as unknown as CrawlJob;
}

async function saveJob(db: Db, jobId: string, patch: Record<string, unknown>) {
  const { error } = await db.from('crawl_jobs').update(patch).eq('id', jobId);
  if (error) throw new Error(`Mise à jour du job impossible : ${error.message}`);
}

function toResult(job: CrawlJob, overrides: Partial<TickResult> = {}): TickResult {
  return {
    status: job.status,
    pagesFound: job.pages_found,
    pagesDone: job.pages_done,
    chunksDone: job.chunks_done,
    done: job.status === 'done' || job.status === 'error',
    ...overrides,
  };
}

/**
 * Amorce : robots.txt puis sitemap, sinon on partira des liens de la page
 * d'accueil. Le sitemap evite un crawl a l'aveugle quand il existe.
 */
async function startCrawl(db: Db, job: CrawlJob, websiteUrl: string): Promise<TickResult> {
  const origin = new URL(websiteUrl).origin;
  const start = normalizeUrl(websiteUrl, origin) ?? websiteUrl;

  const robots = await fetchRobots(origin);
  const queue = [start];

  for (const sitemapUrl of [
    ...robots.sitemaps,
    new URL('/sitemap.xml', origin).toString(),
  ]) {
    const res = await fetchText(sitemapUrl, 10_000);
    if (!res.ok || !res.body.includes('<loc')) continue;

    const locs = [...res.body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1] ?? '');
    for (const loc of locs) {
      const normalized = normalizeUrl(loc, origin);
      if (normalized && normalized !== start) queue.push(normalized);
    }
    if (queue.length > 1) break;
  }

  const bounded = queue.slice(0, job.max_pages * 3);
  await saveJob(db, job.id, {
    status: 'crawling',
    queue: bounded,
    pages_found: bounded.length,
  });

  return toResult({ ...job, status: 'crawling', pages_found: bounded.length });
}

/** Une tranche de crawl : recupere, nettoie et stocke jusqu'a CRAWL_PAGES_PER_TICK pages. */
async function crawlTick(
  db: Db,
  job: CrawlJob,
  websiteUrl: string,
): Promise<TickResult> {
  const origin = new URL(websiteUrl).origin;
  const robots = await fetchRobots(origin);

  const visited = new Set(job.visited);
  const queue = job.queue.filter((url) => !visited.has(url));
  const batch: string[] = [];

  while (queue.length > 0 && batch.length < CRAWL_PAGES_PER_TICK) {
    const url = queue.shift() as string;
    if (visited.has(url) || !isAllowed(robots, url)) continue;
    visited.add(url);
    batch.push(url);
  }

  const fetched = await mapLimit(batch, FETCH_CONCURRENCY, async (url) => ({
    url,
    res: await fetchText(url, 15_000),
  }));

  let pagesDone = job.pages_done;

  for (const { url, res } of fetched) {
    if (pagesDone >= job.max_pages) break;
    if (!res.ok || !res.contentType.includes('html')) continue;

    const cleaned = cleanPage(res.body, url);
    if (!cleaned) continue;

    await db.from('pages').upsert(
      {
        bot_id: job.bot_id,
        url: cleaned.url,
        title: cleaned.title,
        content: cleaned.text,
        sections: cleaned.sections,
        content_hash: cleaned.contentHash,
        source: 'website',
      },
      { onConflict: 'bot_id,url' },
    );
    pagesDone++;

    // Sans sitemap, les nouvelles pages viennent des liens rencontres.
    for (const link of extractLinks(res.body, url, origin)) {
      if (!visited.has(link) && !queue.includes(link)) queue.push(link);
    }
  }

  /*
   * Debit de l'exploration.
   *
   * Une seule ecriture pour toute la tranche, plutot qu'une par page : cinq
   * allers-retours supplementaires par tick pour un compteur ne se justifient
   * pas. La contrepartie est qu'un compte a court de credits peut recevoir une
   * derniere tranche gratuite — cinq pages au maximum, ce qui est un cout
   * accepte en echange de la simplicite.
   */
  const stored = pagesDone - job.pages_done;
  let creditsLeft = true;

  if (stored > 0) {
    const debit = await consumeCredits(db, job.bot_id, stored * CREDIT_COST.page);
    creditsLeft = debit.allowed;
  }

  // Credits epuises : on arrete l'exploration ici. Les pages deja lues restent
  // exploitables, l'assistant repond avec ce qu'il a.
  const crawlFinished = !creditsLeft || queue.length === 0 || pagesDone >= job.max_pages;

  if (!crawlFinished) {
    await saveJob(db, job.id, {
      queue,
      visited: [...visited],
      pages_done: pagesDone,
      pages_found: visited.size + queue.length,
    });
    return toResult({ ...job, pages_done: pagesDone, pages_found: visited.size + queue.length });
  }

  // Transition vers l'embedding : c'est ici, et seulement ici, qu'on dispose
  // du corpus complet pour reperer ce qui se repete d'une page a l'autre.
  const pageIds = await stripBoilerplate(db, job.bot_id);

  await saveJob(db, job.id, {
    status: 'embedding',
    queue: pageIds,
    visited: [...visited],
    pages_done: pagesDone,
    pages_found: pagesDone,
  });

  return toResult({ ...job, status: 'embedding', pages_done: pagesDone, pages_found: pagesDone });
}

/**
 * Compare toutes les pages du bot et retire les sections communes
 * (bandeaux, slogans, encarts). Retourne les identifiants a embedder.
 */
async function stripBoilerplate(db: Db, botId: string): Promise<string[]> {
  /*
   * Uniquement les pages du site.
   *
   * removeBoilerplate supprime ce qui se repete sur la moitie des pages. Avec
   * quelques documents importes face a un petit site, un paragraphe legitime
   * de conditions generales franchirait ce seuil et disparaitrait. Les
   * documents n'ont de toute facon pas de bandeaux a nettoyer.
   */
  const { data, error } = await db
    .from('pages')
    .select('id, url, title, content, sections, content_hash')
    .eq('bot_id', botId)
    .eq('source', 'website');

  if (error) throw new Error(`Lecture des pages impossible : ${error.message}`);

  const rows = (data ?? []) as {
    id: string;
    url: string;
    title: string;
    content: string;
    sections: Section[];
    content_hash: string;
  }[];

  const byUrl = new Map(rows.map((row) => [row.url, row.id]));
  const pages: CleanPage[] = rows.map((row) => ({
    url: row.url,
    title: row.title,
    sections: row.sections ?? [],
    text: row.content,
    contentHash: row.content_hash,
  }));

  const { pages: cleaned } = removeBoilerplate(pages);

  for (const page of cleaned) {
    const id = byUrl.get(page.url);
    if (!id) continue;
    await db
      .from('pages')
      .update({
        content: page.text,
        sections: page.sections,
        content_hash: page.contentHash,
      })
      .eq('id', id);
  }

  return cleaned.map((page) => byUrl.get(page.url)).filter((id): id is string => Boolean(id));
}

/** Une tranche d'embedding : decoupe et vectorise jusqu'a EMBED_PAGES_PER_TICK pages. */
async function embedTick(db: Db, job: CrawlJob): Promise<TickResult> {
  const queue = [...job.queue];
  const batch = queue.splice(0, EMBED_PAGES_PER_TICK);

  let chunksDone = job.chunks_done;

  for (const pageId of batch) {
    const { data, error } = await db
      .from('pages')
      .select('id, url, title, content, sections, content_hash')
      .eq('id', pageId)
      .maybeSingle();

    if (error || !data) continue;

    const page: CleanPage = {
      url: data.url as string,
      title: data.title as string,
      sections: (data.sections ?? []) as Section[],
      text: data.content as string,
      contentHash: data.content_hash as string,
    };

    const chunks = chunkPage(page);
    if (chunks.length === 0) continue;

    const vectors = await embedDocuments(chunks.map((chunk) => chunk.content));
    const embedded: EmbeddedChunk[] = chunks.map((chunk, index) => ({
      ...chunk,
      embedding: vectors[index] as number[],
    }));

    await replaceChunks(db, job.bot_id, pageId, embedded);
    chunksDone += embedded.length;
  }

  if (queue.length > 0) {
    await saveJob(db, job.id, { queue, chunks_done: chunksDone });
    return toResult({ ...job, chunks_done: chunksDone });
  }

  await saveJob(db, job.id, {
    status: 'done',
    queue: [],
    chunks_done: chunksDone,
    finished_at: new Date().toISOString(),
  });
  await db
    .from('bots')
    .update({ status: 'ready', last_synced_at: new Date().toISOString() })
    .eq('id', job.bot_id);

  return toResult({ ...job, status: 'done', chunks_done: chunksDone });
}

/**
 * Avance le job d'un cran. Idempotent : rappeler apres un echec reprend
 * simplement la ou l'etat en base s'etait arrete.
 */
export async function runIndexTick(db: Db, jobId: string): Promise<TickResult> {
  // Le chargement du job doit rester en dehors du filet : sans job, on ne peut
  // pas enregistrer l'echec quelque part. L'appelant traduit cette erreur.
  const job = await loadJob(db, jobId);
  if (job.status === 'done' || job.status === 'error') return toResult(job);

  try {
    const { data: bot } = await db
      .from('bots')
      .select('website_url')
      .eq('id', job.bot_id)
      .maybeSingle();

    if (!bot) throw new Error('Assistant introuvable.');
    const websiteUrl = bot.website_url as string;

    if (job.status === 'pending') return await startCrawl(db, job, websiteUrl);
    if (job.status === 'crawling') return await crawlTick(db, job, websiteUrl);
    return await embedTick(db, job);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await saveJob(db, jobId, {
      status: 'error',
      error: message,
      finished_at: new Date().toISOString(),
    });
    await db.from('bots').update({ status: 'error' }).eq('id', job.bot_id);
    return toResult({ ...job, status: 'error' }, { error: message });
  }
}
