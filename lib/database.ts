/**
 * Persistance Postgres + pgvector. Remplace lib/store.ts (JSON) du prototype.
 *
 * Toutes les fonctions prennent le client en parametre plutot que de le creer :
 * l'indexation passe par le client service_role, le dashboard par le client de
 * session soumis au RLS. Le choix reste donc explicite a l'appel.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { embedQuery } from './embeddings';
import { DEFAULT_SEARCH_OPTIONS, type SearchOptions } from './search';
import type { CleanPage, EmbeddedChunk, Retriever, SearchHit } from './types';

export type Db = SupabaseClient;

interface MatchChunkRow {
  id: string;
  url: string;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  cosine: number;
  score: number;
}

/**
 * Recherche hybride cote base : la fonction SQL match_chunks fait le classement
 * vectoriel, le classement plein-texte et la fusion RRF en une seule requete.
 * Pendant du createMemoryRetriever() de lib/search.ts.
 */
export function createPgRetriever(
  db: Db,
  botId: string,
  options: Partial<SearchOptions> = {},
): Retriever {
  const opts = { ...DEFAULT_SEARCH_OPTIONS, ...options };

  return async (question: string): Promise<SearchHit[]> => {
    const queryVector = await embedQuery(question);

    const { data, error } = await db.rpc('match_chunks', {
      p_bot_id: botId,
      // pgvector attend une representation textuelle "[0.1,0.2,...]".
      p_query_embedding: JSON.stringify(queryVector),
      p_query_text: question,
      p_match_count: opts.topK,
    });

    if (error) throw new Error(`Recherche impossible : ${error.message}`);

    return ((data ?? []) as MatchChunkRow[]).map((row) => ({
      id: row.id,
      url: row.url,
      title: row.title,
      content: row.content,
      cosine: row.cosine,
      score: row.score,
    }));
  };
}

/**
 * Insere ou met a jour une page.
 *
 * `changed` vaut false quand le contenu est identique a la derniere analyse :
 * l'appelant saute alors le decoupage et les embeddings. C'est le principal
 * levier de cout a la resynchronisation.
 */
export async function upsertPage(
  db: Db,
  botId: string,
  page: CleanPage,
): Promise<{ id: string; changed: boolean }> {
  const { data: existing, error: selectError } = await db
    .from('pages')
    .select('id, content_hash')
    .eq('bot_id', botId)
    .eq('url', page.url)
    .maybeSingle();

  if (selectError) throw new Error(`Lecture de la page impossible : ${selectError.message}`);

  if (existing && existing.content_hash === page.contentHash) {
    return { id: existing.id as string, changed: false };
  }

  const { data, error } = await db
    .from('pages')
    .upsert(
      {
        bot_id: botId,
        url: page.url,
        title: page.title,
        content: page.text,
        content_hash: page.contentHash,
      },
      { onConflict: 'bot_id,url' },
    )
    .select('id')
    .single();

  if (error) throw new Error(`Écriture de la page impossible : ${error.message}`);
  return { id: data.id as string, changed: true };
}

/** Remplace tous les chunks d'une page (les anciens sont supprimes). */
export async function replaceChunks(
  db: Db,
  botId: string,
  pageId: string,
  chunks: EmbeddedChunk[],
): Promise<void> {
  const { error: deleteError } = await db.from('chunks').delete().eq('page_id', pageId);
  if (deleteError) {
    throw new Error(`Suppression des anciens chunks impossible : ${deleteError.message}`);
  }

  if (chunks.length === 0) return;

  const { error } = await db.from('chunks').insert(
    chunks.map((chunk) => ({
      bot_id: botId,
      page_id: pageId,
      chunk_index: chunk.index,
      content: chunk.content,
      embedding: JSON.stringify(chunk.embedding),
      metadata: { headings: chunk.headings, url: chunk.url, title: chunk.title },
    })),
  );

  if (error) throw new Error(`Écriture des chunks impossible : ${error.message}`);
}

/**
 * Supprime les pages disparues du site depuis la derniere analyse.
 * Les chunks partent en cascade.
 */
export async function deleteStalePages(
  db: Db,
  botId: string,
  keepUrls: string[],
): Promise<number> {
  const { data, error } = await db
    .from('pages')
    .select('id, url')
    .eq('bot_id', botId);

  if (error) throw new Error(`Lecture des pages impossible : ${error.message}`);

  const keep = new Set(keepUrls);
  const stale = (data ?? []).filter((page) => !keep.has(page.url as string));
  if (stale.length === 0) return 0;

  const { error: deleteError } = await db
    .from('pages')
    .delete()
    .in('id', stale.map((page) => page.id as string));

  if (deleteError) throw new Error(`Suppression des pages impossible : ${deleteError.message}`);
  return stale.length;
}

export interface ActivityPoint {
  /** Jour au format ISO (AAAA-MM-JJ). */
  date: string;
  conversations: number;
  messages: number;
}

/**
 * Activite jour par jour sur la periode demandee, tous assistants confondus.
 *
 * Le regroupement se fait cote application : sur les volumes d'un MVP c'est
 * negligeable, et cela evite une fonction SQL de plus. A basculer en agregation
 * SQL le jour ou un compte depasse quelques dizaines de milliers de messages.
 *
 * Les jours sont decoupes en UTC. Un echange de fin de soiree peut donc tomber
 * sur le jour suivant ; sans consequence sur une tendance a 30 jours.
 */
export async function getActivitySeries(db: Db, days = 30): Promise<ActivityPoint[]> {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const [conversations, messages] = await Promise.all([
    db.from('conversations').select('created_at').gte('created_at', start.toISOString()),
    db.from('messages').select('created_at').gte('created_at', start.toISOString()),
  ]);

  const buckets = new Map<string, ActivityPoint>();
  for (let offset = 0; offset < days; offset++) {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + offset);
    const key = day.toISOString().slice(0, 10);
    buckets.set(key, { date: key, conversations: 0, messages: 0 });
  }

  const tally = (rows: { created_at: string }[] | null, key: 'conversations' | 'messages') => {
    for (const row of rows ?? []) {
      const bucket = buckets.get(row.created_at.slice(0, 10));
      if (bucket) bucket[key] += 1;
    }
  };

  tally(conversations.data as { created_at: string }[] | null, 'conversations');
  tally(messages.data as { created_at: string }[] | null, 'messages');

  return [...buckets.values()];
}

export interface BotStats {
  pages: number;
  chunks: number;
  conversations: number;
  /** Prospects encore a traiter. */
  pendingLeads: number;
  /** Reponses ou l'assistant a refuse faute de contenu pertinent. */
  unanswered: number;
}

export async function getBotStats(db: Db, botId: string): Promise<BotStats> {
  const [pages, chunks, conversations, leads, unanswered] = await Promise.all([
    db.from('pages').select('id', { count: 'exact', head: true }).eq('bot_id', botId),
    db.from('chunks').select('id', { count: 'exact', head: true }).eq('bot_id', botId),
    db.from('conversations').select('id', { count: 'exact', head: true }).eq('bot_id', botId),
    db
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('bot_id', botId)
      .eq('status', 'new'),
    // messages n'a pas de bot_id : la jointure interne sur conversations sert
    // uniquement a filtrer, d'ou le !inner.
    db
      .from('messages')
      .select('id, conversations!inner(bot_id)', { count: 'exact', head: true })
      .eq('refused', true)
      .eq('conversations.bot_id', botId),
  ]);

  return {
    pages: pages.count ?? 0,
    chunks: chunks.count ?? 0,
    conversations: conversations.count ?? 0,
    pendingLeads: leads.count ?? 0,
    unanswered: unanswered.count ?? 0,
  };
}
