/**
 * Decoupage en chunks.
 *
 * Deux regles qui font l'essentiel de la qualite :
 *  1. on ne coupe jamais au milieu d'une section (un titre = une unite de sens) ;
 *  2. chaque chunk est prefixe de son fil d'Ariane, donc reste comprehensible
 *     hors contexte — pour le modele d'embedding comme pour le LLM.
 */

import type { Chunk, CleanPage } from './types';

export interface ChunkOptions {
  /** ~1200 caracteres = ~300 tokens. Assez large pour du sens, assez court pour rester precis. */
  targetChars: number;
  overlapChars: number;
  minChars: number;
  maxChunksPerPage: number;
}

export const DEFAULT_CHUNK_OPTIONS: ChunkOptions = {
  targetChars: 1200,
  overlapChars: 150,
  minChars: 80,
  maxChunksPerPage: 40,
};

/** Decoupe un texte long en respectant les frontieres de paragraphe puis de phrase. */
function splitText(text: string, opts: ChunkOptions): string[] {
  if (text.length <= opts.targetChars) return [text];

  // Unites insecables : paragraphes, puis phrases si un paragraphe est trop long.
  const units: string[] = [];
  for (const paragraph of text.split('\n').filter((p) => p.trim())) {
    if (paragraph.length <= opts.targetChars) {
      units.push(paragraph);
      continue;
    }
    const sentences = paragraph.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) ?? [paragraph];
    for (const sentence of sentences) {
      // Phrase demesuree (texte sans ponctuation) : coupe brute en dernier recours.
      if (sentence.length > opts.targetChars * 2) {
        for (let i = 0; i < sentence.length; i += opts.targetChars) {
          units.push(sentence.slice(i, i + opts.targetChars));
        }
      } else {
        units.push(sentence.trim());
      }
    }
  }

  const parts: string[] = [];
  let current = '';

  for (const unit of units) {
    if (current && current.length + unit.length + 1 > opts.targetChars) {
      parts.push(current.trim());
      // Overlap : on reprend la fin du chunk precedent pour ne pas perdre
      // une information a cheval sur la coupure.
      const tail = current.slice(-opts.overlapChars);
      const boundary = tail.search(/[.!?]\s/);
      current = boundary === -1 ? tail : tail.slice(boundary + 2);
    }
    current += (current ? '\n' : '') + unit;
  }

  if (current.trim()) parts.push(current.trim());
  return parts;
}

export function chunkPage(
  page: CleanPage,
  options: Partial<ChunkOptions> = {},
): Chunk[] {
  const opts = { ...DEFAULT_CHUNK_OPTIONS, ...options };
  const chunks: Chunk[] = [];

  const emit = (headings: string[], text: string) => {
    if (text.length < opts.minChars) return;
    if (chunks.length >= opts.maxChunksPerPage) return;

    // Le fil d'Ariane fait partie du texte embedde : c'est lui qui permet
    // de retrouver "Developpement web" quand la question dit "vos services".
    const breadcrumb = [page.title, ...headings].filter(Boolean).join(' > ');

    chunks.push({
      id: `${page.contentHash.slice(0, 12)}-${chunks.length}`,
      url: page.url,
      title: page.title,
      headings,
      index: chunks.length,
      content: `${breadcrumb}\n\n${text}`,
    });
  };

  // Les sections courtes sont regroupees jusqu'a approcher targetChars.
  // Sans ce regroupement, un site a titres nombreux produit des dizaines de
  // fragments de 300 caracteres : plus d'appels d'embedding, et des morceaux
  // trop maigres pour porter une reponse.
  let pending: { headings: string[]; text: string } | null = null;

  const flush = () => {
    if (pending) emit(pending.headings, pending.text);
    pending = null;
  };

  for (const section of page.sections) {
    // Section deja plus longue que la cible : decoupage dedie, pas de fusion.
    if (section.text.length > opts.targetChars) {
      flush();
      for (const part of splitText(section.text, opts)) emit(section.headings, part);
      continue;
    }

    if (pending && pending.text.length + section.text.length + 2 > opts.targetChars) {
      flush();
    }

    if (!pending) {
      pending = { headings: section.headings, text: section.text };
    } else {
      // Le titre de la section absorbee est conserve dans le texte, sinon
      // l'information "ce paragraphe parle de X" disparait a la fusion.
      const heading = section.headings.at(-1);
      const prefix = heading && heading !== pending.headings.at(-1) ? `${heading}\n` : '';
      pending.text += `\n\n${prefix}${section.text}`;
    }
  }

  flush();
  return chunks;
}
