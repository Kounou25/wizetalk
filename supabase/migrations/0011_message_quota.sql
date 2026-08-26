-- Retour au quota de messages.
--
-- POURQUOI ABANDONNER LE CREDIT
--
-- Le credit (0007) couvrait tout ce qui coute : repondre, explorer une page,
-- traiter un document. C'etait juste economiquement, et opaque
-- commercialement — « 5 000 credits » oblige l'acheteur a apprendre une unite
-- maison avant de pouvoir juger le prix.
--
-- Le message se comprend sans explication. Ce que le credit bornait du cote de
-- l'indexation est repris par des plafonds definis dans lib/plans.ts : nombre
-- de pages, de documents et d'assistants. Ils bornent le meme cout Gemini, et
-- se lisent comme un avantage plutot que comme un compteur.
--
-- Les colonnes sont RENOMMEES, pas recreees : les valeurs deja consommees
-- gardent leur sens — un credit depense sur une reponse etait deja un message.
-- Ce qui disparait, c'est la part consommee par l'indexation, ce qui joue en
-- faveur du client.

alter table profiles
  rename column credits_included to messages_included;

alter table profiles
  rename column credits_used to messages_used;

comment on column profiles.messages_included is
  'Messages inclus pour la periode. Les plafonds de pages et de documents vivent dans lib/plans.ts.';

-- Les allocations changent d'unite sans changer de valeur : un plan a 1 000
-- credits devient un plan a 1 000 messages. Seul l'essai est reajuste, ses
-- credits couvrant auparavant l'indexation.
update profiles set messages_included = 100
 where plan = 'trial' and messages_included = 300;

-- =============================================================================
-- Debit
-- =============================================================================

drop function if exists consume_credits(uuid, integer);

/**
 * Debite un message au compte proprietaire d'un assistant.
 *
 * Retourne `allowed = false` sans rien debiter si le quota est epuise :
 * l'appelant se replie alors sur la capture d'e-mail plutot que de couper le
 * service.
 *
 * `for update` verrouille la ligne le temps de la transaction. Sans ce verrou,
 * deux visiteurs qui ecrivent a la meme seconde liraient le meme solde et
 * consommeraient tous deux le dernier message.
 */
create or replace function consume_message(p_bot_id uuid)
returns table (allowed boolean, remaining integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_profile profiles%rowtype;
  v_periods integer;
begin
  select b.user_id into v_user_id from bots b where b.id = p_bot_id;

  if v_user_id is null then
    return query select false, 0;
    return;
  end if;

  select * into v_profile from profiles p where p.user_id = v_user_id for update;

  if not found then
    insert into profiles (user_id) values (v_user_id) returning * into v_profile;
  end if;

  /*
   * Renouvellement paresseux, calcule au moment du debit.
   *
   * Pas de tache planifiee : une tache qui ne s'execute pas est une panne
   * invisible, qui prive le client de son quota sans que personne ne le
   * remarque. Ici le renouvellement se produit forcement, puisqu'il se produit
   * au moment ou l'on en a besoin.
   *
   * L'essai est exclu : des messages offerts qui se rechargeraient tous les
   * mois seraient un plan gratuit perpetuel.
   *
   * C'est aussi ce qui rend l'abonnement annuel possible : il ne declenche
   * `subscription.renewed` qu'une fois par an, alors que le quota doit se
   * recharger tous les mois.
   */
  if v_profile.plan <> 'trial' then
    v_periods :=
      (extract(year from age(now(), v_profile.period_started_at))::integer * 12)
      + extract(month from age(now(), v_profile.period_started_at))::integer;

    if v_periods > 0 then
      update profiles
         set messages_used = 0,
             period_started_at =
               v_profile.period_started_at + (v_periods || ' months')::interval
       where user_id = v_user_id
       returning * into v_profile;
    end if;
  end if;

  if v_profile.messages_used >= v_profile.messages_included then
    return query select false, 0;
    return;
  end if;

  update profiles
     set messages_used = messages_used + 1
   where user_id = v_user_id
   returning * into v_profile;

  return query
    select true, greatest(0, v_profile.messages_included - v_profile.messages_used);
end;
$$;

-- =============================================================================
-- Lecture
-- =============================================================================

drop function if exists credit_balance(uuid);

/**
 * Solde affichable, sans effet de bord.
 *
 * Presente une periode echue comme deja remise a zero, alors que le compteur
 * en base ne le sera qu'au prochain debit. Le client doit voir son solde reel
 * le jour du renouvellement, pas attendre qu'un visiteur pose une question.
 */
create or replace function message_balance(p_user_id uuid)
returns table (
  plan text,
  included integer,
  used integer,
  period_started_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.plan,
    p.messages_included,
    case
      when p.plan <> 'trial'
       and age(now(), p.period_started_at) >= interval '1 month' then 0
      else p.messages_used
    end,
    p.period_started_at
  from profiles p
  where p.user_id = p_user_id;
$$;

grant execute on function message_balance(uuid) to authenticated;

-- =============================================================================
-- Application d'un plan
--
-- Meme fonction qu'en 0008, le parametre changeant simplement d'unite.
-- =============================================================================

drop function if exists apply_subscription_plan(
  uuid, text, integer, text, text, text, text, timestamptz, boolean
);

create or replace function apply_subscription_plan(
  p_user_id uuid,
  p_plan text,
  p_messages integer,
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
         messages_included = p_messages,
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

/** Fin d'abonnement : le compte retombe a zero message. */
create or replace function end_subscription(p_subscription_id text)
returns void
language sql
security definer
set search_path = public
as $$
  update profiles
     set plan = 'trial',
         messages_included = 0,
         messages_used = 0,
         subscription_status = 'expired',
         cancel_at_period_end = false,
         billing_period = null,
         current_period_end = null
   where dodo_subscription_id = p_subscription_id;
$$;

-- Les nouveaux comptes demarrent avec l'essai.
alter table profiles
  alter column messages_included set default 100;
