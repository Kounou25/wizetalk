/**
 * Recherche hybride : vectoriel + lexical, fusionnes en RRF.
 *
 * Pourquoi ne pas se contenter du vectoriel : les embeddings sont mauvais sur
 * les termes exacts — references produit, prix, noms propres, sigles. Or c'est
 * exactement ce que demandent les visiteurs ("le tarif du pack Pro ?").
 * Le lexical rattrape ces cas pour un cout de calcul negligeable.
 *
 * Cette implementation travaille en memoire (prototype). En production, le
 * vectoriel devient un `ORDER BY embedding <=> $1` pgvector et le lexical un
 * `ts_rank` sur tsvector — la fusion RRF, elle, reste identique.
 */

import { embedQuery } from './embeddings';
import type { EmbeddedChunk, Retriever, SearchHit } from './types';

/** Constante standard de la Reciprocal Rank Fusion. */
const RRF_K = 60;

/** Marques diacritiques combinantes, retirees apres normalisation NFD. */
const COMBINING_MARKS = new RegExp('[\u0300-\u036f]', 'g');

const STOPWORDS = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'au', 'aux',
  'ce', 'ces', 'cet', 'cette', 'que', 'qui', 'quoi', 'dont', 'est', 'sont',
  'pour', 'par', 'avec', 'sans', 'sur', 'dans', 'vos', 'vous', 'nos', 'nous',
  'son', 'sa', 'ses', 'leur', 'leurs', 'mon', 'mes', 'plus', 'pas',
  'quel', 'quelle', 'quels', 'quelles', 'etes', 'avez', 'faire',
  'the', 'and', 'for', 'with', 'your', 'what', 'how', 'does', 'you', 'are',
  'this', 'that', 'from', 'can', 'our',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_MARKS, '') // "reference" doit matcher "référence"
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token));
}

export function cosineSimilarity(a: number[], b: number[]): number {
  // Les vecteurs sont deja normalises (voir embeddings.ts) : le produit
  // scalaire suffit.
  let dot = 0;
  const length = Math.min(a.length, b.length);
  for (let i = 0; i < length; i++) dot += (a[i] as number) * (b[i] as number);
  return dot;
}

/** BM25 simplifie sur le corpus du bot. */
function lexicalScores(query: string, chunks: EmbeddedChunk[]): number[] {
  const queryTerms = [...new Set(tokenize(query))];
  if (queryTerms.length === 0) return chunks.map(() => 0);

  const docs = chunks.map((chunk) => tokenize(chunk.content));
  const avgLength = docs.reduce((sum, doc) => sum + doc.length, 0) / (docs.length || 1);

  const docFrequency = new Map<string, number>();
  for (const doc of docs) {
    for (const term of new Set(doc)) {
      docFrequency.set(term, (docFrequency.get(term) ?? 0) + 1);
    }
  }

  const k1 = 1.5;
  const b = 0.75;

  return docs.map((doc) => {
    const counts = new Map<string, number>();
    for (const term of doc) counts.set(term, (counts.get(term) ?? 0) + 1);

    let score = 0;
    for (const term of queryTerms) {
      const tf = counts.get(term) ?? 0;
      if (tf === 0) continue;
      const df = docFrequency.get(term) ?? 0;
      const idf = Math.log(1 + (docs.length - df + 0.5) / (df + 0.5));
      const numerator = tf * (k1 + 1);
      const denominator = tf + k1 * (1 - b + (b * doc.length) / (avgLength || 1));
      score += idf * (numerator / denominator);
    }
    return score;
  });
}

/**
 * index du chunk -> son rang dans ce classement.
 * Rangs a partir de 1, comme row_number() en SQL : les scores RRF restent
 * ainsi directement comparables entre le prototype et la fonction match_chunks.
 */
function rankOrder(scores: number[]): Map<number, number> {
  const ranked = scores
    .map((score, index) => ({ score, index }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return new Map(ranked.map((entry, rank) => [entry.index, rank + 1]));
}

export interface SearchOptions {
  topK: number;
  /** Sous ce seuil de similarite cosinus, on considere n'avoir rien trouve. */
  minCosine: number;
}

/**
 * minCosine mesure sur un premier jeu de tests : une question pertinente
 * remonte vers 0.71, une question hors-sujet vers 0.55. 0.60 se place entre
 * les deux — valeur provisoire, a recalibrer sur de vraies questions
 * clients : trop haut le bot refuse alors qu'il sait, trop bas il brode.
 */
export const DEFAULT_SEARCH_OPTIONS: SearchOptions = {
  topK: 5,
  minCosine: 0.6,
};

export function hybridSearch(
  queryText: string,
  queryVector: number[],
  chunks: EmbeddedChunk[],
  options: Partial<SearchOptions> = {},
): SearchHit[] {
  const opts = { ...DEFAULT_SEARCH_OPTIONS, ...options };
  if (chunks.length === 0) return [];

  const cosines = chunks.map((chunk) => cosineSimilarity(queryVector, chunk.embedding));
  const lexical = lexicalScores(queryText, chunks);

  const vectorRanks = rankOrder(cosines);
  const lexicalRanks = rankOrder(lexical);

  const fused: SearchHit[] = chunks.map((chunk, index) => {
    const vectorRank = vectorRanks.get(index);
    const lexicalRank = lexicalRanks.get(index);
    let score = 0;
    if (vectorRank !== undefined) score += 1 / (RRF_K + vectorRank);
    if (lexicalRank !== undefined) score += 1 / (RRF_K + lexicalRank);
    return {
      id: chunk.id,
      url: chunk.url,
      title: chunk.title,
      content: chunk.content,
      cosine: cosines[index] as number,
      score,
    };
  });

  return fused.sort((a, b) => b.score - a.score).slice(0, opts.topK);
}

/**
 * Recherche en memoire, pour le prototype CLI.
 * L'equivalent serveur est createPgRetriever() dans lib/database.ts.
 */
export function createMemoryRetriever(
  chunks: EmbeddedChunk[],
  options: Partial<SearchOptions> = {},
): Retriever {
  return async (question: string) => {
    const queryVector = await embedQuery(question);
    return hybridSearch(question, queryVector, chunks, options);
  };
}
