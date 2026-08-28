-- Entrainement de l'assistant par import de documents.
--
-- CHOIX CENTRAL : un document est stocke comme une PAGE.
--
-- Un document a exactement la meme forme qu'une page de site  un titre, des
-- sections, du texte, une empreinte. En le rangeant dans `pages`, le
-- decoupage, les embeddings, la recherche hybride, match_chunks et l'isolation
-- RLS continuent de fonctionner sans une seule ligne de changement.
--
-- Une table `documents` separee aurait oblige a rendre chunks.page_id
-- optionnelle et a reecrire la fonction de recherche. Pour aucun gain.

alter table pages
  add column source text not null default 'website'
    check (source in ('website', 'document'));

-- Metadonnees propres aux fichiers importes. Nulles pour les pages de site.
alter table pages add column file_name text;
alter table pages add column file_size integer;
alter table pages add column storage_path text;

-- Les deux surfaces se lisent souvent separement (l'ecran « votre site » et
-- l'ecran « vos documents »).
create index pages_source_idx on pages (bot_id, source);

/*
 * `url` reste la cle unique par assistant.
 *
 * Pour un document elle porte son chemin de stockage, ce qui empeche
 * d'importer deux fois le meme fichier sous le meme assistant  la contrainte
 * unique (bot_id, url) s'en charge, sans code supplementaire.
 */

-- =============================================================================
-- Stockage des fichiers
--
-- Compartiment PRIVE : aucune lecture publique. Le serveur telecharge le
-- fichier avec la cle service_role au moment de l'analyse, puis n'y touche
-- plus. Le navigateur, lui, n'obtient qu'une URL d'envoi signee, valable pour
-- un chemin precis et quelques minutes.
--
-- Pourquoi ne pas faire transiter le fichier par notre API : une fonction
-- serverless Vercel plafonne le corps d'une requete a 4,5 Mo. L'envoi direct
-- vers le stockage evite cette limite et la pression memoire.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  10485760, -- 10 Mo
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown'
  ]
)
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

/*
 * Cloisonnement par assistant.
 *
 * Les fichiers sont ranges sous `<bot_id>/<uuid>.<ext>`. La politique verifie
 * que le premier segment du chemin correspond a un assistant appartenant a
 * l'utilisateur : personne ne peut deposer ni lire dans le dossier d'un autre.
 */
create policy documents_insert on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'documents'
    and exists (
      select 1 from bots b
      where b.id::text = (storage.foldername(name))[1]
        and b.user_id = auth.uid()
    )
  );

create policy documents_select on storage.objects for select
  to authenticated
  using (
    bucket_id = 'documents'
    and exists (
      select 1 from bots b
      where b.id::text = (storage.foldername(name))[1]
        and b.user_id = auth.uid()
    )
  );

create policy documents_delete on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'documents'
    and exists (
      select 1 from bots b
      where b.id::text = (storage.foldername(name))[1]
        and b.user_id = auth.uid()
    )
  );
