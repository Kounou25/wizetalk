-- Alerte de prospect.
--
-- Un visiteur laisse son adresse au moment ou son intention d'achat est la plus
-- forte. Jusqu'ici, le proprietaire ne l'apprenait qu'en ouvrant son tableau de
-- bord : un contact pouvait dormir plusieurs jours. C'est exactement le client
-- perdu que le produit promet d'eviter.

-- Interrupteur par assistant. Certains clients branchent deja leur propre
-- formulaire et ne veulent pas d'un second canal.
alter table bots
  add column notify_leads boolean not null default true;

comment on column bots.notify_leads is
  'Prevenir le proprietaire par e-mail des qu''un prospect est capture.';

-- =============================================================================
-- Langue du compte
--
-- POURQUOI EN BASE ET PAS DANS UN COOKIE
--
-- La langue vit dans un cookie, ce qui suffit tant qu'on rend une page : la
-- requete la porte. Mais un message declenche par un webhook ou par la capture
-- d'un prospect n'a AUCUN contexte de requete — le visiteur qui declenche
-- l'envoi n'est pas le destinataire, et sa langue n'a rien a voir avec celle du
-- proprietaire.
--
-- Sans cette colonne, ces messages partent tous en francais par defaut. Elle
-- corrige aussi l'e-mail de facture, qui dependait jusqu'ici d'une metadonnee
-- recopiee chez le prestataire de paiement.
-- =============================================================================

alter table profiles
  add column locale text not null default 'fr'
    check (locale in ('fr', 'en'));

comment on column profiles.locale is
  'Langue des messages sortants. Mise a jour quand l''utilisateur en change.';
