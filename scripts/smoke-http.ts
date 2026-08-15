/**
 * Verification HTTP de la surface publique du widget.
 *
 *   npm run build && npx next start   (dans un autre terminal)
 *   npm run smoke
 *
 * Cree un bot jetable deja indexe, puis interroge les routes exactement comme
 * le fera le navigateur d'un visiteur : widget.js, configuration publique,
 * page iframe, et flux SSE de /api/chat — y compris le controle d'Origin.
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { runIndexTick } from '../lib/indexer';

const OK = '\x1b[32m✓\x1b[0m';
const KO = '\x1b[31m✗\x1b[0m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

/** Surchargeable : `npm run smoke -- http://localhost:3100`. */
const BASE =
  process.argv.find((arg) => arg.startsWith('http')) ??
  process.env.NEXT_PUBLIC_APP_URL ??
  'http://localhost:3000';

let failures = 0;

function check(condition: boolean, label: string, detail = '') {
  console.log(`${condition ? OK : KO} ${label}${detail ? ` ${DIM}${detail}${RESET}` : ''}`);
  if (!condition) failures++;
}

async function main() {
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  // --- widget.js (aucun bot requis) ---------------------------------------
  const widgetResponse = await fetch(`${BASE}/widget.js`);
  const widgetSource = await widgetResponse.text();
  check(widgetResponse.ok, 'GET /widget.js', `${widgetResponse.status}`);
  check(
    widgetResponse.headers.get('access-control-allow-origin') === '*',
    'widget.js autorise toutes les origines',
  );
  check(widgetSource.includes('data-bot'), 'widget.js lit l’attribut data-bot');
  check(widgetSource.length < 8000, 'widget.js reste léger', `${widgetSource.length} octets`);

  // --- Bot jetable indexe --------------------------------------------------
  const email = `smoke-${Date.now()}@wizetalk.test`;
  const { data: created } = await db.auth.admin.createUser({
    email,
    password: `smoke-${Math.random().toString(36).slice(2)}!A1`,
    email_confirm: true,
  });
  const userId = created?.user?.id;
  if (!userId) throw new Error('Utilisateur de test non créé.');

  try {
    const { data: bot } = await db
      .from('bots')
      .insert({
        user_id: userId,
        name: 'Bot smoke',
        website_url: 'https://www.python.org',
        allowed_domains: ['python.org'],
        primary_color: '#e11d48',
      })
      .select('id')
      .single();
    if (!bot) throw new Error('Bot non créé.');

    const { data: job } = await db
      .from('crawl_jobs')
      .insert({ bot_id: bot.id, status: 'pending', max_pages: 4 })
      .select('id')
      .single();
    if (!job) throw new Error('Job non créé.');

    process.stdout.write(`${DIM}  indexation…${RESET}`);
    for (let i = 0; i < 40; i++) {
      const result = await runIndexTick(db, job.id);
      if (result.error) throw new Error(result.error);
      if (result.done) break;
    }
    console.log('\r\x1b[K');

    // --- Configuration publique -------------------------------------------
    const configResponse = await fetch(`${BASE}/api/widget/${bot.id}`);
    const config = (await configResponse.json()) as Record<string, unknown>;
    check(configResponse.ok, 'GET /api/widget/[botId]', `${configResponse.status}`);
    check(config.primaryColor === '#e11d48', 'la configuration porte la couleur du bot');
    check(
      !('website_url' in config) && !('allowed_domains' in config),
      'aucune donnée privée dans la configuration publique',
    );

    // --- Page iframe -------------------------------------------------------
    const pageResponse = await fetch(`${BASE}/chat/${bot.id}`);
    const html = await pageResponse.text();
    check(pageResponse.ok, 'GET /chat/[botId]', `${pageResponse.status}`);
    check(html.includes('Bot smoke'), 'la page iframe affiche le nom du bot');

    // --- Origine refusee ---------------------------------------------------
    const forbidden = await fetch(`${BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://site-pirate.example' },
      body: JSON.stringify({ botId: bot.id, sessionId: 'smoke', message: 'test' }),
    });
    check(forbidden.status === 403, 'origine non déclarée rejetée', `${forbidden.status}`);

    /*
     * L'application interrogee depuis sa PROPRE origine.
     *
     * C'est le chat de test du dashboard : l'origine n'est pas un domaine
     * declare du bot, mais celui de l'application. Ce cas echouait en
     * production quand NEXT_PUBLIC_APP_URL n'etait pas definie — l'appli ne se
     * reconnaissait plus elle-meme et se repondait 403.
     */
    const ownOrigin = await fetch(`${BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: BASE },
      body: JSON.stringify({
        botId: bot.id,
        sessionId: 'smoke-self',
        message: 'What is Python?',
      }),
    });
    check(ownOrigin.ok, "l'application accepte sa propre origine", `${ownOrigin.status}`);

    // --- Origine autorisee + flux SSE --------------------------------------
    const chatResponse = await fetch(`${BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://python.org' },
      body: JSON.stringify({
        botId: bot.id,
        sessionId: `smoke-${Date.now()}`,
        message: 'What is Python used for?',
      }),
    });
    check(chatResponse.ok, 'origine déclarée acceptée', `${chatResponse.status}`);
    check(
      (chatResponse.headers.get('content-type') ?? '').includes('text/event-stream'),
      'réponse servie en SSE',
    );

    const body = await chatResponse.text();
    const deltas = [...body.matchAll(/"type":"delta"/g)].length;
    check(deltas > 0, 'le flux contient des fragments de réponse', `${deltas} deltas`);
    check(body.includes('"type":"done"'), 'le flux se termine par un événement done');

    // --- Conversation persistee -------------------------------------------
    const { count } = await db
      .from('conversations')
      .select('id', { count: 'exact', head: true })
      .eq('bot_id', bot.id);
    check((count ?? 0) > 0, 'conversation enregistrée en base', `${count}`);

    const { data: botAfter } = await db
      .from('bots')
      .select('messages_used')
      .eq('id', bot.id)
      .single();
    check((botAfter?.messages_used ?? 0) > 0, 'quota de messages incrémenté');

    // --- Boucle de capture de prospects -----------------------------------
    // Une question hors-sujet passe sous le seuil : l'assistant refuse sans
    // appeler le modele, et le flux doit signaler qu'on peut proposer un rappel.
    const refusal = await fetch(`${BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://python.org' },
      body: JSON.stringify({
        botId: bot.id,
        sessionId: 'smoke-lead',
        message: 'Quel est le tarif de votre abonnement premium et vos horaires ?',
      }),
    });
    const refusalBody = await refusal.text();
    check(refusalBody.includes('"leadCapture":true'), 'refus : le flux propose la capture');

    const leadEmail = `visiteur-${Date.now()}@exemple.test`;
    const leadResponse = await fetch(`${BASE}/api/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://python.org' },
      body: JSON.stringify({
        botId: bot.id,
        sessionId: 'smoke-lead',
        email: leadEmail,
        question: 'Quel est le tarif de votre abonnement premium ?',
      }),
    });
    check(leadResponse.ok, 'prospect enregistré', `${leadResponse.status}`);

    const { data: storedLead } = await db
      .from('leads')
      .select('email, question, status, conversation_id')
      .eq('bot_id', bot.id)
      .maybeSingle();
    check(storedLead?.email === leadEmail, 'le prospect porte la bonne adresse');
    check(Boolean(storedLead?.conversation_id), 'le prospect est rattaché à sa conversation');
    check(storedLead?.status === 'new', 'le prospect arrive en attente de traitement');

    const duplicate = await fetch(`${BASE}/api/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://python.org' },
      body: JSON.stringify({
        botId: bot.id,
        sessionId: 'smoke-lead',
        email: leadEmail,
        question: 'Une autre question',
      }),
    });
    const duplicateBody = (await duplicate.json()) as { duplicate?: boolean };
    check(duplicateBody.duplicate === true, 'doublon ignoré dans l’heure');

    // Collecte desactivee : le formulaire ne doit plus rien accepter.
    await db.from('bots').update({ lead_capture: false }).eq('id', bot.id);
    const refusedLead = await fetch(`${BASE}/api/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://python.org' },
      body: JSON.stringify({
        botId: bot.id,
        sessionId: 'smoke-lead',
        email: 'autre@exemple.test',
        question: 'test',
      }),
    });
    check(refusedLead.status === 403, 'collecte désactivée : dépôt refusé', `${refusedLead.status}`);
    await db.from('bots').update({ lead_capture: true }).eq('id', bot.id);

    // --- Personnalisation -------------------------------------------------
    await db
      .from('bots')
      .update({ primary_color: '#7c3aed', welcome_message: 'Bonjour, une question ?' })
      .eq('id', bot.id);

    const updated = (await (
      await fetch(`${BASE}/api/widget/${bot.id}`, { cache: 'no-store' })
    ).json()) as Record<string, unknown>;
    check(updated.primaryColor === '#7c3aed', 'la couleur modifiée est servie au widget');
    check(
      updated.welcomeMessage === 'Bonjour, une question ?',
      "le message d'accueil modifié est servi au widget",
    );

    // --- Désactivation ----------------------------------------------------
    // Le widget doit disparaître des sites clients sans qu'ils touchent au
    // script : c'est toute la promesse de l'interrupteur.
    await db.from('bots').update({ is_active: false }).eq('id', bot.id);

    const offConfig = await fetch(`${BASE}/api/widget/${bot.id}`, { cache: 'no-store' });
    check(offConfig.status === 404, 'désactivé : configuration du widget refusée', `${offConfig.status}`);

    const offPage = await fetch(`${BASE}/chat/${bot.id}`, { cache: 'no-store' });
    check(offPage.status === 404, 'désactivé : page iframe introuvable', `${offPage.status}`);

    const offChat = await fetch(`${BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://python.org' },
      body: JSON.stringify({ botId: bot.id, sessionId: 'off', message: 'test' }),
    });
    check(offChat.status === 403, 'désactivé : /api/chat refuse de répondre', `${offChat.status}`);

    // --- Réactivation -----------------------------------------------------
    await db.from('bots').update({ is_active: true }).eq('id', bot.id);
    const back = await fetch(`${BASE}/api/widget/${bot.id}`, { cache: 'no-store' });
    check(back.status === 200, 'réactivé : le widget revient', `${back.status}`);
  } finally {
    await db.auth.admin.deleteUser(userId);
    console.log(`${DIM}bot de test supprimé${RESET}`);
  }

  console.log(failures === 0 ? '\nSurface publique validée.\n' : `\n${failures} échec(s).\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(`\n${KO} ${error instanceof Error ? error.message : error}\n`);
  process.exit(1);
});
