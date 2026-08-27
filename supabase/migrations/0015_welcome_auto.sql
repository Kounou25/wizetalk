-- Message d'accueil facultatif.
--
-- LE PROBLEME
--
-- La colonne portait un defaut francais, ecrit par nous : « Bonjour ! Comment
-- puis-je vous aider ? ». Chaque assistant naissait donc avec une phrase
-- francaise en base, indistinguable d'une phrase choisie par son proprietaire.
-- Sur la version anglaise d'un site, la fenetre saluait en francais — et rien,
-- dans la donnee, ne permettait de savoir qu'on pouvait la traduire.
--
-- LA CORRECTION
--
-- La colonne devient nullable, et NULL prend un sens precis : « pas de message
-- choisi, utilise celui de Deezy dans la langue du visiteur ». Le defaut SQL
-- disparait, sans quoi les nouveaux assistants reviendraient au meme point.
--
-- POURQUOI CE UPDATE EST SUR
--
-- Il ne vide que les lignes dont le texte est EXACTEMENT le defaut d'origine,
-- caractere pour caractere. Une phrase ecrite par un proprietaire n'est jamais
-- touchee — et si quelqu'un avait retape ce texte a l'identique, le resultat
-- affiche reste le meme, simplement traduit pour les visiteurs anglophones.
--
-- Au moment de la migration, les 7 assistants existants portaient tous ce
-- defaut : aucun message reellement redige n'est en jeu.

alter table bots
  alter column welcome_message drop default,
  alter column welcome_message drop not null;

update bots
   set welcome_message = null
 where welcome_message = 'Bonjour ! Comment puis-je vous aider ?';

comment on column bots.welcome_message is
  'Accueil choisi par le proprietaire. NULL = celui de Deezy, dans la langue du visiteur.';
