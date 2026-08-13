/**
 * Liste les modeles Gemini accessibles avec la cle courante.
 *
 *   npm run models
 *
 * Utile car Google retire regulierement d'anciens modeles pour les
 * nouveaux comptes : la liste depend de la cle, pas de la documentation.
 */

import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY manquante.');
    process.exit(1);
  }

  const pager = await new GoogleGenAI({ apiKey }).models.list();

  const generation: string[] = [];
  const embedding: string[] = [];

  for await (const model of pager) {
    const name = (model.name ?? '').replace(/^models\//, '');
    const actions = model.supportedActions ?? [];
    if (actions.includes('embedContent')) embedding.push(name);
    if (actions.includes('generateContent')) generation.push(name);
  }

  console.log('\nGénération (GEMINI_CHAT_MODEL) :');
  for (const name of generation.sort()) console.log(`  ${name}`);

  console.log('\nEmbeddings (GEMINI_EMBEDDING_MODEL) :');
  for (const name of embedding.sort()) console.log(`  ${name}`);
  console.log('');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
