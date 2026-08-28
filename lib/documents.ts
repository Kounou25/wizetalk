/**
 * Extraction du texte d'un document importe.
 *
 * Le resultat est un CleanPage  exactement la meme forme qu'une page de site.
 * C'est ce qui permet au decoupage, aux embeddings et a la recherche de
 * fonctionner sans distinction entre les deux sources.
 */

import { createHash } from 'node:crypto';
import type { CleanPage, Section } from './types';

/** Types acceptes, avec leur extension et leur signature binaire. */
export const ACCEPTED = {
  'application/pdf': { ext: 'pdf', magic: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    ext: 'docx',
    magic: [0x50, 0x4b, 0x03, 0x04], // archive ZIP
  },
  'text/plain': { ext: 'txt', magic: null },
  'text/markdown': { ext: 'md', magic: null },
} as const;

export type AcceptedMime = keyof typeof ACCEPTED;

export const MAX_FILE_BYTES = 10 * 1024 * 1024;

/**
 * Plafond de texte retenu par document.
 *
 * Sans lui, un catalogue de 800 pages produirait des milliers de morceaux a
 * vectoriser  pour un cout sans rapport avec sa valeur, et un depassement du
 * delai de la fonction serverless.
 */
export const MAX_EXTRACTED_CHARS = 200_000;

export function isAcceptedMime(value: string): value is AcceptedMime {
  return value in ACCEPTED;
}

/**
 * Verifie la signature binaire du fichier.
 *
 * Le type annonce par le navigateur ne se croit pas : n'importe qui peut
 * appeler notre API en declarant « application/pdf » pour un fichier tout
 * autre. On lit les premiers octets, qui eux ne mentent pas.
 */
export function matchesSignature(bytes: Uint8Array, mime: AcceptedMime): boolean {
  const magic = ACCEPTED[mime].magic;
  if (!magic) return true; // texte brut : aucune signature a verifier
  return magic.every((byte, index) => bytes[index] === byte);
}

function squash(text: string): string {
  return text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Reconstitue des sections a partir du texte brut.
 *
 * On ne dispose pas de la structure HTML d'une page : on s'appuie sur les
 * lignes courtes sans ponctuation finale, qui sont presque toujours des
 * titres. Une section par titre, et un repli par paragraphes si le document
 * n'en contient aucun.
 */
function buildSections(text: string): Section[] {
  const lines = text.split('\n').map((line) => line.trim());

  const sections: Section[] = [];
  let heading: string | null = null;
  let buffer: string[] = [];

  const flush = () => {
    const body = buffer.join('\n').trim();
    if (body.length >= 20) {
      sections.push({ headings: heading ? [heading] : [], text: body });
    }
    buffer = [];
  };

  const looksLikeHeading = (line: string) =>
    line.length > 0 &&
    line.length <= 80 &&
    !/[.!?;:,]$/.test(line) &&
    // Un titre compte peu de mots ; une phrase courte sans point en compte plus.
    line.split(/\s+/).length <= 12;

  for (const line of lines) {
    if (!line) continue;

    if (looksLikeHeading(line)) {
      flush();
      heading = line;
      continue;
    }
    buffer.push(line);
  }
  flush();

  // Aucun titre detecte : on decoupe par paragraphes plutot que de rendre
  // un unique bloc que le decoupeur trancherait a l'aveugle.
  if (sections.length === 0) {
    return text
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter((block) => block.length >= 20)
      .map((block) => ({ headings: [], text: block }));
  }

  return sections;
}

async function extractPdf(buffer: ArrayBuffer): Promise<string> {
  // Import differe : l'analyseur ne pese sur le demarrage a froid que si un
  // PDF est reellement traite.
  const { extractText, getDocumentProxy } = await import('unpdf');
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return Array.isArray(text) ? text.join('\n\n') : text;
}

async function extractDocx(buffer: ArrayBuffer): Promise<string> {
  const mammoth = await import('mammoth');
  const { value } = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
  return value;
}

export interface ParsedDocument extends CleanPage {
  /** Vrai si le texte a ete tronque au plafond. */
  truncated: boolean;
}

/**
 * Transforme un fichier en page indexable.
 *
 * Rend null quand le document ne contient pas assez de texte exploitable —
 * un PDF scanne sans couche de texte, par exemple. Mieux vaut le dire au
 * client que d'indexer trois mots inutiles.
 */
export async function parseDocument(
  buffer: ArrayBuffer,
  mime: AcceptedMime,
  fileName: string,
  storagePath: string,
): Promise<ParsedDocument | null> {
  let raw: string;

  switch (mime) {
    case 'application/pdf':
      raw = await extractPdf(buffer);
      break;
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      raw = await extractDocx(buffer);
      break;
    default:
      raw = new TextDecoder('utf-8').decode(buffer);
  }

  const squashed = squash(raw);
  const truncated = squashed.length > MAX_EXTRACTED_CHARS;
  const text = truncated ? squashed.slice(0, MAX_EXTRACTED_CHARS) : squashed;

  if (text.length < 150) return null;

  // Le nom du fichier fait office de titre : c'est ce que le client reconnait,
  // et ce qui prefixera chaque morceau lors du decoupage.
  const title = fileName.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim() || fileName;

  return {
    url: storagePath,
    title,
    sections: buildSections(text),
    text,
    contentHash: createHash('sha256').update(text).digest('hex'),
    truncated,
  };
}
