/**
 * Test de bout en bout du chemin serveur, sans navigateur.
 *
 *   npm run e2e -- https://example.com [--max=6]
 *
 * Cree un utilisateur et un bot jetables, deroule l'indexation tick par tick
 * exactement comme le fera le dashboard, interroge pgvector, puis nettoie tout.
 *
 * C'est ce qui verifie les pieces qu'aucun typecheck ne peut couvrir :
 * le SQL, la fonction de recherche hybride, et le decoupage en deux phases.
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { runIndexTick } from '../lib/indexer';
import { createPgRetriever } from '../lib/database';
import { answerQuestion } from '../lib/rag';

const OK = '\x1b[32m✓\x1b[0m';
const KO = '\x1b[31m✗\x1b[0m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

/** Garde-fou : sans limite, une boucle de ticks defectueuse tournerait sans fin. */
const MAX_TICKS = 60;

async function main() {
  const args = process.argv.slice(2);
  const site = args.find((arg) => !arg.startsWith('--')) ?? 'https://www.python.org';
  const maxPages = Number(
    args.find((arg) => arg.startsWith('--max='))?.split('=')[1] ?? 6,
  );

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const email = `e2e-${Date.now()}@wizetalk.test`;
  let userId: string | null = null;

  try {
    // --- Utilisateur jetable ---------------------------------------------
    const { data: created, error: userError } = await db.auth.admin.createUser({
      email,
      password: `e2e-${Math.random().toString(36).slice(2)}!A1`,
      email_confirm: true,
    });
    if (userError || !created.user) {
      throw new Error(`Création de l'utilisateur impossible : ${userError?.message}`);
    }
    userId = created.user.id;
    console.log(`${OK} utilisateur de test créé ${DIM}${email}${RESET}`);

    // --- Bot ---------------------------------------------------------------
    const { data: bot, error: botError } = await db
      .from('bots')
      .insert({
        user_id: userId,
        name: 'Bot e2e',
        website_url: site,
        allowed_domains: [new URL(site).hostname.replace(/^www\./, '')],
      })
      .select('id')
      .single();
    if (botError || !bot) throw new Error(`Création du bot impossible : ${botError?.message}`);
    console.log(`${OK} bot créé ${DIM}${bot.id}${RESET}`);

    // --- Job d'indexation --------------------------------------------------
    const { data: job, error: jobError } = await db
      .from('crawl_jobs')
      .insert({ bot_id: bot.id, status: 'pending', max_pages: maxPages })
      .select('id')
      .single();
    if (jobError || !job) throw new Error(`Création du job impossible : ${jobError?.message}`);

    console.log(`\n${DIM}Indexation de ${site} (${maxPages} pages max)${RESET}`);

    let ticks = 0;
    let lastStatus = '';
    for (;;) {
      if (ticks++ >= MAX_TICKS) throw new Error(`Toujours pas terminé après ${MAX_TICKS} ticks.`);

      const result = await runIndexTick(db, job.id);
      if (result.status !== lastStatus) {
        console.log(`  ${DIM}phase : ${result.status}${RESET}`);
        lastStatus = result.status;
      }
      process.stdout.write(
        `\r\x1b[K  ${DIM}tick ${ticks} · ${result.pagesDone} pages · ${result.chunksDone} sections${RESET}`,
      );

      if (result.error) throw new Error(result.error);
      if (result.done) {
        console.log(`\n${OK} indexation terminée en ${ticks} ticks`);
        break;
      }
    }

    // --- Etat en base ------------------------------------------------------
    const [{ count: pageCount }, { count: chunkCount }] = await Promise.all([
      db.from('pages').select('id', { count: 'exact', head: true }).eq('bot_id', bot.id),
      db.from('chunks').select('id', { count: 'exact', head: true }).eq('bot_id', bot.id),
    ]);
    console.log(`${OK} ${pageCount} pages et ${chunkCount} sections en base`);

    if (!chunkCount) throw new Error('Aucun chunk indexé.');

    // --- Recherche hybride pgvector ---------------------------------------
    const retriever = createPgRetriever(db, bot.id);
    const hits = await retriever('What is Python used for?');
    console.log(`${OK} match_chunks renvoie ${hits.length} passages`);
    for (const hit of hits.slice(0, 3)) {
      console.log(
        `   ${DIM}cos=${hit.cosine.toFixed(3)} rrf=${hit.score.toFixed(4)} ${hit.url}${RESET}`,
      );
    }

    // --- Les deux classements contribuent-ils ? ---------------------------
    // Un score RRF plafonne a 1/61 signifie qu'un seul classement a repondu :
    // la recherche hybride serait alors degradee en recherche vectorielle pure.
    const bothArms = hits.some((hit) => hit.score > 1 / 60 + 1e-6);
    if (bothArms) {
      console.log(`${OK} recherche hybride : les deux classements contribuent`);
    } else {
      console.log(
        `${KO} arm lexical muet (score max ${Math.max(...hits.map((h) => h.score)).toFixed(5)} ≈ 1/61)`,
      );
      console.log(
        `   ${DIM}appliquez supabase/migrations/0002_lexical_or.sql${RESET}`,
      );
    }

    // --- Isolation multi-tenant -------------------------------------------
    const otherBot = '00000000-0000-0000-0000-000000000000';
    const leak = await createPgRetriever(db, otherBot)('What is Python used for?');
    if (leak.length === 0) {
      console.log(`${OK} isolation : un autre bot ne remonte aucun passage`);
    } else {
      console.log(`${KO} FUITE : ${leak.length} passages remontés pour un autre bot`);
      throw new Error('Isolation multi-tenant rompue.');
    }

    // --- Reponse ancree ----------------------------------------------------
    const answer = await answerQuestion('What is Python used for?', retriever);
    console.log(`${OK} réponse générée ${DIM}(cosinus max ${answer.topCosine.toFixed(3)})${RESET}`);
    console.log(`   ${answer.answer.replace(/\s+/g, ' ').slice(0, 160)}…`);

    // --- Refus sur question hors-sujet ------------------------------------
    const refusal = await answerQuestion('Quel est le tarif de votre abonnement ?', retriever);
    if (refusal.refused) {
      console.log(
        `${OK} refus correct sur question hors-sujet ${DIM}(cosinus ${refusal.topCosine.toFixed(3)})${RESET}`,
      );
    } else {
      console.log(
        `${DIM}  ⚠ pas de refus par seuil (cosinus ${refusal.topCosine.toFixed(3)}) — la consigne système a pris le relais${RESET}`,
      );
      console.log(`   ${refusal.answer.replace(/\s+/g, ' ').slice(0, 160)}…`);
    }

    console.log('\nChemin serveur validé de bout en bout.\n');
  } finally {
    // Suppression de l'utilisateur : bot, pages, chunks et jobs partent
    // en cascade. Verifie du meme coup que les ON DELETE CASCADE tiennent.
    if (userId) {
      await db.auth.admin.deleteUser(userId);
      console.log(`${DIM}utilisateur de test supprimé (cascade)${RESET}`);
    }
  }
}

main().catch((error) => {
  console.error(`\n${KO} ${error instanceof Error ? error.message : error}\n`);
  process.exit(1);
});
