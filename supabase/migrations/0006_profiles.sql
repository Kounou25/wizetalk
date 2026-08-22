-- Profils : un marqueur par compte, pour ce qui ne doit se produire qu'une fois.
--
-- POURQUOI UNE TABLE PLUTOT QU'UN ENVOI A L'INSCRIPTION
--
-- Il existe deux chemins d'inscription — mot de passe et Google OAuth — qui ne
-- passent pas par le meme code. Brancher l'envoi sur l'un des deux revient a
-- l'oublier pour l'autre, et un futur fournisseur creerait un troisieme trou.
--
-- Le marqueur inverse la logique : au lieu de deviner ou l'inscription a eu
-- lieu, on constate a la premiere arrivee sur le tableau de bord que le
-- message n'a pas encore ete envoye. Une seule verification couvre tous les
-- chemins, presents et futurs, et reste exacte meme si l'envoi echoue.

create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,

  -- Null tant que le message de bienvenue n'est pas parti. Sert de verrou :
  -- on l'ecrit AVANT d'envoyer, pour qu'un double chargement de page
  -- n'expedie pas deux messages.
  welcome_email_sent_at timestamptz,

  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Chacun ne voit que sa propre ligne. L'ecriture passe par le serveur
-- (service_role) : rien ne justifie qu'un client marque lui-meme son
-- accueil comme envoye.
create policy profiles_select on profiles for select
  using (auth.uid() = user_id);
