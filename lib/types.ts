/** Types partages par tout le pipeline. Reutilises tels quels par le futur Next.js. */

/** Page brute recuperee par le crawler. */
export interface CrawledPage {
  url: string;
  html: string;
}

/** Page apres nettoyage : plus de HTML, seulement du texte structure. */
export interface CleanPage {
  url: string;
  title: string;
  /** Sections dans l'ordre du document, chacune rattachee a son fil d'Ariane de titres. */
  sections: Section[];
  /** Texte complet reconstitue, sert au hash de deduplication. */
  text: string;
  /** SHA-256 du texte : permet de ne pas re-embedder une page inchangee a la resynchro. */
  contentHash: string;
}

export interface Section {
  /** Fil d'Ariane : ["Nos services", "Developpement web"] */
  headings: string[];
  text: string;
}

/** Morceau de texte pret a etre embedde. */
export interface Chunk {
  id: string;
  url: string;
  title: string;
  headings: string[];
  index: number;
  /**
   * Texte effectivement envoye a l'embedding ET au LLM.
   * Prefixe du fil d'Ariane : ameliore nettement le rappel pour un cout nul.
   */
  content: string;
}

export interface EmbeddedChunk extends Chunk {
  embedding: number[];
}

/** Ce qu'on persiste pour un bot (JSON en local, Postgres+pgvector ensuite). */
export interface KnowledgeBase {
  botId: string;
  websiteUrl: string;
  createdAt: string;
  model: string;
  dimensions: number;
  pages: { url: string; title: string; contentHash: string; chunkCount: number }[];
  chunks: EmbeddedChunk[];
}

/**
 * Resultat de recherche, volontairement plat : c'est le contrat commun entre
 * la recherche en memoire (prototype CLI) et la recherche pgvector (serveur).
 * Grace a lui, lib/rag.ts est partage par les deux sans aucune duplication.
 */
export interface SearchHit {
  id: string;
  url: string;
  title: string;
  content: string;
  /** Similarite cosinus brute, sert au seuil anti-hallucination. */
  cosine: number;
  /** Score de fusion RRF (vectoriel + lexical), sert au classement. */
  score: number;
}

/**
 * Une question en entree, les passages pertinents en sortie. L'implementation
 * decide ou vivent les vecteurs et comment la question est embeddee.
 */
export type Retriever = (question: string) => Promise<SearchHit[]>;

export interface RagAnswer {
  answer: string;
  sources: { url: string; title: string }[];
  /** true si on a refuse de repondre faute de contexte pertinent. */
  refused: boolean;
  topCosine: number;
}
