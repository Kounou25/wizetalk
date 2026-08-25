import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import { PLANS, type PlanId } from '@/lib/credits';

/**
 * Lectures du back-office.
 *
 * Chaque fonction recoit le client privilegie rendu par requireAdmin() — elle
 * ne le fabrique jamais elle-meme. C'est ce qui garantit qu'aucune de ces
 * requetes ne peut s'executer sans controle prealable.
 */

type Db = SupabaseClient;

export interface PlatformStats {
  users: number;
  bots: number;
  activeBots: number;
  pages: number;
  chunks: number;
  conversations: number;
  messages: number;
  unanswered: number;
  leads: number;
}

async function countOf(db: Db, table: string, filter?: (q: never) => never): Promise<number> {
  void filter;
  const { count } = await db.from(table).select('*', { count: 'exact', head: true });
  return count ?? 0;
}

export async function getPlatformStats(db: Db): Promise<PlatformStats> {
  const [
    { data: usersData },
    bots,
    activeBots,
    pages,
    chunks,
    conversations,
    messages,
    unanswered,
    leads,
  ] = await Promise.all([
    db.auth.admin.listUsers({ page: 1, perPage: 1 }),
    countOf(db, 'bots'),
    db.from('bots').select('*', { count: 'exact', head: true }).eq('is_active', true),
    countOf(db, 'pages'),
    countOf(db, 'chunks'),
    countOf(db, 'conversations'),
    countOf(db, 'messages'),
    db.from('messages').select('*', { count: 'exact', head: true }).eq('refused', true),
    countOf(db, 'leads'),
  ]);

  return {
    // listUsers ne renvoie pas de compteur : `total` vient de la pagination.
    users: (usersData as { total?: number } | null)?.total ?? 0,
    bots,
    activeBots: activeBots.count ?? 0,
    pages,
    chunks,
    conversations,
    messages,
    unanswered: unanswered.count ?? 0,
    leads,
  };
}

export interface AdminUserRow {
  id: string;
  email: string;
  /** Renseigne par Google, ou saisi a l'inscription par e-mail. */
  fullName: string | null;
  /** Photo de profil du fournisseur d'identite, si le compte en a une. */
  avatarUrl: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  isAdmin: boolean;
  botCount: number;
  plan: PlanId;
  creditsIncluded: number;
  creditsUsed: number;
}

/**
 * Tous les comptes, avec leur portefeuille.
 *
 * Les utilisateurs vivent dans auth.users, hors de portee de PostgREST : on
 * passe par l'API d'administration, puis on rattache les compteurs par trois
 * lectures a plat plutot qu'une requete par compte.
 *
 * Les credits viennent de `profiles` et non de `bots` : depuis 0007_credits le
 * portefeuille est unique et porte par le compte. `bots` ne sert plus qu'a
 * compter les assistants.
 */
export async function listUsers(db: Db, limit = 200): Promise<AdminUserRow[]> {
  const { data } = await db.auth.admin.listUsers({ page: 1, perPage: limit });
  const users = data?.users ?? [];

  const [{ data: bots }, { data: admins }, { data: profiles }] = await Promise.all([
    db.from('bots').select('user_id'),
    db.from('admins').select('user_id'),
    db.from('profiles').select('user_id, plan, credits_included, credits_used'),
  ]);

  const adminIds = new Set((admins ?? []).map((row) => row.user_id as string));

  const botCounts = new Map<string, number>();
  for (const bot of bots ?? []) {
    const key = bot.user_id as string;
    botCounts.set(key, (botCounts.get(key) ?? 0) + 1);
  }

  const wallets = new Map(
    (profiles ?? []).map((row) => [
      row.user_id as string,
      {
        plan: (row.plan as PlanId) ?? 'trial',
        included: (row.credits_included as number) ?? 0,
        used: (row.credits_used as number) ?? 0,
      },
    ]),
  );

  return users
    .map((user) => {
      const wallet = wallets.get(user.id);
      /*
       * Google renseigne `avatar_url` et `picture` avec la meme valeur, mais
       * un autre fournisseur pourrait n'en poser qu'une. On lit les deux.
       */
      const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
      const photo = metadata.avatar_url ?? metadata.picture;
      const name = metadata.full_name ?? metadata.name;

      return {
        id: user.id,
        email: user.email ?? '—',
        fullName: typeof name === 'string' && name ? name : null,
        avatarUrl: typeof photo === 'string' && photo ? photo : null,
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at ?? null,
        isAdmin: adminIds.has(user.id),
        botCount: botCounts.get(user.id) ?? 0,
        plan: wallet?.plan ?? ('trial' as PlanId),
        creditsIncluded: wallet?.included ?? 0,
        creditsUsed: wallet?.used ?? 0,
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export interface AdminBotRow {
  id: string;
  name: string;
  websiteUrl: string;
  status: string;
  isActive: boolean;
  ownerEmail: string;
  lastSyncedAt: string | null;
  createdAt: string;
  faviconUrl: string | null;
  pages: number;
  conversations: number;
}

export async function listBots(db: Db, limit = 200): Promise<AdminBotRow[]> {
  const { data: bots } = await db
    .from('bots')
    .select(
      'id, user_id, name, website_url, status, is_active, last_synced_at, created_at, favicon_url',
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!bots || bots.length === 0) return [];

  const ids = bots.map((bot) => bot.id as string);

  const [{ data: users }, { data: pages }, { data: conversations }] = await Promise.all([
    db.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    db.from('pages').select('bot_id').in('bot_id', ids),
    db.from('conversations').select('bot_id').in('bot_id', ids),
  ]);

  const emailById = new Map(
    (users?.users ?? []).map((user) => [user.id, user.email ?? '—'] as const),
  );

  const tally = (rows: { bot_id: string }[] | null) => {
    const map = new Map<string, number>();
    for (const row of rows ?? []) map.set(row.bot_id, (map.get(row.bot_id) ?? 0) + 1);
    return map;
  };

  const pageCounts = tally(pages as { bot_id: string }[] | null);
  const conversationCounts = tally(conversations as { bot_id: string }[] | null);

  return bots.map((bot) => ({
    id: bot.id as string,
    name: bot.name as string,
    websiteUrl: bot.website_url as string,
    status: bot.status as string,
    isActive: bot.is_active as boolean,
    ownerEmail: emailById.get(bot.user_id as string) ?? '—',
    lastSyncedAt: (bot.last_synced_at as string | null) ?? null,
    createdAt: bot.created_at as string,
    faviconUrl: (bot.favicon_url as string | null) ?? null,
    pages: pageCounts.get(bot.id as string) ?? 0,
    conversations: conversationCounts.get(bot.id as string) ?? 0,
  }));
}

export interface AuditRow {
  id: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string | null;
  detail: Record<string, unknown>;
  createdAt: string;
}

export async function listAudit(db: Db, limit = 200): Promise<AuditRow[]> {
  const { data } = await db
    .from('admin_audit')
    .select('id, actor_email, action, target_type, target_id, detail, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => ({
    id: row.id as string,
    actorEmail: row.actor_email as string,
    action: row.action as string,
    targetType: row.target_type as string,
    targetId: (row.target_id as string | null) ?? null,
    detail: (row.detail as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
  }));
}

// =============================================================================
// Facturation
// =============================================================================

export interface SubscriptionRow {
  userId: string;
  email: string;
  plan: PlanId;
  status: string | null;
  billingPeriod: 'monthly' | 'annual' | null;
  creditsIncluded: number;
  creditsUsed: number;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  subscriptionId: string | null;
  customerId: string | null;
  createdAt: string;
}

export interface BillingStats {
  /** Revenu mensuel recurrent, en dollars. L'annuel est ramene au mois. */
  mrr: number;
  active: number;
  trials: number;
  /** Abonnements resilies qui courent encore jusqu'a l'echeance. */
  cancelling: number;
  /** Paiement en echec ou abonnement suspendu : a relancer. */
  atRisk: number;
  perPlan: Record<string, number>;
}

/**
 * Tous les comptes ayant une trace de facturation, du plus recent au plus
 * ancien.
 *
 * Les adresses vivent dans auth.users, hors de portee de PostgREST : on lit les
 * profils puis on rattache les adresses par une seule requete d'administration,
 * plutot qu'une par ligne.
 */
export async function listSubscriptions(db: Db, limit = 200): Promise<SubscriptionRow[]> {
  const [{ data: profiles }, { data: usersData }] = await Promise.all([
    db
      .from('profiles')
      .select(
        'user_id, plan, credits_included, credits_used, subscription_status, billing_period, current_period_end, cancel_at_period_end, dodo_subscription_id, dodo_customer_id, created_at',
      )
      .order('created_at', { ascending: false })
      .limit(limit),
    db.auth.admin.listUsers({ page: 1, perPage: limit }),
  ]);

  const emails = new Map(
    (usersData?.users ?? []).map((user) => [user.id, user.email ?? '—']),
  );

  return (profiles ?? []).map((row) => ({
    userId: row.user_id as string,
    email: emails.get(row.user_id as string) ?? '—',
    plan: ((row.plan as PlanId) ?? 'trial') as PlanId,
    status: (row.subscription_status as string | null) ?? null,
    billingPeriod: (row.billing_period as 'monthly' | 'annual' | null) ?? null,
    creditsIncluded: (row.credits_included as number) ?? 0,
    creditsUsed: (row.credits_used as number) ?? 0,
    currentPeriodEnd: (row.current_period_end as string | null) ?? null,
    cancelAtPeriodEnd: Boolean(row.cancel_at_period_end),
    subscriptionId: (row.dodo_subscription_id as string | null) ?? null,
    customerId: (row.dodo_customer_id as string | null) ?? null,
    createdAt: row.created_at as string,
  }));
}

export interface BillingEventRow {
  id: string;
  type: string;
  subscriptionId: string | null;
  receivedAt: string;
}

/**
 * Derniers webhooks recus.
 *
 * C'est la premiere chose a regarder quand un client dit « j'ai paye et il ne
 * se passe rien » : soit l'evenement n'est jamais arrive — probleme de
 * declaration chez le prestataire — soit il est la, et le probleme est chez
 * nous.
 */
export async function listBillingEvents(db: Db, limit = 30): Promise<BillingEventRow[]> {
  const { data } = await db
    .from('billing_events')
    .select('id, type, subscription_id, received_at')
    .order('received_at', { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => ({
    id: row.id as string,
    type: row.type as string,
    subscriptionId: (row.subscription_id as string | null) ?? null,
    receivedAt: row.received_at as string,
  }));
}

/**
 * Indicateurs de facturation, calcules a partir des abonnements deja lus.
 *
 * Pas de requete supplementaire : la page affiche de toute facon la liste, et
 * un second aller-retour pour recompter les memes lignes n'apporterait qu'un
 * risque d'incoherence entre le tableau et ses totaux.
 */
export function computeBillingStats(rows: SubscriptionRow[]): BillingStats {
  const stats: BillingStats = {
    mrr: 0,
    active: 0,
    trials: 0,
    cancelling: 0,
    atRisk: 0,
    perPlan: {},
  };

  for (const row of rows) {
    if (row.plan === 'trial') {
      stats.trials++;
      continue;
    }

    stats.perPlan[row.plan] = (stats.perPlan[row.plan] ?? 0) + 1;

    if (row.status === 'on_hold' || row.status === 'failed') stats.atRisk++;
    if (row.cancelAtPeriodEnd) stats.cancelling++;

    /*
     * Seuls les abonnements actifs comptent dans le revenu.
     *
     * `pending` n'a pas encore paye, `on_hold` a echoue : les inclure
     * gonflerait le chiffre d'un revenu qui n'est jamais entre. Un abonnement
     * resilie mais non echu compte encore — il est paye jusqu'au bout.
     */
    if (row.status !== 'active') continue;

    const plan = PLANS[row.plan];
    if (row.billingPeriod === 'annual') {
      // Ramene au mois pour rester comparable au mensuel.
      stats.mrr += (plan.annualTotal ?? 0) / 12;
      stats.active++;
    } else if (plan.monthly) {
      stats.mrr += plan.monthly;
      stats.active++;
    }
  }

  stats.mrr = Math.round(stats.mrr);
  return stats;
}

// =============================================================================
// Series temporelles de la plateforme
// =============================================================================

export interface PlatformPoint {
  /** Jour au format ISO (AAAA-MM-JJ). */
  date: string;
  conversations: number;
  messages: number;
  /** Reponses ou l'assistant a refuse faute de contenu pertinent. */
  refused: number;
  signups: number;
  bots: number;
  leads: number;
}

/**
 * Compteurs quotidiens de toute la plateforme.
 *
 * Les lignes sont ramenees puis regroupees en memoire, plutot que comptees par
 * SQL. C'est assumé a ce stade : PostgREST ne sait pas faire de `group by` sans
 * vue dediee, et une vue par graphique alourdirait les migrations pour un
 * volume qui tient encore largement en memoire.
 *
 * La borne a 90 jours est ce qui rend le procede tenable. Le jour ou ces
 * lectures deviennent lourdes, le signal sera net — et la reponse sera une vue
 * materialisee, pas une pagination.
 */
export async function getPlatformSeries(db: Db, days = 90): Promise<PlatformPoint[]> {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  const since = start.toISOString();

  const [conversations, messages, bots, leads, { data: usersData }] = await Promise.all([
    db.from('conversations').select('created_at').gte('created_at', since),
    db.from('messages').select('created_at, refused').gte('created_at', since),
    db.from('bots').select('created_at').gte('created_at', since),
    db.from('leads').select('created_at').gte('created_at', since),
    db.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  const buckets = new Map<string, PlatformPoint>();
  for (let offset = 0; offset < days; offset++) {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + offset);
    const key = day.toISOString().slice(0, 10);
    buckets.set(key, {
      date: key,
      conversations: 0,
      messages: 0,
      refused: 0,
      signups: 0,
      bots: 0,
      leads: 0,
    });
  }

  const tally = (
    rows: { created_at: string }[] | null,
    field: keyof Omit<PlatformPoint, 'date'>,
  ) => {
    for (const row of rows ?? []) {
      const bucket = buckets.get(row.created_at.slice(0, 10));
      if (bucket) bucket[field] += 1;
    }
  };

  tally(conversations.data as { created_at: string }[] | null, 'conversations');
  tally(bots.data as { created_at: string }[] | null, 'bots');
  tally(leads.data as { created_at: string }[] | null, 'leads');

  for (const row of (messages.data ?? []) as { created_at: string; refused: boolean }[]) {
    const bucket = buckets.get(row.created_at.slice(0, 10));
    if (!bucket) continue;
    bucket.messages += 1;
    if (row.refused) bucket.refused += 1;
  }

  // Les inscriptions vivent dans auth.users, hors de portee de PostgREST : le
  // filtrage par date se fait donc apres coup.
  for (const user of usersData?.users ?? []) {
    const bucket = buckets.get(user.created_at.slice(0, 10));
    if (bucket) bucket.signups += 1;
  }

  return [...buckets.values()];
}

export interface Breakdown {
  label: string;
  value: number;
}

/** Repartition des assistants par etat, pour la vue d'ensemble. */
export async function getBotBreakdown(db: Db): Promise<Breakdown[]> {
  const { data } = await db.from('bots').select('status, is_active');

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const key = row.is_active === false ? 'inactive' : ((row.status as string) ?? 'draft');
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const LABELS: Record<string, string> = {
    ready: 'Prêts',
    crawling: 'En analyse',
    draft: 'Jamais analysés',
    error: 'En erreur',
    inactive: 'Désactivés',
  };

  return [...counts.entries()]
    .map(([key, value]) => ({ label: LABELS[key] ?? key, value }))
    .sort((a, b) => b.value - a.value);
}
