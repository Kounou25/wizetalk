/**
 * Verifie que la migration SQL a bien ete appliquee.
 *
 *   npm run db:check
 *
 * Controle les tables, la fonction de recherche hybride, et surtout que le RLS
 * isole reellement les donnees  c'est la garantie multi-tenant du produit.
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const OK = '\x1b[32m✓\x1b[0m';
const KO = '\x1b[31m✗\x1b[0m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

/** Table -> migration qui la cree, pour nommer le fichier manquant. */
const TABLES: [table: string, migration: string][] = [
  ['bots', '0001'],
  ['pages', '0001'],
  ['chunks', '0001'],
  ['crawl_jobs', '0001'],
  ['conversations', '0001'],
  ['messages', '0001'],
  ['leads', '0003'],
  ['admins', '0004'],
  ['admin_audit', '0004'],
  ['profiles', '0006'],
];

/** Colonnes ajoutees par migration : leur absence indique un fichier non joue. */
const COLUMNS: [table: string, column: string, migration: string][] = [
  ['pages', 'sections', '0001'],
  ['messages', 'refused', '0003'],
  ['bots', 'lead_capture', '0003'],
];

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceKey) {
    console.log(`${KO} Variables Supabase manquantes dans .env`);
    process.exit(1);
  }
  if (url.includes('placeholder')) {
    console.log(`${KO} NEXT_PUBLIC_SUPABASE_URL est encore la valeur de remplacement`);
    process.exit(1);
  }

  console.log(`\n${DIM}${url}${RESET}\n`);

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const anon = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let failed = false;

  // --- Tables -------------------------------------------------------------
  // Lecture reelle, et non requete HEAD : PostgREST ne renvoie pas d'erreur
  // exploitable sur un HEAD vers une table inexistante  le controle passait
  // au vert pour une table absente.
  for (const [table, migration] of TABLES) {
    const { error } = await admin.from(table).select('*').limit(1);
    if (error) {
      console.log(`${KO} table ${table} manquante  migration ${migration} non appliquée`);
      failed = true;
    } else {
      console.log(`${OK} table ${table}`);
    }
  }

  // --- Colonnes ajoutees par les migrations successives -------------------
  for (const [table, column, migration] of COLUMNS) {
    const { error } = await admin.from(table).select(column).limit(1);
    if (error) {
      console.log(`${KO} ${table}.${column} manquante  migration ${migration} non appliquée`);
      failed = true;
    } else {
      console.log(`${OK} colonne ${table}.${column}`);
    }
  }

  // --- Fonction de recherche hybride --------------------------------------
  {
    const zeroVector = JSON.stringify(new Array(768).fill(0));
    const { error } = await admin.rpc('match_chunks', {
      p_bot_id: '00000000-0000-0000-0000-000000000000',
      p_query_embedding: zeroVector,
      p_query_text: 'test',
      p_match_count: 1,
    });
    if (error) {
      console.log(`${KO} fonction match_chunks : ${error.message}`);
      failed = true;
    } else {
      console.log(`${OK} fonction match_chunks (768 dimensions)`);
    }
  }

  // --- Isolation RLS ------------------------------------------------------
  // Sans session, la cle anon ne doit jamais voir la moindre ligne.
  {
    const { data, error } = await anon.from('bots').select('id');
    if (error) {
      console.log(`${OK} RLS actif sur bots ${DIM}(anon rejeté : ${error.message})${RESET}`);
    } else if ((data ?? []).length === 0) {
      console.log(`${OK} RLS actif sur bots ${DIM}(anon ne voit aucune ligne)${RESET}`);
    } else {
      console.log(`${KO} RLS INACTIF : la clé anon lit ${data.length} bot(s) sans session`);
      failed = true;
    }
  }

  // --- Tables d'administration verrouillees -------------------------------
  // RLS activee sans aucune politique : la cle anon ne doit rien pouvoir lire.
  for (const table of ['admins', 'admin_audit']) {
    const { data, error } = await anon.from(table).select('*').limit(1);
    if (error || (data ?? []).length === 0) {
      console.log(`${OK} ${table} inaccessible à la clé anon`);
    } else {
      console.log(`${KO} FUITE : la clé anon lit ${table} sans session`);
      failed = true;
    }
  }

  console.log(
    failed
      ? '\nSchéma incomplet. Exécutez les fichiers manquants de supabase/migrations/ dans le SQL Editor, dans l’ordre.\n'
      : '\nSchéma conforme.\n',
  );
  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
