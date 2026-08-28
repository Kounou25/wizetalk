/**
 * Verification de l'environnement : cle API, modeles, dimensions.
 *
 *   npm run check
 *
 * Deux appels minuscules a Gemini. A lancer avant toute indexation :
 * ca evite de decouvrir une cle invalide apres 50 pages crawlees.
 */

import 'dotenv/config';
import { ThinkingLevel } from '@google/genai';
import { CHAT_MODEL, EMBEDDING_DIMENSIONS, EMBEDDING_MODEL, gemini } from '../lib/gemini';
import { embedQuery } from '../lib/embeddings';
import { cosineSimilarity } from '../lib/search';

const OK = '\x1b[32m✓\x1b[0m';
const KO = '\x1b[31m✗\x1b[0m';

async function main() {
  let failed = false;

  // --- Cle API ------------------------------------------------------------
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.log(`${KO} GEMINI_API_KEY absente  copiez .env.example vers .env`);
    process.exit(1);
  }
  console.log(`${OK} GEMINI_API_KEY présente (${key.slice(0, 6)}…, ${key.length} caractères)`);

  // --- Embeddings ---------------------------------------------------------
  try {
    const started = Date.now();
    const vector = await embedQuery('Quels sont vos services ?');
    const elapsed = Date.now() - started;

    if (vector.length !== EMBEDDING_DIMENSIONS) {
      console.log(`${KO} ${EMBEDDING_MODEL} → ${vector.length} dimensions, ${EMBEDDING_DIMENSIONS} attendues`);
      failed = true;
    } else {
      const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
      console.log(`${OK} ${EMBEDDING_MODEL} → ${vector.length} dimensions, norme ${norm.toFixed(4)} (${elapsed} ms)`);
      // Une norme differente de 1 signifie que la re-normalisation n'a pas eu lieu :
      // toutes les similarites cosinus seraient alors fausses.
      if (Math.abs(norm - 1) > 0.01) {
        console.log(`${KO} vecteur non normalisé  les scores de similarité seraient faussés`);
        failed = true;
      }
    }

    // Controle de bon sens : proche doit scorer plus haut que hors-sujet.
    const related = await embedQuery('Que proposez-vous comme prestations ?');
    const unrelated = await embedQuery('recette de la tarte aux pommes');
    const scoreRelated = cosineSimilarity(vector, related);
    const scoreUnrelated = cosineSimilarity(vector, unrelated);

    if (scoreRelated > scoreUnrelated) {
      console.log(`${OK} sémantique cohérente (proche ${scoreRelated.toFixed(3)} > hors-sujet ${scoreUnrelated.toFixed(3)})`);
    } else {
      console.log(`${KO} sémantique incohérente (proche ${scoreRelated.toFixed(3)} ≤ hors-sujet ${scoreUnrelated.toFixed(3)})`);
      failed = true;
    }
  } catch (error) {
    console.log(`${KO} embeddings : ${error instanceof Error ? error.message : error}`);
    failed = true;
  }

  // --- Generation ---------------------------------------------------------
  try {
    const started = Date.now();
    const response = await gemini().models.generateContent({
      model: CHAT_MODEL,
      contents: 'Réponds exactement par le mot : OK',
      config: {
        temperature: 0,
        maxOutputTokens: 2000,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });
    const elapsed = Date.now() - started;
    const text = response.text?.trim() ?? '';

    if (text) {
      console.log(`${OK} ${CHAT_MODEL} → "${text}" (${elapsed} ms)`);
    } else {
      console.log(`${KO} ${CHAT_MODEL} n'a rien renvoyé`);
      failed = true;
    }
  } catch (error) {
    console.log(`${KO} génération : ${error instanceof Error ? error.message : error}`);
    failed = true;
  }

  console.log(failed ? '\nConfiguration incomplète.\n' : '\nEnvironnement prêt.\n');
  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
