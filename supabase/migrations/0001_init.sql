-- Schema initial Wizetalk.
-- A executer dans Supabase : SQL Editor -> coller -> Run.

create extension if not exists vector;

-- =============================================================================
-- Fonctions utilitaires
-- =============================================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================================================
-- bots
-- =============================================================================

create table bots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  name text not null,
  website_url text not null,

  -- Personnalisation du widget
  welcome_message text not null default 'Bonjour ! Comment puis-je vous aider ?',
  primary_color text not null default '#2563eb',
  position text not null default 'bottom-right'
    check (position in ('bottom-right', 'bottom-left')),
  is_active boolean not null default true,

  -- draft   : cree, jamais analyse
  -- crawling: analyse en cours
  -- ready   : utilisable
  -- error   : la derniere analyse a echoue
  status text not null default 'draft'
    check (status in ('draft', 'crawling', 'ready', 'error')),

  -- Le widget est public : n'importe qui peut lire le bot_id dans le HTML du
  -- client et boucler sur /api/chat. Ces deux colonnes bornent l'exposition.
  allowed_domains text[] not null default '{}',
  messages_used integer not null default 0,
  messages_quota integer not null default 1000,

  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bots_user_id_idx on bots (user_id);

create trigger bots_set_updated_at
  before update on bots
  for each row execute function set_updated_at();

-- =============================================================================
-- pages
-- =============================================================================

create table pages (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid not null references bots(id) on delete cascade,

  url text not null,
  title text not null,
  content text not null,

  -- Texte structure par titre, tel que produit par lib/cleaner.ts.
  -- Conserve entre la phase de crawl et la phase d'embedding : sur Vercel les
  -- deux se deroulent dans des invocations distinctes, et le decoupage a besoin
  -- de cette structure (pas seulement du texte a plat).
  sections jsonb not null default '[]',

  -- SHA-256 du texte nettoye : a la resynchronisation, une page dont le hash
  -- n'a pas bouge n'est pas re-decoupee ni re-embeddee. C'est le principal
  -- levier de cout du produit.
  content_hash text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (bot_id, url)
);

create index pages_bot_id_idx on pages (bot_id);

create trigger pages_set_updated_at
  before update on pages
  for each row execute function set_updated_at();

-- =============================================================================
-- chunks
-- =============================================================================

create table chunks (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid not null references bots(id) on delete cascade,
  page_id uuid not null references pages(id) on delete cascade,

  chunk_index integer not null,
  content text not null,

  -- 768 dimensions : l'index HNSW de pgvector plafonne a 2000. La sortie par
  -- defaut de gemini-embedding-001 (3072) serait donc non indexable.
  embedding vector(768) not null,

  metadata jsonb not null default '{}',

  -- Recherche plein-texte, pour rattraper ce que le vectoriel rate :
  -- references produit, prix, sigles, noms propres.
  content_tsv tsvector generated always as (to_tsvector('french', content)) stored,

  created_at timestamptz not null default now(),

  unique (page_id, chunk_index)
);

create index chunks_bot_id_idx on chunks (bot_id);
create index chunks_page_id_idx on chunks (page_id);
create index chunks_tsv_idx on chunks using gin (content_tsv);

-- Cosinus, cohérent avec des vecteurs normalisés côté application.
create index chunks_embedding_idx on chunks
  using hnsw (embedding vector_cosine_ops);

-- =============================================================================
-- crawl_jobs
--
-- Sur Vercel une fonction serverless est bornee en duree : un crawl de 50 pages
-- ne peut pas tenir dans une seule invocation. Le job porte donc sa propre file
-- d'URLs, ce qui le rend reprenable d'une invocation a l'autre.
-- =============================================================================

create table crawl_jobs (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid not null references bots(id) on delete cascade,

  status text not null default 'pending'
    check (status in ('pending', 'crawling', 'embedding', 'done', 'error')),

  -- File d'attente et pages deja visitees, serialisees pour la reprise.
  queue jsonb not null default '[]',
  visited jsonb not null default '[]',

  pages_found integer not null default 0,
  pages_done integer not null default 0,
  chunks_done integer not null default 0,
  max_pages integer not null default 50,

  error text,

  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  finished_at timestamptz
);

create index crawl_jobs_bot_id_idx on crawl_jobs (bot_id, started_at desc);

create trigger crawl_jobs_set_updated_at
  before update on crawl_jobs
  for each row execute function set_updated_at();

-- =============================================================================
-- conversations / messages
-- =============================================================================

create table conversations (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid not null references bots(id) on delete cascade,

  -- Identifiant anonyme genere par le widget, conserve en sessionStorage.
  session_id text not null,

  created_at timestamptz not null default now()
);

create index conversations_bot_id_idx on conversations (bot_id, created_at desc);
create index conversations_session_idx on conversations (bot_id, session_id);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,

  role text not null check (role in ('user', 'assistant')),
  content text not null,

  -- URLs ayant servi a construire la reponse : sert a l'affichage cote widget
  -- et au diagnostic depuis le dashboard.
  sources jsonb not null default '[]',

  created_at timestamptz not null default now()
);

create index messages_conversation_idx on messages (conversation_id, created_at);

-- =============================================================================
-- Recherche hybride
--
-- Vectoriel et plein-texte sont classes separement puis fusionnes en RRF
-- (Reciprocal Rank Fusion) : pas de ponderation a regler, et les deux signaux
-- restent comparables meme si leurs echelles n'ont rien a voir.
--
-- SECURITY INVOKER (defaut) : la fonction reste soumise au RLS de l'appelant.
-- Un utilisateur connecte ne peut donc rien lire d'un bot qui n'est pas le sien,
-- meme en passant un p_bot_id arbitraire.
-- =============================================================================

create or replace function match_chunks(
  p_bot_id uuid,
  p_query_embedding vector(768),
  p_query_text text,
  p_match_count integer default 5
)
returns table (
  id uuid,
  url text,
  title text,
  content text,
  metadata jsonb,
  cosine double precision,
  score double precision
)
language sql
stable
as $$
  with vector_hits as (
    select
      c.id,
      1 - (c.embedding <=> p_query_embedding) as cosine,
      row_number() over (order by c.embedding <=> p_query_embedding) as rank
    from chunks c
    where c.bot_id = p_bot_id
    order by c.embedding <=> p_query_embedding
    limit 20
  ),
  lexical_hits as (
    select
      c.id,
      row_number() over (
        order by ts_rank(c.content_tsv, websearch_to_tsquery('french', p_query_text)) desc
      ) as rank
    from chunks c
    where c.bot_id = p_bot_id
      and p_query_text <> ''
      and c.content_tsv @@ websearch_to_tsquery('french', p_query_text)
    limit 20
  ),
  fused as (
    select
      coalesce(v.id, l.id) as id,
      coalesce(v.cosine, 0) as cosine,
      coalesce(1.0 / (60 + v.rank), 0) + coalesce(1.0 / (60 + l.rank), 0) as score
    from vector_hits v
    full outer join lexical_hits l on l.id = v.id
  )
  select
    c.id,
    p.url,
    p.title,
    c.content,
    c.metadata,
    f.cosine::double precision,
    f.score::double precision
  from fused f
  join chunks c on c.id = f.id
  join pages p on p.id = c.page_id
  order by f.score desc
  limit p_match_count;
$$;

-- =============================================================================
-- Row Level Security
--
-- Regle unique : on ne voit que ce qui pend a un bot dont on est proprietaire.
-- Les tables filles n'ont pas de politique d'ecriture pour les utilisateurs :
-- l'indexation et les conversations passent par le serveur (service_role),
-- jamais par le navigateur.
-- =============================================================================

alter table bots           enable row level security;
alter table pages          enable row level security;
alter table chunks         enable row level security;
alter table crawl_jobs     enable row level security;
alter table conversations  enable row level security;
alter table messages       enable row level security;

-- bots : controle total sur les siens
create policy bots_select on bots for select
  using (auth.uid() = user_id);
create policy bots_insert on bots for insert
  with check (auth.uid() = user_id);
create policy bots_update on bots for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy bots_delete on bots for delete
  using (auth.uid() = user_id);

-- Tables rattachees a un bot : lecture seule pour le proprietaire
create policy pages_select on pages for select
  using (exists (
    select 1 from bots b where b.id = pages.bot_id and b.user_id = auth.uid()
  ));

create policy chunks_select on chunks for select
  using (exists (
    select 1 from bots b where b.id = chunks.bot_id and b.user_id = auth.uid()
  ));

create policy crawl_jobs_select on crawl_jobs for select
  using (exists (
    select 1 from bots b where b.id = crawl_jobs.bot_id and b.user_id = auth.uid()
  ));

create policy conversations_select on conversations for select
  using (exists (
    select 1 from bots b where b.id = conversations.bot_id and b.user_id = auth.uid()
  ));

create policy messages_select on messages for select
  using (exists (
    select 1
    from conversations c
    join bots b on b.id = c.bot_id
    where c.id = messages.conversation_id and b.user_id = auth.uid()
  ));
