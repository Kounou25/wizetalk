/**
 * Suppression du contenu repete d'une page a l'autre.
 *
 * Readability retire deja nav/footer/pub, mais laisse passer tout ce qui est
 * dans le corps : bandeau cookies, slogan, mentions legales, encart
 * "contactez-nous", avertissement JavaScript... Repete sur 30 pages, ce texte
 * pollue les embeddings et fait remonter des chunks non pertinents.
 *
 * Le principe ne demande aucune liste de selecteurs : ce qui apparait
 * a l'identique sur une large part des pages n'est pas du contenu propre a
 * une page. Cela s'adapte donc a n'importe quel site client.
 *
 * ARBITRAGE : le filtrage opere sur des sections entieres, pas sur des lignes.
 * Une granularite plus fine attraperait davantage de bruit, mais supprimerait
 * aussi l'adresse, le telephone et les horaires  repetes en pied de page sur
 * tout le site, et precisement ce que les visiteurs demandent le plus. On
 * prefere donc laisser passer un peu de bruit que perdre ces informations.
 */

import { createHash } from 'node:crypto';
import type { CleanPage } from './types';

export interface BoilerplateOptions {
  /** Part des pages au-dela de laquelle une section est jugee repetitive. */
  threshold: number;
  /** En deca, l'echantillon est trop petit pour conclure. */
  minPages: number;
  /** Une section presente sur moins de pages que ca n'est jamais retiree. */
  minOccurrences: number;
}

export const DEFAULT_BOILERPLATE_OPTIONS: BoilerplateOptions = {
  threshold: 0.5,
  minPages: 4,
  minOccurrences: 3,
};

/** Cle de comparaison : insensible a la casse, aux espaces et a la ponctuation. */
function fingerprint(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').replace(/[^\p{L}\p{N} ]/gu, '').trim();
}

export interface BoilerplateResult {
  pages: CleanPage[];
  /** Sections retirees, pour l'affichage de progression. */
  removedSections: number;
  /** Echantillon du texte retire, utile pour verifier qu'on n'a pas trop coupe. */
  samples: string[];
}

export function removeBoilerplate(
  pages: CleanPage[],
  options: Partial<BoilerplateOptions> = {},
): BoilerplateResult {
  const opts = { ...DEFAULT_BOILERPLATE_OPTIONS, ...options };
  if (pages.length < opts.minPages) {
    return { pages, removedSections: 0, samples: [] };
  }

  // Nombre de pages distinctes ou apparait chaque section.
  const pageCount = new Map<string, number>();
  for (const page of pages) {
    const seenOnThisPage = new Set<string>();
    for (const section of page.sections) {
      const key = fingerprint(section.text);
      if (!key || seenOnThisPage.has(key)) continue;
      seenOnThisPage.add(key);
      pageCount.set(key, (pageCount.get(key) ?? 0) + 1);
    }
  }

  const limit = Math.max(opts.minOccurrences, Math.ceil(pages.length * opts.threshold));
  const repeated = new Set(
    [...pageCount.entries()].filter(([, count]) => count >= limit).map(([key]) => key),
  );

  if (repeated.size === 0) return { pages, removedSections: 0, samples: [] };

  let removedSections = 0;
  const samples: string[] = [];
  const cleaned: CleanPage[] = [];

  for (const page of pages) {
    const sections = page.sections.filter((section) => {
      const key = fingerprint(section.text);
      if (!repeated.has(key)) return true;
      removedSections++;
      if (samples.length < 5 && !samples.includes(section.text)) {
        samples.push(section.text);
      }
      return false;
    });

    // Une page entierement composee de boilerplate n'a rien a apporter.
    const text = sections
      .map((s) => (s.headings.length ? `${s.headings.join(' > ')}\n${s.text}` : s.text))
      .join('\n\n')
      .trim();
    if (text.length < 150) continue;

    cleaned.push({
      ...page,
      sections,
      text,
      // Le hash sert a la deduplication et a la resynchro : il doit porter
      // sur le texte finalement indexe.
      contentHash: createHash('sha256').update(text).digest('hex'),
    });
  }

  return { pages: cleaned, removedSections, samples };
}
