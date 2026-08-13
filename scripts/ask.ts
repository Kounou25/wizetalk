/**
 * Interrogation d'une base de connaissances indexee.
 *
 *   npm run ask -- --bot=example-com "Quels sont vos services ?"
 *   npm run ask -- --bot=example-com            (mode interactif)
 *   npm run ask -- --bot=example-com --debug "..."  (scores de recherche)
 */

import 'dotenv/config';
import readline from 'node:readline/promises';
import { answerQuestionStream, retrieve } from '../lib/rag';
import { createMemoryRetriever } from '../lib/search';
import { listKnowledgeBases, loadKnowledgeBase } from '../lib/store';
import type { KnowledgeBase, Retriever } from '../lib/types';

const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

function parseArgs(argv: string[]) {
  const flags = new Map(
    argv
      .filter((arg) => arg.startsWith('--'))
      .map((arg) => {
        const [key, value] = arg.slice(2).split('=');
        return [key as string, value ?? 'true'];
      }),
  );
  const question = argv.filter((arg) => !arg.startsWith('--')).join(' ').trim();
  return { botId: flags.get('bot'), debug: flags.has('debug'), question };
}

async function resolveBot(botId: string | undefined): Promise<KnowledgeBase> {
  const available = await listKnowledgeBases();

  if (available.length === 0) {
    throw new Error('Aucune base indexée. Lancez : npm run index -- <url>');
  }
  if (!botId) {
    if (available.length === 1) return loadKnowledgeBase(available[0] as string);
    throw new Error(`Précisez --bot=<id>. Disponibles : ${available.join(', ')}`);
  }
  if (!available.includes(botId)) {
    throw new Error(`Bot "${botId}" introuvable. Disponibles : ${available.join(', ')}`);
  }
  return loadKnowledgeBase(botId);
}

async function ask(retriever: Retriever, question: string, debug: boolean) {
  if (debug) {
    const { hits, topCosine, belowThreshold } = await retrieve(question, retriever);
    console.log(`\n${DIM}--- recherche (cosinus max ${topCosine.toFixed(3)}${belowThreshold ? ', SOUS LE SEUIL' : ''})`);
    for (const [i, hit] of hits.entries()) {
      const preview = hit.content.replace(/\s+/g, ' ').slice(0, 90);
      console.log(`${DIM}  ${i + 1}. cos=${hit.cosine.toFixed(3)} rrf=${hit.score.toFixed(4)}  ${hit.url}`);
      console.log(`${DIM}     ${preview}…${RESET}`);
    }
    console.log('');
  }

  process.stdout.write(`\n${BOLD}`);
  const stream = answerQuestionStream(question, retriever);

  let result = await stream.next();
  while (!result.done) {
    process.stdout.write(result.value);
    result = await stream.next();
  }
  process.stdout.write(`${RESET}\n`);

  const final = result.value;
  if (final.refused) {
    console.log(`${DIM}  (aucun contenu pertinent — cosinus max ${final.topCosine.toFixed(3)})${RESET}`);
  } else if (final.sources.length > 0) {
    console.log(`${DIM}  Sources :${RESET}`);
    for (const source of final.sources) console.log(`${DIM}   • ${source.url}${RESET}`);
  }
  console.log('');
}

async function main() {
  const { botId, debug, question } = parseArgs(process.argv.slice(2));
  const kb = await resolveBot(botId);
  const retriever = createMemoryRetriever(kb.chunks);

  console.log(`\n${kb.botId}  ${DIM}${kb.websiteUrl} — ${kb.pages.length} pages, ${kb.chunks.length} sections${RESET}`);

  if (question) {
    await ask(retriever, question, debug);
    return;
  }

  console.log(`${DIM}Posez vos questions. Ctrl+C pour quitter.${RESET}`);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  for (;;) {
    let input: string;
    try {
      input = (await rl.question('\n> ')).trim();
    } catch {
      break; // stdin fermé : Ctrl+C, ou fin d'une entrée redirigée
    }
    if (!input) continue;
    if (input === 'exit' || input === 'quit') break;
    try {
      await ask(retriever, input, debug);
    } catch (error) {
      console.error('Erreur :', error instanceof Error ? error.message : error);
    }
  }

  rl.close();
}

main().catch((error) => {
  console.error('\n' + (error instanceof Error ? error.message : String(error)) + '\n');
  process.exit(1);
});
