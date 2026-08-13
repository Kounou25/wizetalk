-- Correction de l'arm lexical de la recherche hybride.
--
-- websearch_to_tsquery('french', 'quels sont vos tarifs ?') produit une
-- requete en ET : 'quel & tarif'. Le chunk doit alors contenir TOUS les termes,
-- ce qui n'arrive presque jamais sur une question formulee naturellement.
-- Resultat : l'arm lexical ne remontait rien et la recherche hybride etait en
-- realite purement vectorielle — donc aveugle aux termes exacts (references
-- produit, prix, sigles), qui sont justement sa raison d'etre.
--
-- On transforme la requete en OU. Chaque terme present fait remonter le chunk,
-- et ts_rank classe par nombre et rarete des termes trouves.

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
  with params as (
    select
      -- '&' -> '|' : la requete devient un OU sur les termes.
      -- nullif(...) evite de caster une chaine vide en tsquery (erreur).
      nullif(
        replace(websearch_to_tsquery('french', p_query_text)::text, '&', '|'),
        ''
      )::tsquery as lex_query
  ),
  vector_hits as (
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
        order by ts_rank(c.content_tsv, p.lex_query) desc
      ) as rank
    from chunks c
    cross join params p
    where c.bot_id = p_bot_id
      and p.lex_query is not null
      and c.content_tsv @@ p.lex_query
    order by ts_rank(c.content_tsv, p.lex_query) desc
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
