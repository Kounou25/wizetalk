-- Langue de la fenetre de discussion, par assistant.
--
-- POURQUOI UN REGLAGE ALORS QUE LA DETECTION EXISTE
--
-- Le widget deduit la langue de ce que la page declare (<html lang>), puis du
-- navigateur. Cela marche partout ou la declaration est juste  et beaucoup de
-- sites livrent un lang="en" d'usine qu'on n'a jamais corrige, sous un contenu
-- francais. Chez ceux-la, la deduction est fausse et le proprietaire n'a aucun
-- moyen de la corriger : il ne controle pas notre code, et souvent pas non plus
-- le gabarit de son site.
--
-- « auto » RESTE LE DEFAUT
--
-- La deduction est juste dans la grande majorite des cas, et elle est la seule
-- a gerer un site bilingue : figer la langue sur un tel site casserait
-- precisement ce qu'on vient de faire marcher. Le reglage explicite est une
-- correction, pas le mode normal.
--
-- LA CONTRAINTE PLUTOT QUE LA CONFIANCE
--
-- Un check en base plutot qu'une simple validation applicative : cette colonne
-- est lue par le widget public, et une valeur inattendue s'y traduirait par une
-- fenetre sans libelles. Le domaine est ferme, autant le dire au moteur.

alter table bots
  add column widget_locale text not null default 'auto'
  check (widget_locale in ('auto', 'fr', 'en'));

comment on column bots.widget_locale is
  'Langue de la fenetre de discussion. « auto » suit la page puis le navigateur du visiteur.';
