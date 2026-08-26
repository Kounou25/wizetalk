/**
 * Orchestration RAG : question -> recherche -> reponse ancree dans le contexte.
 *
 * Ce module ignore ou vivent les vecteurs : il recoit un Retriever. C'est ce qui
 * lui permet d'etre partage tel quel entre le prototype CLI (recherche en
 * memoire) et le serveur (pgvector), sans une ligne dupliquee.
 *
 * Deux garde-fous contre l'hallucination, complementaires :
 *  1. un seuil de similarite qui court-circuite l'appel au LLM quand rien de
 *     pertinent n'a ete trouve — c'est le plus fiable, et il est gratuit ;
 *  2. une consigne systeme stricte + temperature basse pour le reste.
 * L'instruction seule ne suffit jamais : sans le seuil, le modele bavarde a
 * partir de chunks hors-sujet.
 */

import { ThinkingLevel } from '@google/genai';
import { CHAT_MODEL, gemini, withRetry } from './gemini';
import { DEFAULT_SEARCH_OPTIONS } from './search';
import type { RagAnswer, Retriever, SearchHit } from './types';

export const FALLBACK_ANSWER =
  "Je ne trouve pas cette information dans les données disponibles sur le site. " +
  "Je vous recommande de contacter directement l'entreprise.";

const SYSTEM_INSTRUCTION = `Tu es l'assistant officiel de cette entreprise, sur son site web.

RÈGLES ABSOLUES :
- Réponds UNIQUEMENT à partir du CONTEXTE fourni.
- N'invente jamais un prix, un horaire, une adresse, un numéro, un délai, une garantie ou une prestation.
- Si le CONTEXTE ne contient pas la réponse, dis-le clairement et invite à contacter l'entreprise. N'essaie pas de deviner.
- Ne mentionne jamais le "contexte", les "documents" ou les "sources" : parle comme un employé qui connaît son entreprise.
- Reste concis : 2 à 4 phrases, sauf si une énumération est nécessaire.
- Réponds dans la langue de la question.
- Emploie "nous" pour désigner l'entreprise.

MISE EN FORME :
- Tu peux utiliser **gras** pour un terme important, *italique* pour une nuance, une liste à puces ("- ") ou numérotée, et [texte](url) pour un lien.
- N'utilise ni titre (#), ni tableau, ni bloc de code : la fenêtre de discussion ne les affiche pas, et ils apparaîtraient tels quels au visiteur.`;

/** Budget de contexte : borne le cout par question. */
const MAX_CONTEXT_CHARS = 6000;

export interface AnswerOptions {
  /** Sous ce seuil de similarite cosinus, on repond sans appeler le LLM. */
  minCosine: number;
}

export function buildContext(hits: SearchHit[]): string {
  const blocks: string[] = [];
  let total = 0;

  for (const [index, hit] of hits.entries()) {
    const block = `[Source ${index + 1}] ${hit.url}\n${hit.content}`;
    if (total + block.length > MAX_CONTEXT_CHARS) break;
    blocks.push(block);
    total += block.length;
  }

  return blocks.join('\n\n---\n\n');
}

function buildPrompt(context: string, question: string): string {
  return `CONTEXTE :\n${context}\n\nQUESTION DU VISITEUR :\n${question}`;
}

function dedupeSources(hits: SearchHit[]): { url: string; title: string }[] {
  const seen = new Map<string, string>();
  for (const hit of hits) {
    if (!seen.has(hit.url)) seen.set(hit.url, hit.title);
  }
  return [...seen].map(([url, title]) => ({ url, title }));
}

export interface RetrievalResult {
  hits: SearchHit[];
  topCosine: number;
  /** true si aucun chunk ne depasse le seuil : on repond sans appeler le LLM. */
  belowThreshold: boolean;
}

export async function retrieve(
  question: string,
  retriever: Retriever,
  options: Partial<AnswerOptions> = {},
): Promise<RetrievalResult> {
  const minCosine = options.minCosine ?? DEFAULT_SEARCH_OPTIONS.minCosine;
  const hits = await retriever(question);
  const topCosine = hits.reduce((max, hit) => Math.max(max, hit.cosine), 0);

  return { hits, topCosine, belowThreshold: topCosine < minCosine };
}

const GENERATION_CONFIG = {
  systemInstruction: SYSTEM_INSTRUCTION,
  temperature: 0.2,
  maxOutputTokens: 600,
  // Restituer une reponse depuis un contexte court ne demande pas de
  // raisonnement etendu : LOW reduit latence et tokens factures.
  // Gemini 3 remplace thinkingBudget par thinkingLevel — passer l'ancienne
  // forme fait echouer la requete ("invalid argument"), et poser thinkingLevel
  // a la racine de config le fait ignorer silencieusement.
  thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
} as const;

export async function answerQuestion(
  question: string,
  retriever: Retriever,
  options: Partial<AnswerOptions> = {},
): Promise<RagAnswer> {
  const { hits, topCosine, belowThreshold } = await retrieve(question, retriever, options);

  if (hits.length === 0 || belowThreshold) {
    return { answer: FALLBACK_ANSWER, sources: [], refused: true, topCosine };
  }

  const response = await withRetry(() =>
    gemini().models.generateContent({
      model: CHAT_MODEL,
      contents: buildPrompt(buildContext(hits), question),
      config: GENERATION_CONFIG,
    }),
  );

  return {
    answer: response.text?.trim() || FALLBACK_ANSWER,
    sources: dedupeSources(hits),
    refused: false,
    topCosine,
  };
}

/** Variante streamee : c'est elle que le widget utilise (SSE). */
export async function* answerQuestionStream(
  question: string,
  retriever: Retriever,
  options: Partial<AnswerOptions> = {},
): AsyncGenerator<string, RagAnswer> {
  const { hits, topCosine, belowThreshold } = await retrieve(question, retriever, options);

  if (hits.length === 0 || belowThreshold) {
    yield FALLBACK_ANSWER;
    return { answer: FALLBACK_ANSWER, sources: [], refused: true, topCosine };
  }

  const stream = await withRetry(() =>
    gemini().models.generateContentStream({
      model: CHAT_MODEL,
      contents: buildPrompt(buildContext(hits), question),
      config: GENERATION_CONFIG,
    }),
  );

  let answer = '';
  for await (const part of stream) {
    const text = part.text;
    if (text) {
      answer += text;
      yield text;
    }
  }

  return {
    answer: answer.trim() || FALLBACK_ANSWER,
    sources: dedupeSources(hits),
    refused: false,
    topCosine,
  };
}
