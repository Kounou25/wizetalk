-- Logo de l'assistant, televerse par son proprietaire.
--
-- CE QU'IL REMPLACE
--
-- L'en-tete de la fenetre de discussion affiche aujourd'hui une pastille
-- portant l'initiale du nom de l'assistant. C'est un repli honnete, mais sur
-- le site d'une banque ou d'un assureur, une lettre dans un carre ne dit pas
-- « c'est bien nous ». Le logo prend sa place quand il existe.
--
-- POURQUOI ON STOCKE LE CHEMIN, ET NON L'URL PUBLIQUE
--
-- `favicon_url` (migration 0009) conserve une adresse absolue, mais elle
-- designe un fichier qui vit chez le CLIENT : nous ne faisons que la relever.
-- Ici le fichier est chez nous, et son URL publique contient le domaine du
-- projet Supabase. La figer en base collerait une valeur d'environnement dans
-- des donnees metier : une restauration vers un autre projet, ou un changement
-- de domaine de stockage, casserait tous les logos d'un coup. Le chemin, lui,
-- ne depend de rien — l'URL se reconstruit a la lecture (lib/bot-logo.ts).
--
-- POURQUOI UN SEAU PUBLIC, CONTRAIREMENT AUX DOCUMENTS
--
-- Le seau `documents` est prive : ce sont les contenus confidentiels du
-- client, lus par notre serveur seul. Un logo, lui, doit s'afficher dans une
-- iframe ouverte anonymement par n'importe quel visiteur du site du client.
-- Une URL signee y serait absurde — elle expirerait, et il faudrait la
-- renouveler a chaque chargement de widget. Le logo est de toute facon deja
-- public : il est sur la page d'accueil du client.

alter table bots
  add column logo_path text;

comment on column bots.logo_path is
  'Chemin dans le seau bot-logos, sous la forme <bot_id>/<uuid>.<ext>. NULL = pastille d''initiale.';

-- =============================================================================
-- Seau de stockage
--
-- 1 Mo suffit largement pour un logo : au-dela, c'est une photographie qu'on
-- televerse par erreur, et elle ralentirait l'ouverture du widget chez tous
-- les visiteurs du client.
--
-- PAS DE SVG, ET C'EST DELIBERE
--
-- Un SVG est un document executable : il peut porter du script. Rien ne le
-- justifie pour un logo, et un vectoriel s'exporte en PNG en deux clics.
-- `allowed_mime_types` fait respecter la regle cote stockage, en plus du
-- controle de la route qui delivre l'autorisation d'envoi — une seule des deux
-- barrieres suffirait a etre contournee si elle etait seule.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bot-logos',
  'bot-logos',
  true,
  1048576, -- 1 Mo
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

/*
 * Cloisonnement par assistant, meme regle que pour les documents.
 *
 * Les fichiers sont ranges sous `<bot_id>/<uuid>.<ext>`. La politique verifie
 * que le premier segment du chemin correspond a un assistant appartenant a
 * l'utilisateur : personne ne peut deposer ni supprimer dans le dossier d'un
 * autre.
 *
 * Aucune politique de LECTURE n'est necessaire : le seau est public, et
 * Supabase sert alors les objets sans passer par RLS. C'est precisement ce
 * qu'on veut — le visiteur anonyme d'un site client doit voir le logo.
 */
create policy bot_logos_insert on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'bot-logos'
    and exists (
      select 1 from bots b
      where b.id::text = (storage.foldername(name))[1]
        and b.user_id = auth.uid()
    )
  );

-- Le remplacement d'un logo ecrit un nouveau fichier puis supprime l'ancien,
-- mais `upsert` sur un meme chemin passe par UPDATE : la politique est donc
-- necessaire, sans quoi un renvoi echouerait silencieusement.
create policy bot_logos_update on storage.objects for update
  to authenticated
  using (
    bucket_id = 'bot-logos'
    and exists (
      select 1 from bots b
      where b.id::text = (storage.foldername(name))[1]
        and b.user_id = auth.uid()
    )
  );

create policy bot_logos_delete on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'bot-logos'
    and exists (
      select 1 from bots b
      where b.id::text = (storage.foldername(name))[1]
        and b.user_id = auth.uid()
    )
  );
