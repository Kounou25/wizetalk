/**
 * Generation des embeddings.
 *
 * Trois details qui changent beaucoup et que l'on rate facilement :
 *  - taskType different a l'indexation (RETRIEVAL_DOCUMENT) et a la recherche
 *    (RETRIEVAL_QUERY) : le modele projette dans un espace asymetrique ;
 *  - re-normalisation obligatoire quand on tronque la dimension sous 3072,
 *    sinon les similarites cosinus sont fausses (gemini-embedding-001 rend
 *    des vecteurs de norme ~0.59 en 768 dimensions) ;
 *  - tous les modeles ne savent pas traiter un lot : gemini-embedding-2 rend
 *    UN vecteur pour N textes, sans lever d'erreur. On le detecte et on
 *    bascule sur des appels unitaires (voir batchingSupported).
 */

import { mapLimit } from './http';
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL, gemini, withRetry } from './gemini';

type TaskType = 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY';

/** L'API accepte davantage, mais des lots courts limitent les 429. */
const BATCH_SIZE = 50;

/** Appels paralleles quand le modele ne sait pas batcher. */
const FALLBACK_CONCURRENCY = 8;

/**
 * Passe a false des qu'un modele renvoie un nombre de vecteurs incoherent.
 * Evite de refaire la decouverte a chaque lot.
 */
let batchingSupported = true;

function normalize(vector: number[]): number[] {
  let sumOfSquares = 0;
  for (const value of vector) sumOfSquares += value * value;
  const norm = Math.sqrt(sumOfSquares);
  // Deja normalise : on ne touche a rien.
  if (norm === 0 || Math.abs(norm - 1) < 1e-6) return vector;
  return vector.map((value) => value / norm);
}

async function callApi(contents: string[], taskType: TaskType): Promise<number[][]> {
  const response = await withRetry(() =>
    gemini().models.embedContent({
      model: EMBEDDING_MODEL,
      contents,
      config: { taskType, outputDimensionality: EMBEDDING_DIMENSIONS },
    }),
  );
  return (response.embeddings ?? []).map((embedding) => normalize(embedding.values ?? []));
}

async function embedOne(text: string, taskType: TaskType): Promise<number[]> {
  const [vector] = await callApi([text], taskType);
  if (!vector || vector.length === 0) throw new Error("Embedding vide renvoye par l'API.");
  return vector;
}

async function embedChunkOfTexts(texts: string[], taskType: TaskType): Promise<number[][]> {
  if (batchingSupported && texts.length > 1) {
    const vectors = await callApi(texts, taskType);
    if (vectors.length === texts.length) return vectors;

    // Le modele a ignore le lot (il a concatene les textes). Bascule definitive
    // sur des appels unitaires : sans ce garde-fou, on indexerait des vecteurs
    // qui ne correspondent a aucun chunk.
    batchingSupported = false;
    console.warn(
      `\n  ⚠ ${EMBEDDING_MODEL} ne traite pas les lots (${vectors.length} vecteurs pour ` +
        `${texts.length} textes)  bascule sur des appels unitaires, indexation plus lente.`,
    );
  }

  return mapLimit(texts, FALLBACK_CONCURRENCY, (text) => embedOne(text, taskType));
}

/** Embeddings des chunks a indexer. */
export async function embedDocuments(
  texts: string[],
  onProgress?: (done: number, total: number) => void,
): Promise<number[][]> {
  const vectors: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    vectors.push(...(await embedChunkOfTexts(batch, 'RETRIEVAL_DOCUMENT')));
    onProgress?.(vectors.length, texts.length);
  }

  if (vectors.length !== texts.length) {
    throw new Error(`${vectors.length} vecteurs generes pour ${texts.length} chunks.`);
  }
  return vectors;
}

/** Embedding d'une question de visiteur. */
export async function embedQuery(text: string): Promise<number[]> {
  return embedOne(text, 'RETRIEVAL_QUERY');
}
