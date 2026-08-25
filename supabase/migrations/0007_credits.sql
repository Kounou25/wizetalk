-- Credits : un portefeuille unique par compte.
--
-- POURQUOI REMPLACER LE QUOTA PAR ASSISTANT
--
-- `bots.messages_quota` comptait les reponses, par assistant, et ne comptait
-- rien d'autre. Trois consequences :
--
--   1. L'indexation etait gratuite et illimitee. Explorer une page ou traiter
--      un document appelle Gemini (lib/embeddings.ts) et coute de l'argent ;
--      aucun compteur ne le voyait. Un client pouvait resynchroniser un site
--      de cent pages tous les jours sans jamais entamer son quota.
--
--   2. Un plan vendu « 3 assistants » donnait trois fois le quota, puisque le
--      compteur vivait sur le bot. Le palier ne voulait plus rien dire.
--
--   3. Rien ne remettait le compteur a zero. « X reponses par mois » etait
--      donc faux : c'etait un compteur a vie, jusqu'a intervention d'un
--      administrateur.
--
-- Un credit unique, porte par le compte, corrige les trois : tout ce qui coute
-- puise au meme endroit, le plan est vendu au compte, et le renouvellement est
-- calcule a la demande.

alter table profiles
  add column plan text not null default 'trial'
    check (plan in ('trial', 'essential', 'growth', 'business')),

  -- Credits alloues pour la periode en cours. Stocke plutot que deduit du
  -- plan : un administrateur peut ajuster un compte au cas par cas sans
  -- inventer un palier sur mesure.
  add column credits_included integer not null default 300,
  add column credits_used integer not null default 0,

  -- Debut de la periode de facturation. Sert au renouvellement paresseux.
  add column period_started_at timestamptz not null default now();

comment on column profiles.plan is
  'trial = credits de depart, jamais renouveles.';

-- =============================================================================
-- Creation du profil a l'inscription
--
-- La ligne etait creee paresseusement, a la premiere arrivee sur le tableau de
-- bord. Elle porte desormais le portefeuille : elle doit exister des que le
-- compte existe, y compris pour un utilisateur qui n'ouvre jamais le tableau
-- de bord mais dont l'assistant recoit des visiteurs.
-- =============================================================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Comptes deja inscrits, qui n'ont pas encore de ligne.
insert into profiles (user_id)
select id from auth.users
on conflict (user_id) do nothing;

-- =============================================================================
-- Consommation
-- =============================================================================

/**
 * Debite le compte proprietaire d'un assistant.
 *
 * Retourne `allowed = false` sans rien debiter si le solde est insuffisant :
 * l'appelant decide alors quoi faire — dans notre cas, se replier sur la
 * capture d'e-mail plutot que de couper le service.
 *
 * `for update` verrouille la ligne le temps de la transaction. Sans ce verrou,
 * deux visiteurs qui ecrivent a la meme seconde liraient le meme solde et
 * consommeraient tous deux le dernier credit.
 */
create or replace function consume_credits(p_bot_id uuid, p_amount integer)
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
   * invisible, qui prive le client de ses credits sans que personne ne le
   * remarque. Ici le renouvellement se produit forcement, puisqu'il se produit
   * au moment ou l'on en a besoin.
   *
   * L'essai est exclu : des credits de depart qui se rechargeraient tous les
   * mois seraient un plan gratuit perpetuel.
   */
  if v_profile.plan <> 'trial' then
    v_periods :=
      (extract(year from age(now(), v_profile.period_started_at))::integer * 12)
      + extract(month from age(now(), v_profile.period_started_at))::integer;

    if v_periods > 0 then
      update profiles
         set credits_used = 0,
             period_started_at =
               v_profile.period_started_at + (v_periods || ' months')::interval
       where user_id = v_user_id
       returning * into v_profile;
    end if;
  end if;

  if v_profile.credits_used + p_amount > v_profile.credits_included then
    return query
      select false, greatest(0, v_profile.credits_included - v_profile.credits_used);
    return;
  end if;

  update profiles
     set credits_used = credits_used + p_amount
   where user_id = v_user_id
   returning * into v_profile;

  return query select true, v_profile.credits_included - v_profile.credits_used;
end;
$$;

/**
 * Solde affichable, sans effet de bord.
 *
 * Presente une periode echue comme deja remise a zero, alors que le compteur
 * en base ne le sera qu'au prochain debit. Le client doit voir son solde reel
 * le jour du renouvellement, pas attendre qu'un visiteur pose une question.
 */
create or replace function credit_balance(p_user_id uuid)
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
    p.credits_included,
    case
      when p.plan <> 'trial'
       and age(now(), p.period_started_at) >= interval '1 month' then 0
      else p.credits_used
    end,
    p.period_started_at
  from profiles p
  where p.user_id = p_user_id;
$$;

-- Chacun lit son propre solde ; le debit passe par le serveur.
grant execute on function credit_balance(uuid) to authenticated;

-- =============================================================================
-- Retrait de l'ancien quota
--
-- Conserve en colonne le temps d'une migration applicative serait la garantie
-- que deux compteurs coexistent et divergent. Les valeurs consommees jusqu'ici
-- n'ont pas de sens dans la nouvelle unite : on repart du portefeuille.
-- =============================================================================

alter table bots
  drop column if exists messages_used,
  drop column if exists messages_quota;
