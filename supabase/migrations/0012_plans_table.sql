-- Les paliers deviennent des donnees.
--
-- POURQUOI SORTIR CES NOMBRES DU CODE
--
-- Les memes limites etaient ecrites a deux endroits : lib/plans.ts, que le code
-- applique, et les dictionnaires, que la page de tarifs annonce. Elles
-- concordaient parce qu'on les synchronisait a la main. Une seule table les
-- rassemble, et la page de tarifs lit desormais ce que le produit applique
-- reellement — elle ne peut plus promettre autre chose.
--
-- CE QUI N'ENTRE PAS DANS CETTE TABLE : LE PRIX
--
-- Le prix reel est celui du produit chez le prestataire de paiement. Le stocker
-- ici laisserait un administrateur afficher 25 $ alors que 19 $ sont preleves,
-- sans qu'aucune alerte ne se declenche. Le back-office affiche le prix lu chez
-- le prestataire, en lecture seule : on voit l'ecart, on le corrige la ou il
-- compte.

create table plans (
  id text primary key check (id in ('trial', 'essential', 'growth', 'business')),

  -- Messages inclus par mois. L'essai ne se renouvelle jamais.
  messages integer not null check (messages >= 0),

  bots integer not null check (bots >= 0),
  -- Pages explorables par assistant. Borne le cout d'indexation.
  pages integer not null check (pages >= 0),
  -- `null` vaut illimite : c'est precisement l'argument du palier le plus haut.
  documents integer check (documents is null or documents >= 0),

  gaps_report boolean not null default false,
  remove_branding boolean not null default false,
  priority_support boolean not null default false,

  updated_at timestamptz not null default now()
);

comment on table plans is
  'Source unique des limites appliquees ET annoncees. Le prix vit chez le prestataire de paiement.';

-- Valeurs actuelles, reprises telles quelles de lib/plans.ts.
insert into plans (id, messages, bots, pages, documents, gaps_report, remove_branding, priority_support)
values
  ('trial',       100,  1,   50,    5, false, false, false),
  ('essential', 1000,  1,  100,   20, false, false, false),
  ('growth',    5000,  3,  500,  100,  true, false, false),
  ('business', 20000, 10, 2000, null,  true,  true,  true);

create trigger plans_set_updated_at
  before update on plans
  for each row execute function set_updated_at();

-- =============================================================================
-- Lecture
--
-- La grille est publique : elle est affichee sur la page de tarifs, sans
-- session. La rendre lisible par tous evite d'avoir a la recopier cote client.
-- L'ecriture passe par le serveur, avec le controle d'administration.
-- =============================================================================

alter table plans enable row level security;

create policy plans_select on plans for select using (true);

grant select on plans to anon, authenticated;

-- =============================================================================
-- Les fonctions lisent la table plutot qu'un nombre fige
-- =============================================================================

/**
 * Applique un plan a un compte : quota, remise a zero, redemarrage de periode.
 *
 * Le quota n'est plus passe en parametre mais lu dans `plans` : l'appelant ne
 * peut plus accorder un volume qui ne correspond a aucun palier, meme par
 * erreur.
 */
drop function if exists apply_subscription_plan(
  uuid, text, integer, text, text, text, text, timestamptz, boolean
);

create or replace function apply_subscription_plan(
  p_user_id uuid,
  p_plan text,
  p_subscription_id text,
  p_customer_id text,
  p_status text,
  p_billing_period text,
  p_period_end timestamptz,
  p_cancel_at_period_end boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_messages integer;
begin
  select messages into v_messages from plans where id = p_plan;

  if v_messages is null then
    raise exception 'Palier inconnu : %', p_plan;
  end if;

  insert into profiles (user_id) values (p_user_id)
  on conflict (user_id) do nothing;

  update profiles
     set plan = p_plan,
         messages_included = v_messages,
         messages_used = 0,
         period_started_at = now(),
         dodo_subscription_id = coalesce(p_subscription_id, dodo_subscription_id),
         dodo_customer_id = coalesce(p_customer_id, dodo_customer_id),
         subscription_status = p_status,
         billing_period = p_billing_period,
         current_period_end = p_period_end,
         cancel_at_period_end = p_cancel_at_period_end
   where user_id = p_user_id;
end;
$$;

/**
 * Repercute un changement de palier sur les comptes qui l'utilisent.
 *
 * Sans cela, modifier un palier depuis le back-office ne changerait rien pour
 * les abonnes en cours : ils garderaient le quota fige au jour de leur
 * activation, et decouvriraient le nouveau seulement au renouvellement suivant.
 *
 * Le compteur consomme n'est PAS remis a zero : le client garde ce qu'il a
 * deja utilise ce mois-ci. Seul le plafond bouge.
 */
create or replace function sync_plan_quota(p_plan text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_messages integer;
  v_count integer;
begin
  select messages into v_messages from plans where id = p_plan;
  if v_messages is null then
    raise exception 'Palier inconnu : %', p_plan;
  end if;

  update profiles
     set messages_included = v_messages
   where plan = p_plan;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;
