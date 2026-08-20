-- Back-office d'administration.
--
-- Deux tables volontairement minuscules : qui est administrateur, et ce que
-- les administrateurs ont fait. Le back-office lit les donnees de TOUS les
-- comptes, il contourne donc RLS via le service_role — d'ou la necessite d'une
-- trace.

create table admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

/*
 * Journal des actions d'administration.
 *
 * Un back-office agit sur les donnees d'autrui : sans trace, personne ne peut
 * dire qui a desactive quel assistant, ni quand. `actor_email` est duplique
 * volontairement — le compte peut disparaitre, la trace doit rester lisible.
 */
create table admin_audit (
  id uuid primary key default gen_random_uuid(),

  actor_id uuid references auth.users(id) on delete set null,
  actor_email text not null,

  action text not null,
  target_type text not null,
  target_id text,
  detail jsonb not null default '{}',

  created_at timestamptz not null default now()
);

create index admin_audit_created_idx on admin_audit (created_at desc);

-- =============================================================================
-- Row Level Security
--
-- Ces deux tables n'ont AUCUNE politique, deliberement : RLS activee sans
-- politique bloque tout le monde. Seul le service_role, qui contourne RLS,
-- y accede — c'est-a-dire uniquement le code serveur passe par requireAdmin().
--
-- Consequence importante : un utilisateur ne peut pas lire la table `admins`,
-- donc il ne peut meme pas decouvrir qui administre la plateforme.
-- =============================================================================

alter table admins enable row level security;
alter table admin_audit enable row level security;

-- =============================================================================
-- Premier administrateur
--
-- Il ne peut pas etre cree par l'interface : personne n'y a acces tant que
-- cette table est vide. A executer une fois, avec votre adresse :
--
--   insert into admins (user_id)
--   select id from auth.users where email = 'vous@exemple.com';
--
-- Les suivants se nomment depuis /admin/users.
-- =============================================================================
