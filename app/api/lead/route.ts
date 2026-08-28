/**
 * Depot d'un prospect depuis le widget.
 *
 * Appelee anonymement, comme /api/chat : memes barrieres (bot actif, origine
 * declaree), plus un garde-fou anti-doublon. Aucun quota de messages consomme
 * ici  laisser une adresse ne doit jamais etre bloque par un quota epuise.
 */

import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { appHostFromRequest } from '@/lib/request-origin';
import { after } from 'next/server';
import { sendLeadAlert } from '@/lib/email/send-lead-alert';

export const maxDuration = 30;

const payload = z.object({
  botId: z.uuid(),
  sessionId: z.string().min(1).max(200),
  email: z.email("L'adresse e-mail n'est pas valide."),
  question: z.string().trim().min(1).max(1000),
});

interface BotRow {
  is_active: boolean;
  lead_capture: boolean;
  allowed_domains: string[];
}

function corsHeaders(origin: string | null): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin ?? '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

function isPrivateHost(host: string): boolean {
  if (host === 'localhost' || host === '::1' || host.endsWith('.local')) return true;
  return /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host);
}

function originAllowed(origin: string | null, bot: BotRow, appHost: string): boolean {
  if (!origin) return true;

  let host: string;
  try {
    host = new URL(origin).hostname.replace(/^www\./, '');
  } catch {
    return false;
  }

  if (host === appHost) return true;
  if (process.env.NODE_ENV !== 'production' && isPrivateHost(host)) return true;
  if (bot.allowed_domains.length === 0) return true;

  return bot.allowed_domains.some(
    (domain) => host === domain || host.endsWith(`.${domain}`),
  );
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request.headers.get('origin')),
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  const headers = corsHeaders(origin);

  const parsed = payload.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? 'Requête invalide.' },
      { status: 400, headers },
    );
  }

  const { botId, sessionId, email, question } = parsed.data;
  const db = createAdminClient();

  const { data: bot } = await db
    .from('bots')
    .select('is_active, lead_capture, allowed_domains')
    .eq('id', botId)
    .maybeSingle();

  if (!bot) return Response.json({ error: 'Assistant introuvable.' }, { status: 404, headers });

  const typedBot = bot as unknown as BotRow;
  if (!typedBot.is_active || !typedBot.lead_capture) {
    return Response.json({ error: 'Collecte désactivée.' }, { status: 403, headers });
  }
  if (!originAllowed(origin, typedBot, appHostFromRequest(request))) {
    return Response.json({ error: 'Origine non autorisée.' }, { status: 403, headers });
  }

  // Anti-doublon : un visiteur qui renvoie le formulaire, ou qui pose deux
  // questions sans reponse d'affilee, ne doit pas polluer la liste du client.
  const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString();
  const { data: recent } = await db
    .from('leads')
    .select('id')
    .eq('bot_id', botId)
    .eq('email', email)
    .gte('created_at', oneHourAgo)
    .maybeSingle();

  if (recent) return Response.json({ ok: true, duplicate: true }, { headers });

  const { data: conversation } = await db
    .from('conversations')
    .select('id')
    .eq('bot_id', botId)
    .eq('session_id', sessionId)
    .maybeSingle();

  const { error } = await db.from('leads').insert({
    bot_id: botId,
    conversation_id: conversation?.id ?? null,
    email,
    question,
  });

  if (error) {
    return Response.json({ error: 'Enregistrement impossible.' }, { status: 500, headers });
  }

  /*
   * L'alerte part APRES la reponse.
   *
   * `after()` differe l'envoi jusqu'a ce que le visiteur ait recu sa
   * confirmation : il n'attend pas le serveur de messagerie, et un incident SMTP
   * ne peut pas transformer une capture reussie en erreur affichee sur le site
   * du client.
   */
  after(() => sendLeadAlert(botId, email, question));

  return Response.json({ ok: true }, { headers });
}
