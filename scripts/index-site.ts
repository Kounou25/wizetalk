/**
 * Indexation d'un site : URL -> crawl -> nettoyage -> chunks -> embeddings.
 *
 *   npm run index -- https://example.com
 *   npm run index -- https://example.com --max=20 --bot=mon-client
 */

import 'dotenv/config';
import { crawlSite } from '../lib/crawler';
import { cleanPage } from '../lib/cleaner';
import { removeBoilerplate } from '../lib/boilerplate';
import { chunkPage } from '../lib/chunker';
import { embedDocuments } from '../lib/embeddings';
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL } from '../lib/gemini';
import { saveKnowledgeBase, slugify } from '../lib/store';
import type { Chunk, CleanPage, EmbeddedChunk, KnowledgeBase } from '../lib/types';

function parseArgs(argv: string[]) {
  const positional = argv.filter((arg) => !arg.startsWith('--'));
  const flags = new Map(
    argv
      .filter((arg) => arg.startsWith('--'))
      .map((arg) => {
        const [key, value] = arg.slice(2).split('=');
        return [key as string, value ?? 'true'];
      }),
  );

  return {
    url: positional[0],
    maxPages: Number(flags.get('max') ?? 50),
    botId: flags.get('bot'),
  };
}

function line(text: string) {
  process.stdout.write(`\r\x1b[K${text}`);
}

async function main() {
  const { url, maxPages, botId: botIdFlag } = parseArgs(process.argv.slice(2));

  if (!url) {
    console.error('Usage: npm run index -- <url> [--max=50] [--bot=slug]');
    process.exit(1);
  }

  let startUrl: string;
  try {
    startUrl = new URL(url.startsWith('http') ? url : `https://${url}`).toString();
  } catch {
    console.error(`URL invalide : ${url}`);
    process.exit(1);
  }

  const botId = botIdFlag ?? slugify(startUrl);
  const startedAt = Date.now();

  console.log(`\nSite      ${startUrl}`);
  console.log(`Bot       ${botId}`);
  console.log(`Limite    ${maxPages} pages\n`);

  // --- 1. Crawl -----------------------------------------------------------
  console.log('1/4  Exploration du site');
  const { pages: crawled, jsWarning, discoveredVia } = await crawlSite(startUrl, {
    maxPages,
    onProgress: (event) => {
      if (event.status === 'ok') {
        line(`     ${event.done}/${maxPages} pages   ${event.url.slice(0, 70)}`);
      }
    },
  });
  line(`     ${crawled.length} pages récupérées (via ${discoveredVia})\n`);

  if (crawled.length === 0) {
    console.error('\nAucune page récupérée. Site injoignable, ou bloqué par robots.txt.');
    process.exit(1);
  }
  if (jsWarning) {
    console.log('     ⚠ Site probablement rendu en JavaScript : contenu partiel attendu.');
    console.log('       (c\'est le cas qui justifiera un fallback Playwright)');
  }

  // --- 2. Nettoyage -------------------------------------------------------
  console.log('\n2/4  Extraction du contenu');
  const extracted: CleanPage[] = [];
  const seenHashes = new Set<string>();
  let skippedEmpty = 0;
  let skippedDuplicate = 0;

  for (const page of crawled) {
    const cleaned = cleanPage(page.html, page.url);
    if (!cleaned) {
      skippedEmpty++;
      continue;
    }
    // Beaucoup de sites servent la meme page sous plusieurs URLs.
    if (seenHashes.has(cleaned.contentHash)) {
      skippedDuplicate++;
      continue;
    }
    seenHashes.add(cleaned.contentHash);
    extracted.push(cleaned);
  }

  console.log(`     ${extracted.length} pages avec du contenu exploitable`);
  if (skippedEmpty) console.log(`     ${skippedEmpty} ignorées (vides ou trop courtes)`);
  if (skippedDuplicate) console.log(`     ${skippedDuplicate} ignorées (doublons)`);

  // Retire ce qui se répète d'une page à l'autre : bandeaux, slogans, encarts.
  const { pages: clean, removedSections, samples } = removeBoilerplate(extracted);
  if (removedSections > 0) {
    console.log(`     ${removedSections} blocs répétitifs retirés :`);
    for (const sample of samples) {
      console.log(`       « ${sample.replace(/\s+/g, ' ').slice(0, 64)}… »`);
    }
  }

  if (clean.length === 0) {
    console.error('\nAucun contenu exploitable extrait.');
    process.exit(1);
  }

  // --- 3. Chunking --------------------------------------------------------
  console.log('\n3/4  Découpage');
  const chunks: Chunk[] = [];
  for (const page of clean) chunks.push(...chunkPage(page));
  const avgChars = Math.round(
    chunks.reduce((sum, c) => sum + c.content.length, 0) / (chunks.length || 1),
  );
  console.log(`     ${chunks.length} sections (${avgChars} caractères en moyenne)`);

  // --- 4. Embeddings ------------------------------------------------------
  console.log('\n4/4  Génération des embeddings');
  const vectors = await embedDocuments(
    chunks.map((chunk) => chunk.content),
    (done, total) => line(`     ${done}/${total}`),
  );
  line(`     ${vectors.length} vecteurs (${EMBEDDING_DIMENSIONS} dimensions)\n`);

  const embedded: EmbeddedChunk[] = chunks.map((chunk, index) => ({
    ...chunk,
    embedding: vectors[index] as number[],
  }));

  const kb: KnowledgeBase = {
    botId,
    websiteUrl: startUrl,
    createdAt: new Date().toISOString(),
    model: EMBEDDING_MODEL,
    dimensions: EMBEDDING_DIMENSIONS,
    pages: clean.map((page) => ({
      url: page.url,
      title: page.title,
      contentHash: page.contentHash,
      chunkCount: chunks.filter((chunk) => chunk.url === page.url).length,
    })),
    chunks: embedded,
  };

  const file = await saveKnowledgeBase(kb);
  const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);

  console.log(`\n✓ Base de connaissances prête en ${seconds}s`);
  console.log(`  ${file}`);
  console.log(`\n  Tester :  npm run ask -- --bot=${botId}\n`);
}

main().catch((error) => {
  console.error('\nÉchec :', error instanceof Error ? error.message : error);
  process.exit(1);
});
