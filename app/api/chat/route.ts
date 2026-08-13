/**
 * Route publique du chatbot, appelee anonymement depuis le site du client.
 *
 * C'est la seule surface non authentifiee du produit, et donc la seule qui
 * peut faire exploser la facture Gemini : le bot_id est lisible dans le HTML
 * de n'importe quel site client. Trois barrieres, du moins au plus couteux :
 *
 *   1. le bot doit etre actif ;
 *   2. l'en-tete Origin doit correspondre a un domaine declare ;
 *   3. le quota mensuel de messages ne doit pas etre epuise.
 *
 * Le quota est verifie AVANT l'appel au modele et incremente juste apres :
 * un abus coute au pire quelques requetes, pas un mois de facturation.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { createPgRetriever } from '@/lib/database';
import { answerQuestionStream } from '@/lib/rag';

export const maxDuration = 60;

interface ChatRequest {
  botId?: string;
  sessionId?: string;
  message?: string;
}

interface BotRow {
  id: string;
  is_active: boolean;
  allowed_domains: string[];
  messages_used: number;
  messages_quota: number;
  lead_capture: boolean;
}

function corsHeaders(origin: string | null): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin ?? '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

/**
 * Adresse de machine locale ou de reseau prive (RFC 1918).
 *
 * Sert uniquement a autoriser le developpement depuis un autre appareil du
 * meme reseau — un telephone, une seconde machine. Ces plages ne sont pas
 * routables sur Internet : elles n'ouvrent donc rien vers l'exterieur, mais on
 * les restreint quand meme au mode developpement par principe.
 */
function isPrivateHost(host: string): boolean {
  if (host === 'localhost' || host === '::1' || host.endsWith('.local')) return true;
  if (/^127\./.test(host)) return true;
  if (/^10\./.test(host)) return true;
  if (/^192\.168\./.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return true;
  return false;
}

/**
 * Origin absent : appel serveur-a-serveur ou navigation directe, on laisse
 * passer. Origin present : il doit correspondre a un domaine declare, ou a
 * l'application elle-meme (test depuis le dashboard).
 */
function originAllowed(origin: string | null, bot: BotRow): boolean {
  if (!origin) return true;

  let host: string;
  try {
    host = new URL(origin).hostname.replace(/^www\./, '');
  } catch {
    return false;
  }

  const appHost = (() => {
    try {
      return new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').hostname;
    } catch {
      return 'localhost';
    }
  })();

  if (host === appHost) return true;

  // En developpement, l'application est souvent consultee depuis une autre
  // machine du reseau : l'hote n'est alors ni localhost ni un domaine declare.
  if (process.env.NODE_ENV !== 'production' && isPrivateHost(host)) return true;

  if (bot.allowed_domains.length === 0) return true;

  return bot.allowed_domains.some(
    (domain) => host === domain || host.endsWith(`.${domain}`),
  );
}

function errorResponse(message: string, status: number, origin: string | null) {
  return Response.json({ error: message }, { status, headers: corsHeaders(origin) });
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request.headers.get('origin')),
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  const { botId, sessionId, message } = (await request.json()) as ChatRequest;

  if (!botId || !sessionId || !message?.trim()) {
    return errorResponse('Requête incomplète.', 400, origin);
  }
  if (message.length > 1000) {
    return errorResponse('Message trop long.', 400, origin);
  }

  // Pas de session utilisateur ici : le controle d'acces est entierement
  // porte par ce code, le RLS ne peut pas servir de filet.
  const db = createAdminClient();

  const { data: bot } = await db
    .from('bots')
    .select('id, is_active, allowed_domains, messages_used, messages_quota, lead_capture')
    .eq('id', botId)
    .maybeSingle();

  if (!bot) return errorResponse('Assistant introuvable.', 404, origin);

  const typedBot = bot as unknown as BotRow;
  if (!typedBot.is_active) return errorResponse('Assistant désactivé.', 403, origin);
  if (!originAllowed(origin, typedBot)) {
    return errorResponse('Origine non autorisée.', 403, origin);
  }
  if (typedBot.messages_used >= typedBot.messages_quota) {
    return errorResponse('Quota de messages atteint.', 429, origin);
  }

  // Une conversation par session de visiteur.
  const { data: existing } = await db
    .from('conversations')
    .select('id')
    .eq('bot_id', botId)
    .eq('session_id', sessionId)
    .maybeSingle();

  let conversationId = existing?.id as string | undefined;
  if (!conversationId) {
    const { data: created, error } = await db
      .from('conversations')
      .insert({ bot_id: botId, session_id: sessionId })
      .select('id')
      .single();
    if (error) return errorResponse('Conversation impossible.', 500, origin);
    conversationId = created.id as string;
  }

  await db.from('messages').insert({
    conversation_id: conversationId,
    role: 'user',
    content: message,
  });

  const retriever = createPgRetriever(db, botId);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      try {
        const generator = answerQuestionStream(message, retriever);

        let step = await generator.next();
        while (!step.done) {
          send({ type: 'delta', text: step.value });
          step = await generator.next();
        }

        const final = step.value;

        // `refused` pilote l'affichage du formulaire de contact cote widget :
        // c'est le seul moment ou demander une adresse a du sens, puisque
        // l'assistant vient d'admettre qu'il ne sait pas.
        send({
          type: 'done',
          sources: final.sources,
          refused: final.refused,
          leadCapture: final.refused && typedBot.lead_capture,
        });

        await db.from('messages').insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: final.answer,
          sources: final.sources,
          refused: final.refused,
        });
        await db
          .from('bots')
          .update({ messages_used: typedBot.messages_used + 1 })
          .eq('id', botId);
      } catch (error) {
        send({
          type: 'error',
          message: error instanceof Error ? error.message : 'Erreur inconnue.',
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders(origin),
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
