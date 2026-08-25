-- Favicon du site indexe.
--
-- POURQUOI STOCKER L'ADRESSE PLUTOT QUE DE LA DEDUIRE
--
-- On pourrait construire `https://domaine/favicon.ico` sans rien stocker, et
-- cela marche pour la majorite des sites. Mais beaucoup ne declarent plus
-- d'icone a la racine : ils la posent ou ils veulent, et l'annoncent par
-- <link rel="icon" href="/assets/icon-32.png">. Deduire l'adresse revient donc
-- a afficher une icone cassee chez tous ceux-la.
--
-- L'exploration telecharge deja le HTML de chaque page : y lire la balise ne
-- coute aucune requete supplementaire, et donne l'adresse que le site declare
-- vraiment. La deduction reste en secours, pour les assistants indexes avant
-- cette migration.
--
-- ON NE STOCKE PAS L'IMAGE
--
-- La conserver imposerait un espace de stockage, une invalidation quand le
-- client change de logo, et une politique de purge. L'adresse suffit : c'est
-- le navigateur du proprietaire qui charge l'icone, depuis SON PROPRE site.
-- Aucun service tiers n'apprend la liste des domaines de nos clients.

alter table bots
  add column favicon_url text;

comment on column bots.favicon_url is
  'Adresse absolue de l''icone declaree par le site, relevee a l''exploration.';
