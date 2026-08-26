-- Retrait de la mention « Propulsé par Deezy », assistant par assistant.
--
-- POURQUOI UN REGLAGE ET PAS SEULEMENT UNE REGLE DE PALIER
--
-- Jusqu'ici le retrait s'appliquait tout seul des que le palier l'incluait.
-- Cela fonctionnait, mais l'avantage restait invisible : un client payant ne
-- voyait nulle part qu'il en beneficiait, et un client qui ne l'avait pas ne
-- voyait nulle part qu'il existait. Une option dans les reglages rend les deux
-- cas lisibles, et laisse le choix a qui l'a paye.
--
-- LA COLONNE NE DECIDE PAS SEULE
--
-- L'affichage reel est la conjonction de deux choses : le palier autorise le
-- retrait, ET le proprietaire l'a demande sur cet assistant. Un compte qui
-- redescend de palier revoit donc la mention sans qu'on touche a sa ligne —
-- son choix est conserve tel quel, et redevient effectif s'il remonte.
--
-- POURQUOI LA VALEUR PAR DEFAUT EST « true »
--
-- Les clients dont le palier inclut deja le retrait n'ont aujourd'hui aucune
-- mention sur leur site. Un defaut a false la ferait reapparaitre chez eux du
-- jour au lendemain, sans qu'ils aient rien demande. Le defaut inverse ne
-- change strictement rien pour personne : pour les paliers qui n'incluent pas
-- le retrait, la colonne reste sans effet.

alter table bots
  add column hide_branding boolean not null default true;

comment on column bots.hide_branding is
  'Souhait du proprietaire. N''a d''effet que si son palier inclut le retrait de la mention.';
