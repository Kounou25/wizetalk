# Deezy

Créez un assistant IA à partir de l'adresse d'un site web, et intégrez-le
n'importe où avec une ligne de code.

```
URL → crawl → nettoyage → chunks → embeddings → pgvector → RAG → widget
```

Next.js 16 · Supabase (Postgres + pgvector + RLS) · Gemini · déploiement Vercel.

## Démarrage

```bash
npm install
cp .env.example .env       # renseigner GEMINI_API_KEY et les clés Supabase
```

Dans Supabase → SQL Editor, exécuter dans l'ordre :

1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_lexical_or.sql`

Puis :

```bash
npm run check      # clé Gemini, modèles, dimensions
npm run db:check   # tables, match_chunks, isolation RLS
npm run dev
```

## Scripts

| Commande | Rôle |
|---|---|
| `npm run check` | Valide clé API, modèles et dimensions d'embedding |
| `npm run models` | Liste les modèles Gemini accessibles avec **votre** clé |
| `npm run db:check` | Vérifie le schéma, `match_chunks` et l'isolation RLS |
| `npm run e2e` | Chemin serveur complet : indexation → pgvector → réponse |
| `npm run smoke` | Surface publique du widget, serveur démarré requis |
| `npm run index` / `ask` | Prototype RAG en ligne de commande, sans base |

`npm run ask -- --bot=<id> --debug "…"` reste l'outil de diagnostic principal :
il affiche les passages retenus, leur similarité cosinus et leur score de fusion.
Quand une réponse est mauvaise, c'est presque toujours la recherche qui a
échoué, pas le modèle.

## Organisation

```
lib/          pipeline partagé entre le prototype CLI et le serveur
  crawler · cleaner · boilerplate · chunker · embeddings
  search      recherche en mémoire (CLI)
  database    recherche pgvector (serveur)
  rag         orchestration, garde-fous — reçoit un Retriever
  indexer     indexation par tranches (contrainte serverless)
app/          dashboard, routes API, page iframe du widget
public/       widget.js
supabase/     migrations SQL
```

## Décisions structurantes

**Pas de Playwright.** Le binaire Chromium dépasse la limite d'une fonction
serverless, et un crawl de 50 pages dépasse le délai maximum d'exécution. La
cible — les sites vitrines d'entreprise — est rendue côté serveur.
`needsJavaScript()` signale les sites qui exigeraient un rendu JS ; le repli
Playwright sera ajouté seulement pour ceux-là.

**Un `Retriever` plutôt qu'un tableau de chunks.** `rag.ts` ignore où vivent les
vecteurs. Recherche en mémoire pour le CLI, pgvector pour le serveur : même
contrat, donc les garde-fous anti-hallucination ne sont écrits qu'une fois.

**Indexation en deux phases.** Le crawl stocke les pages nettoyées sans les
vectoriser ; l'embedding ne démarre qu'ensuite. Cette séparation existe parce
que la suppression du boilerplate a besoin du corpus entier, alors qu'un tick
serverless n'en voit qu'une poignée de pages. L'onglet du navigateur pilote les
ticks ; l'état vit en base, donc un onglet fermé ne perd rien.

**768 dimensions, pas 3072.** L'index HNSW de pgvector plafonne à 2000
dimensions. Corollaire mesuré : à 768, `gemini-embedding-001` renvoie des
vecteurs de norme **0.59**. Sans re-normalisation manuelle, toutes les
similarités cosinus seraient faussées.

**`gemini-embedding-001`, surtout pas `gemini-embedding-2`.** Le modèle 2 ne
traite pas les lots : il renvoie **un vecteur pour 50 textes, sans erreur**.
`embeddings.ts` vérifie donc toujours le nombre de vecteurs reçus.

**Recherche hybride en OU, pas en ET.** `websearch_to_tsquery` combine les
termes en ET : une question naturelle n'aurait alors presque jamais de
correspondance lexicale, et la recherche serait purement vectorielle — donc
aveugle aux prix, références et sigles. La migration 0002 transforme la requête
en OU.

**Seuil de similarité avant le LLM.** Sous 0.60, la réponse prudente part sans
appeler Gemini. C'est le garde-fou anti-hallucination le plus fiable, et il ne
coûte rien. La consigne système ne vient qu'en second rideau.

## Pièges Gemini rencontrés

- `gemini-2.5-flash` répond **404** aux nouveaux comptes tout en apparaissant
  dans `models.list()`. D'où `npm run models`.
- `gemini-3.6-flash` est plafonné à **20 requêtes par jour** en palier gratuit.
  Défaut retenu : `gemini-3.5-flash-lite`.
- Gemini 3 rejette `thinkingBudget`. Le remplaçant est `thinkingLevel`, à
  imbriquer dans `thinkingConfig` — placé à la racine, il est accepté par
  TypeScript mais **silencieusement ignoré**.

## Réglages

| Où | Constante | Défaut |
|---|---|---|
| [lib/crawler.ts](lib/crawler.ts) | `maxPages` | 50 |
| [lib/chunker.ts](lib/chunker.ts) | `targetChars` / `overlapChars` | 1200 / 150 |
| [lib/search.ts](lib/search.ts) | `minCosine` (seuil de refus) | 0.60 |
| [lib/indexer.ts](lib/indexer.ts) | pages par tick | 5 crawl / 3 embedding |
| [lib/rag.ts](lib/rag.ts) | `MAX_CONTEXT_CHARS` | 6000 |

`minCosine` est à recalibrer sur de vraies questions clients : trop haut, le bot
refuse alors qu'il sait ; trop bas, il brode.

## Limites connues

- L'incrément de `messages_used` n'est pas atomique : sous forte concurrence, le
  quota peut sous-compter de quelques unités.
- La suppression du boilerplate opère sur des sections entières, pas des lignes,
  pour ne pas effacer l'adresse et les horaires du pied de page.
- La configuration tsvector est `french` : sur un site anglophone, l'arm lexical
  est moins pertinent (le vectoriel, lui, reste multilingue).
