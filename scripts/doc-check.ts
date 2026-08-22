/**
 * Verifie l'extraction de texte sur de vrais fichiers.
 *
 *   npm run doc:check
 *
 * Les analyseurs de documents sont exactement le genre de dependance qui
 * fonctionne en local et casse en production. On les eprouve donc sur des
 * fichiers reels, pas sur des suppositions.
 */

import 'dotenv/config';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { parseDocument, matchesSignature, isAcceptedMime } from '../lib/documents';

const OK = '\x1b[32m✓\x1b[0m';
const KO = '\x1b[31m✗\x1b[0m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

let failures = 0;

function check(condition: boolean, label: string, detail = '') {
  console.log(`${condition ? OK : KO} ${label}${detail ? ` ${DIM}${detail}${RESET}` : ''}`);
  if (!condition) failures++;
}

async function main() {
  const dir = path.join(tmpdir(), 'deezy-doc-check');
  await mkdir(dir, { recursive: true });

  // --- Texte brut ---------------------------------------------------------
  {
    const body = [
      'Conditions de livraison',
      '',
      'Nous livrons en France metropolitaine sous 48 heures ouvrees.',
      'La livraison est offerte a partir de 60 euros d achat.',
      '',
      'Retours',
      '',
      'Vous disposez de 14 jours pour retourner un article non utilise.',
    ].join('\n');

    const file = path.join(dir, 'conditions.txt');
    await writeFile(file, body, 'utf8');
    const buffer = await readFile(file);

    const parsed = await parseDocument(
      buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
      'text/plain',
      'conditions.txt',
      'bot/conditions.txt',
    );

    check(parsed !== null, 'texte : extraction reussie');
    check(parsed?.title === 'conditions', 'texte : titre tire du nom de fichier', parsed?.title);
    check((parsed?.sections.length ?? 0) >= 2, 'texte : titres detectes', `${parsed?.sections.length} sections`);
    check(
      parsed?.text.includes('48 heures') ?? false,
      'texte : contenu conserve',
    );
  }

  // --- PDF reel -----------------------------------------------------------
  {
    // Fichier de reference du projet py-pdf : stable, minuscule, avec du texte.
    const url =
      'https://raw.githubusercontent.com/py-pdf/sample-files/main/002-trivial-libre-office-writer/002-trivial-libre-office-writer.pdf';
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = await response.arrayBuffer();

      check(
        matchesSignature(new Uint8Array(buffer.slice(0, 8)), 'application/pdf'),
        'PDF : signature binaire reconnue',
      );

      const parsed = await parseDocument(buffer, 'application/pdf', 'tarifs.pdf', 'bot/tarifs.pdf');

      check(parsed !== null, 'PDF : texte extrait');
      check(
        (parsed?.text.length ?? 0) > 300,
        'PDF : volume de texte plausible',
        `${parsed?.text.length ?? 0} caracteres`,
      );
      check(
        parsed?.text.toLowerCase().includes('lorem ipsum') ?? false,
        'PDF : contenu attendu retrouve',
      );
      check(parsed?.title === 'tarifs', 'PDF : titre tire du nom de fichier', parsed?.title);
    } catch (error) {
      check(false, 'PDF : telechargement ou analyse', String(error).slice(0, 80));
    }
  }

  // --- Refus d'un fichier dont le contenu ment sur son format -------------
  {
    const fake = new TextEncoder().encode('Ceci est du texte, pas un PDF.');
    check(
      !matchesSignature(fake, 'application/pdf'),
      'un faux PDF est detecte par sa signature',
    );
    check(isAcceptedMime('application/pdf'), 'type PDF accepte');
    check(!isAcceptedMime('image/png'), 'type image refuse');
  }

  console.log(failures === 0 ? '\nExtraction validee.\n' : `\n${failures} echec(s).\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
