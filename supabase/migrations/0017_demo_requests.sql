-- Demandes de demonstration et de contact commercial (page Enterprise).
--
-- POURQUOI UNE TABLE, ET PAS `leads`
--
-- `leads` porte un `bot_id` non nul et sa politique RLS lit `bots.user_id` :
-- un prospect y appartient au proprietaire de l'assistant qui l'a capture.
-- Une demande Enterprise n'a pas d'assistant, pas de proprietaire, et ne doit
-- etre lue que par nous. La ranger dans `leads` aurait force un bot fictif et
-- une exception dans chaque politique existante.
--
-- CE QU'ON DEMANDE, ET CE QU'ON NE DEMANDE PAS
--
-- Six champs, dont trois obligatoires. Le poste, l'effectif, le budget et le
-- calendrier sont ce qu'un formulaire de qualification demanderait  et ce qui
-- fait abandonner un directeur qui voulait juste ouvrir une conversation. Ils
-- se demandent pendant l'echange, ou ils ne coutent rien.
--
-- `intent` EST UNE MESURE, PAS UNE ETIQUETTE
--
-- La page affiche deux libelles menant au meme formulaire : « demander une
-- demo » et « parler a notre equipe ». Enregistrer lequel a ete clique est le
-- seul moyen de savoir lequel amene des rendez-vous  et de reordonner les
-- boutons sur une donnee plutot que sur une intuition.

create table demo_requests (
  id uuid primary key default gen_random_uuid(),

  -- Quel bouton a mene ici. Voir le commentaire d'en-tete.
  intent text not null default 'demo' check (intent in ('demo', 'contact')),

  full_name text not null,
  email text not null,
  company text not null,

  -- Facultatifs : un site en cours de refonte ou un secteur qui n'entre dans
  -- aucune case ne doivent pas empecher la prise de contact.
  website text,
  industry text,
  message text,

  -- Langue de la page au moment de l'envoi : c'est dans celle-la qu'il faut
  -- repondre, et elle ne se devine pas depuis l'adresse e-mail.
  locale text not null default 'fr' check (locale in ('fr', 'en')),

  -- Provenance de la premiere visite, reprise du cookie pose par le proxy.
  -- Memes colonnes que `profiles` (migration 0016) et meme regle : un domaine
  -- et des parametres de campagne, jamais d'adresse IP ni d'agent utilisateur.
  acq_referrer text,
  acq_source text,
  acq_medium text,
  acq_campaign text,
  acq_at timestamptz,

  -- Suivi commercial depuis le back-office.
  status text not null default 'new'
    check (status in ('new', 'contacted', 'qualified', 'closed')),

  created_at timestamptz not null default now()
);

-- Le back-office liste par date decroissante, et filtre par etat.
create index demo_requests_created_idx on demo_requests (created_at desc);
create index demo_requests_status_idx on demo_requests (status, created_at desc);

-- Sert au garde-fou anti-doublon de l'action serveur : une meme adresse qui
-- renvoie le formulaire dans l'heure ne cree pas une seconde ligne.
create index demo_requests_email_idx on demo_requests (email, created_at desc);

-- =============================================================================
-- Row Level Security
--
-- ACTIVEE SANS AUCUNE POLITIQUE, ET C'EST VOLONTAIRE
--
-- Sous RLS, l'absence de politique signifie « personne ». Ni la cle anonyme ni
-- un utilisateur connecte ne peuvent lire, ecrire ou modifier cette table :
-- seul `service_role`, qui contourne RLS, y accede  c'est-a-dire l'action
-- serveur qui enregistre la demande, et le back-office qui la relit apres
-- requireAdmin().
--
-- C'est plus sur que le modele de `leads`, ou une politique de lecture existe
-- parce qu'un client legitime doit voir SES prospects. Ici, aucun client n'a
-- de raison de voir quoi que ce soit.
--
-- Consequence a garder en tete : toute lecture depuis une page doit passer par
-- createAdminClient(), donc par requireAdmin(). Une page qui utiliserait le
-- client de session recevrait une liste vide, sans erreur.
-- =============================================================================

alter table demo_requests enable row level security;

comment on table demo_requests is
  'Demandes de demo et de contact commercial issues de la page Enterprise. Acces service_role uniquement : RLS active sans politique.';

comment on column demo_requests.intent is
  'Bouton d''origine : demo (#demo) ou contact (#contact). Sert a mesurer lequel convertit.';
