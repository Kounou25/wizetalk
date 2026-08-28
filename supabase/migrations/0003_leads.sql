-- Capture de prospects sur refus, et rapport des questions sans reponse.
--
-- Quand l'assistant ne sait pas, il dit aujourd'hui « contactez l'entreprise »
-- et le visiteur s'en va  au moment precis ou son intention est la plus forte.
-- Ces deux ajouts transforment ce cul-de-sac en boucle :
--   le visiteur laisse son e-mail → le client voit le trou dans son contenu
--   → il complete son site → il resynchronise.

-- Marque explicitement les reponses ou l'assistant a refuse faute de contenu
-- pertinent. On pourrait le deduire d'un tableau `sources` vide, mais une
-- colonne dediee reste juste meme si la logique de sources evolue.
alter table messages
  add column refused boolean not null default false;

-- Index partiel : le rapport ne lit que les refus, qui restent minoritaires.
create index messages_refused_idx on messages (created_at desc) where refused;

-- Interrupteur par assistant : certains clients ne veulent pas collecter
-- d'adresses, ou ont deja un formulaire ailleurs.
alter table bots
  add column lead_capture boolean not null default true;

create table leads (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid not null references bots(id) on delete cascade,

  -- Conservee a null si la conversation est purgee : le prospect vaut par
  -- lui-meme, meme sans le fil qui l'a produit.
  conversation_id uuid references conversations(id) on delete set null,

  email text not null,
  -- La question restee sans reponse : c'est elle qui donne le contexte au
  -- rappel, et elle evite au client de rouvrir la conversation.
  question text not null,

  status text not null default 'new' check (status in ('new', 'handled')),

  created_at timestamptz not null default now()
);

create index leads_bot_id_idx on leads (bot_id, created_at desc);
create index leads_status_idx on leads (bot_id, status);

-- =============================================================================
-- Row Level Security
--
-- Meme regle que partout : on ne voit que ce qui pend a un bot dont on est
-- proprietaire. L'ecriture passe par le serveur (service_role) puisque le
-- visiteur qui laisse son adresse n'a aucune session.
-- =============================================================================

alter table leads enable row level security;

create policy leads_select on leads for select
  using (exists (
    select 1 from bots b where b.id = leads.bot_id and b.user_id = auth.uid()
  ));

-- Le proprietaire peut marquer un prospect comme traite.
create policy leads_update on leads for update
  using (exists (
    select 1 from bots b where b.id = leads.bot_id and b.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from bots b where b.id = leads.bot_id and b.user_id = auth.uid()
  ));

create policy leads_delete on leads for delete
  using (exists (
    select 1 from bots b where b.id = leads.bot_id and b.user_id = auth.uid()
  ));
