-- Abonnements Dodo Payments.
--
-- Le portefeuille de credits (0007) savait ce qu'un compte pouvait consommer,
-- mais rien ne savait ce qu'il payait : l'attribution d'un plan se faisait a la
-- main depuis le back-office. Cette migration rattache le compte a son
-- abonnement chez le prestataire.
--
-- PARTAGE DES RESPONSABILITES
--
-- Deux mecanismes touchent au portefeuille, et il faut qu'ils ne se marchent
-- pas dessus :
--
--   consume_credits()  rythme MENSUEL des credits. Inchange. C'est lui, et lui
--                      seul, qui remet `credits_used` a zero tous les mois.
--
--   webhook Dodo       PLAN et STATUT. Il fixe `credits_included` quand le plan
--                      change, et l'annule a l'echeance. Il ne touche jamais au
--                      rythme mensuel.
--
-- Ce partage est ce qui rend l'annuel possible : un abonnement paye a l'annee
-- ne declenche `subscription.renewed` qu'une fois par an, alors que les credits
-- doivent se recharger tous les mois. Si le webhook pilotait le rechargement,
-- un client annuel attendrait douze mois ses credits suivants.

alter table profiles
  -- Identite du client chez Dodo, conservee pour ouvrir le portail de gestion
  -- (annulation, moyen de paiement, factures) sans le recreer a chaque fois.
  add column dodo_customer_id text,

  -- Abonnement en cours. C'est la cle de rapprochement des webhooks : elle est
  -- ecrite des la creation de l'abonnement, avant tout webhook, pour qu'aucun
  -- evenement n'arrive sans destinataire connu.
  add column dodo_subscription_id text,

  -- Reflet du statut cote Dodo : pending, active, on_hold, paused, cancelled,
  -- failed, expired. Volontairement en texte libre plutot qu'en enum : une
  -- valeur ajoutee par le prestataire ne doit pas faire echouer l'ecriture du
  -- webhook, sinon on perd l'evenement entier.
  add column subscription_status text,

  add column billing_period text check (billing_period in ('monthly', 'annual')),

  -- Fin de la periode payee. Un abonnement resilie reste servi jusque-la.
  add column current_period_end timestamptz,
  add column cancel_at_period_end boolean not null default false;

-- Rapprochement des webhooks : une lecture par evenement, sur index.
create unique index profiles_dodo_subscription_idx
  on profiles (dodo_subscription_id)
  where dodo_subscription_id is not null;

create index profiles_dodo_customer_idx
  on profiles (dodo_customer_id)
  where dodo_customer_id is not null;

-- =============================================================================
-- Journal des webhooks recus
--
-- Un webhook peut etre livre plusieurs fois : c'est prevu par la specification,
-- pas un incident. Sans cette table, un `subscription.active` rejoue remettrait
-- `credits_used` a zero une seconde fois et effacerait la consommation reelle
-- du client.
--
-- L'identifiant est celui de l'en-tete `webhook-id`, unique par evenement chez
-- le prestataire. L'insertion sert de verrou : si elle echoue, l'evenement a
-- deja ete traite et on s'arrete la.
-- =============================================================================

create table billing_events (
  id text primary key,
  type text not null,
  subscription_id text,
  received_at timestamptz not null default now()
);

-- Purge : le journal ne sert qu'a la deduplication, pas a l'archivage. Les
-- livraisons repetees arrivent dans les minutes qui suivent, jamais des mois
-- apres. L'index permet de supprimer les vieilles lignes sans balayage.
create index billing_events_received_idx on billing_events (received_at);

-- Aucune politique de lecture : cette table ne sert qu'au serveur, via la cle
-- de service. RLS activee sans policy = personne n'y accede par PostgREST.
alter table billing_events enable row level security;

-- =============================================================================
-- Application d'un changement de plan
--
-- Reunit en une seule transaction ce qui doit rester coherent : le plan, son
-- allocation, la remise a zero du compteur et le redemarrage de la periode.
-- Fait en plusieurs ecritures depuis Node, un incident reseau au milieu
-- laisserait un compte avec le nouveau plan et l'ancienne allocation.
--
-- La remise a zero est voulue, y compris en descente de gamme : c'est la regle
-- retenue, la plus simple a expliquer au support.
-- =============================================================================

create or replace function apply_subscription_plan(
  p_user_id uuid,
  p_plan text,
  p_credits integer,
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
begin
  insert into profiles (user_id) values (p_user_id)
  on conflict (user_id) do nothing;

  update profiles
     set plan = p_plan,
         credits_included = p_credits,
         credits_used = 0,
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
 * Met a jour le statut sans toucher au portefeuille.
 *
 * Sert aux evenements qui ne changent pas ce que le client a droit de
 * consommer : renouvellement, mise en attente, annulation programmee. Separer
 * les deux fonctions evite qu'un `renewed` remette par megarde le compteur a
 * zero — ce qui priverait un client annuel de sa consommation du mois.
 */
create or replace function update_subscription_status(
  p_subscription_id text,
  p_status text,
  p_period_end timestamptz,
  p_cancel_at_period_end boolean
)
returns void
language sql
security definer
set search_path = public
as $$
  update profiles
     set subscription_status = p_status,
         current_period_end = coalesce(p_period_end, current_period_end),
         cancel_at_period_end = p_cancel_at_period_end
   where dodo_subscription_id = p_subscription_id;
$$;

/**
 * Fin d'abonnement : le compte retombe a zero credit.
 *
 * Appelee a l'expiration, jamais a l'annulation. Un client qui resilie a paye
 * sa periode : la lui retirer le jour de sa demande produit des litiges, et
 * n'avance a rien. `plan` repasse a 'trial' pour que le renouvellement
 * mensuel cesse, mais l'allocation reste nulle — les credits de depart ne se
 * redonnent pas, sinon la resiliation deviendrait un essai gratuit renouvelable.
 */
create or replace function end_subscription(p_subscription_id text)
returns void
language sql
security definer
set search_path = public
as $$
  update profiles
     set plan = 'trial',
         credits_included = 0,
         credits_used = 0,
         subscription_status = 'expired',
         cancel_at_period_end = false,
         billing_period = null,
         current_period_end = null
   where dodo_subscription_id = p_subscription_id;
$$;
