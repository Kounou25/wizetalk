/**
 * Persistance locale (JSON) — uniquement pour le prototype.
 *
 * Elle sera remplacee par Supabase + pgvector, mais la forme des donnees
 * (KnowledgeBase) est deja celle des futures tables `pages` et `chunks`.
 */

import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { KnowledgeBase } from './types';

const DATA_DIR = path.resolve(process.cwd(), 'data');

/** "https://example.com/fr" -> "example-com-fr" */
export function slugify(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname}`
      .replace(/^www\./, '')
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
  } catch {
    return url.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  }
}

export async function saveKnowledgeBase(kb: KnowledgeBase): Promise<string> {
  await mkdir(DATA_DIR, { recursive: true });
  const file = path.join(DATA_DIR, `${kb.botId}.json`);
  await writeFile(file, JSON.stringify(kb), 'utf8');
  return file;
}

export async function loadKnowledgeBase(botId: string): Promise<KnowledgeBase> {
  const file = path.join(DATA_DIR, `${botId}.json`);
  return JSON.parse(await readFile(file, 'utf8')) as KnowledgeBase;
}

export async function listKnowledgeBases(): Promise<string[]> {
  try {
    const files = await readdir(DATA_DIR);
    return files.filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''));
  } catch {
    return [];
  }
}
