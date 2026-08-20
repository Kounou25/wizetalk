import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

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
  createdAt: string;
  lastSignInAt: string | null;
  isAdmin: boolean;
  botCount: number;
  messagesUsed: number;
  messagesQuota: number;
}

/**
 * Tous les comptes, avec leur usage.
 *
 * Les utilisateurs vivent dans auth.users, hors de portee de PostgREST : on
 * passe par l'API d'administration, puis on rattache les compteurs par une
 * seule lecture de `bots` plutot qu'une requete par compte.
 */
export async function listUsers(db: Db, limit = 200): Promise<AdminUserRow[]> {
  const { data } = await db.auth.admin.listUsers({ page: 1, perPage: limit });
  const users = data?.users ?? [];

  const [{ data: bots }, { data: admins }] = await Promise.all([
    db.from('bots').select('user_id, messages_used, messages_quota'),
    db.from('admins').select('user_id'),
  ]);

  const adminIds = new Set((admins ?? []).map((row) => row.user_id as string));
  const perUser = new Map<string, { count: number; used: number; quota: number }>();

  for (const bot of bots ?? []) {
    const key = bot.user_id as string;
    const entry = perUser.get(key) ?? { count: 0, used: 0, quota: 0 };
    entry.count += 1;
    entry.used += (bot.messages_used as number) ?? 0;
    entry.quota += (bot.messages_quota as number) ?? 0;
    perUser.set(key, entry);
  }

  return users
    .map((user) => {
      const usage = perUser.get(user.id) ?? { count: 0, used: 0, quota: 0 };
      return {
        id: user.id,
        email: user.email ?? '—',
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at ?? null,
        isAdmin: adminIds.has(user.id),
        botCount: usage.count,
        messagesUsed: usage.used,
        messagesQuota: usage.quota,
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
  messagesUsed: number;
  messagesQuota: number;
  pages: number;
  conversations: number;
}

export async function listBots(db: Db, limit = 200): Promise<AdminBotRow[]> {
  const { data: bots } = await db
    .from('bots')
    .select(
      'id, user_id, name, website_url, status, is_active, last_synced_at, created_at, messages_used, messages_quota',
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
    messagesUsed: (bot.messages_used as number) ?? 0,
    messagesQuota: (bot.messages_quota as number) ?? 0,
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
