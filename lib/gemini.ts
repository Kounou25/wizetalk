/**
 * Client Gemini. Cote serveur uniquement : la cle API ne doit jamais
 * atteindre le navigateur.
 */

import { GoogleGenAI } from '@google/genai';

let client: GoogleGenAI | null = null;

export function gemini(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY manquante. Copiez .env.example vers .env.');
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

/**
 * Les modeles disponibles dependent de la cle API, pas de la documentation :
 * Google ferme les anciens modeles aux nouveaux comptes (gemini-2.5-flash
 * repond deja 404 ici). `npm run models` liste ce qui est reellement accessible.
 */
/**
 * gemini-embedding-001 plutot que gemini-embedding-2 : ce dernier ne traite
 * pas les lots (un seul vecteur rendu pour N textes), ce qui multiplierait
 * par 50 le nombre d'appels a l'indexation.
 */
export const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL ?? 'gemini-embedding-001';

/**
 * gemini-3.5-flash-lite par defaut : suffisant pour restituer une reponse
 * ancree dans un contexte court, et surtout dote d'un quota gratuit
 * exploitable. Attention, gemini-3.6-flash est plafonne a 20 requetes par jour
 * en palier gratuit — de quoi bloquer meme le developpement.
 */
export const CHAT_MODEL = process.env.GEMINI_CHAT_MODEL ?? 'gemini-3.5-flash-lite';

/**
 * 768 dimensions : l'index HNSW de pgvector plafonne a 2000 dimensions,
 * donc le defaut du modele (3072) rendrait l'indexation impossible.
 */
export const EMBEDDING_DIMENSIONS = Number(process.env.EMBEDDING_DIMENSIONS ?? 768);

/** Reessaie sur 429 / 5xx / coupures reseau, avec backoff exponentiel. */
export async function withRetry<T>(fn: () => Promise<T>, attempts = 4): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      const retryable = /429|resource.?exhausted|50\d|unavailable|deadline|fetch failed|ECONN/i.test(
        message,
      );
      if (!retryable || attempt === attempts - 1) throw error;

      const delay = 1000 * 2 ** attempt + Math.random() * 500;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
