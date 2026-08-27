-- Provenance des comptes.
--
-- CE QU'ON GARDE, ET CE QU'ON NE GARDE PAS
--
-- Uniquement l'origine de la visite qui a mene a l'inscription : le DOMAINE
-- referent, et les parametres de campagne que la personne portait dans son
-- adresse. Pas l'URL complete du referent — elle contient parfois la requete
-- tapee dans un moteur, ou le fil de discussion d'ou vient le clic, et cela ne
-- sert a rien pour repondre a « quel canal m'amene des clients ».
--
-- Aucune adresse IP, aucun agent utilisateur, aucun identifiant de visiteur :
-- ces colonnes decrivent une PROVENANCE, pas une personne.
--
-- POURQUOI DES VALEURS BRUTES PLUTOT QU'UN CANAL DEJA CALCULE
--
-- « google.com » devient « Google (organique) » a l'affichage, pas ici. Le
-- classement des referents en canaux va s'affiner — un nouveau partenaire, un
-- domaine mal reconnu — et le recalculer a la lecture permet de corriger tout
-- l'historique d'un coup. Un canal fige a l'ecriture aurait laisse pour
-- toujours les anciennes lignes dans l'ancien classement.
--
-- acq_at EST LA DATE DE LA VISITE, PAS DE L'INSCRIPTION
--
-- C'est ce qui rend l'attribution verifiable : on ne rattache une provenance a
-- un compte que si la visite PRECEDE la creation du compte. Sans cette date,
-- un client inscrit l'an dernier se verrait attribuer la source de sa visite
-- d'aujourd'hui.

alter table profiles
  add column acq_referrer text,
  add column acq_source text,
  add column acq_medium text,
  add column acq_campaign text,
  add column acq_at timestamptz;

comment on column profiles.acq_referrer is
  'Domaine referent de la premiere visite. NULL = acces direct.';
comment on column profiles.acq_source is 'utm_source de la premiere visite.';
comment on column profiles.acq_at is
  'Date de la premiere visite. Une provenance n''est retenue que si elle precede la creation du compte.';
