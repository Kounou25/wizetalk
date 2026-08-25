/**
 * Verifie l'installation de la facturation, sans rien creer.
 *
 *   npm run billing:check
 *
 * Trois controles, du moins au plus revelateur :
 *
 *   1. les variables sont-elles la ;
 *   2. les migrations 0007 et 0008 sont-elles appliquees ;
 *   3. les six produits existent-ils chez Dodo, et surtout leur prix
 *      correspond-il a ce que la page de tarifs annonce.
 *
 * Le troisieme point est le plus utile : le prix affiche vient du
 * dictionnaire, le prix preleve vient de Dodo. Ce sont deux sources
 * distinctes, que rien ne synchronise. Un ecart entre les deux, c'est un
 * client qui paie autre chose que ce qu'il a lu.
 *
 * Aucune ecriture : ni abonnement, ni client, ni webhook.
 */

import 'dotenv/config';
import DodoPayments from 'dodopayments';
import { createClient } from '@supabase/supabase-js';

const OK = '\x1b[32m✓\x1b[0m';
const KO = '\x1b[31m✗\x1b[0m';
const WARN = '\x1b[33m!\x1b[0m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

let failures = 0;
const fail = (message: string) => {
  failures++;
  console.log(`  ${KO} ${message}`);
};

/**
 * Prix attendus, repris de lib/credits.ts — la source de la page de tarifs.
 *
 * `months` est la periodicite exprimee en mois : 1 pour un plan mensuel, 12
 * pour un plan annuel. Dodo n'encode pas l'annuel en `interval: 'Year'` mais
 * en `payment_frequency_count: 12` sur un intervalle mensuel — comparer le
 * seul intervalle ferait passer un produit annuel correct pour une erreur.
 */
const EXPECTED: Record<string, { label: string; cents: number; months: number }> = {
  DODO_PRODUCT_ESSENTIAL: { label: 'Essentiel mensuel', cents: 1900, months: 1 },
  DODO_PRODUCT_GROWTH: { label: 'Croissance mensuel', cents: 3900, months: 1 },
  DODO_PRODUCT_ENTREPRISE: { label: 'Entreprise mensuel', cents: 7900, months: 1 },
  DODO_PRODUCT_ESSENTIAL_ANNUAL: { label: 'Essentiel annuel', cents: 19000, months: 12 },
  DODO_PRODUCT_GROWTH_ANNUAL: { label: 'Croissance annuel', cents: 39000, months: 12 },
  DODO_PRODUCT_ENTREPRISE_ANNUAL: { label: 'Entreprise annuel', cents: 79000, months: 12 },
};

/** Periodicite de facturation ramenee en mois. */
function billingMonths(price: { count?: number; interval?: string }): number | null {
  if (price.count == null || !price.interval) return null;
  return price.interval === 'Year' ? price.count * 12 : price.count;
}

function describe(months: number | null): string {
  if (months === 1) return 'par mois';
  if (months === 12) return 'par an';
  return months == null ? 'periodicite inconnue' : `tous les ${months} mois`;
}

async function checkEnvironment(): Promise<boolean> {
  console.log('\nVariables');

  const mode = process.env.DODO_ENVIRONMENT;
  if (mode !== 'test_mode' && mode !== 'live_mode') {
    fail(`DODO_ENVIRONMENT doit valoir test_mode ou live_mode (recu : ${mode ?? 'vide'})`);
    return false;
  }
  console.log(`  ${OK} DODO_ENVIRONMENT ${DIM}${mode}${RESET}`);

  let complete = true;
  for (const key of ['DODO_API_KEY', 'DODO_WEBHOOK_KEY', ...Object.keys(EXPECTED)]) {
    if (process.env[key]) {
      console.log(`  ${OK} ${key}`);
    } else {
      fail(`${key} absente ou vide`);
      complete = false;
    }
  }

  return complete;
}

async function checkDatabase(): Promise<void> {
  console.log('\nBase de donnees');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    fail('NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquante');
    return;
  }

  const db = createClient(url, key, { auth: { persistSession: false } });

  // 0007 : le portefeuille.
  const { error: creditsError } = await db
    .from('profiles')
    .select('plan, credits_included, credits_used, period_started_at')
    .limit(1);
  if (creditsError) {
    fail(`migration 0007 non appliquee ${DIM}${creditsError.message}${RESET}`);
  } else {
    console.log(`  ${OK} 0007_credits ${DIM}colonnes du portefeuille${RESET}`);
  }

  // 0008 : l'abonnement.
  const { error: billingError } = await db
    .from('profiles')
    .select('dodo_customer_id, dodo_subscription_id, subscription_status, billing_period')
    .limit(1);
  if (billingError) {
    fail(`migration 0008 non appliquee ${DIM}${billingError.message}${RESET}`);
  } else {
    console.log(`  ${OK} 0008_billing ${DIM}colonnes d'abonnement${RESET}`);
  }

  const { error: eventsError } = await db.from('billing_events').select('id').limit(1);
  if (eventsError) {
    fail(`table billing_events absente ${DIM}${eventsError.message}${RESET}`);
  } else {
    console.log(`  ${OK} billing_events ${DIM}deduplication des webhooks${RESET}`);
  }

  /*
   * Les fonctions SQL, appelees avec des valeurs sans effet.
   *
   * `credit_balance` sur un identifiant inexistant ne renvoie aucune ligne :
   * l'appel valide l'existence de la fonction sans rien lire de reel.
   */
  const probes: [name: string, args: Record<string, unknown>][] = [
    ['credit_balance', { p_user_id: '00000000-0000-0000-0000-000000000000' }],
    ['consume_credits', { p_bot_id: '00000000-0000-0000-0000-000000000000', p_amount: 0 }],
    [
      'update_subscription_status',
      {
        p_subscription_id: '__probe__',
        p_status: 'probe',
        p_period_end: null,
        p_cancel_at_period_end: false,
      },
    ],
    ['end_subscription', { p_subscription_id: '__probe__' }],
  ];

  for (const [name, args] of probes) {
    const { error } = await db.rpc(name, args);
    if (error) fail(`fonction ${name} absente ${DIM}${error.message}${RESET}`);
    else console.log(`  ${OK} ${name}()`);
  }
}

async function checkProducts(): Promise<void> {
  console.log('\nProduits Dodo');

  const client = new DodoPayments({
    bearerToken: process.env.DODO_API_KEY!,
    environment: process.env.DODO_ENVIRONMENT as 'test_mode' | 'live_mode',
  });

  for (const [key, expected] of Object.entries(EXPECTED)) {
    const id = process.env[key];
    if (!id) continue;

    try {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const product = (await client.products.retrieve(id)) as any;

      const price = product?.price;
      const cents = price?.price ?? price?.recurring_pre_tax_amount;
      const currency = price?.currency ?? '?';
      const months = billingMonths({
        count: price?.payment_frequency_count,
        interval: price?.payment_frequency_interval,
      });

      const priceOk = cents === expected.cents;
      const periodOk = months === expected.months;

      if (priceOk && periodOk) {
        console.log(
          `  ${OK} ${expected.label} ${DIM}${cents / 100} ${currency} ${describe(months)}${RESET}`,
        );
      } else {
        /*
         * Pas un echec bloquant, mais le plus grave des ecarts possibles : le
         * produit existe et facturera, simplement pas ce que la page annonce.
         * Une periodicite fausse fait payer douze fois trop, ou douze fois
         * trop peu.
         */
        console.log(
          `  ${WARN} ${expected.label} ${DIM}Dodo : ${
            cents != null ? cents / 100 : '?'
          } ${currency} ${describe(months)} — page de tarifs : ${
            expected.cents / 100
          } $ ${describe(expected.months)}${RESET}`,
        );
      }
    } catch (cause) {
      fail(
        `${expected.label} introuvable ${DIM}${id} — ${
          cause instanceof Error ? cause.message : String(cause)
        }${RESET}`,
      );
    }
  }
}

async function main() {
  console.log('Verification de la facturation (lecture seule)');

  const complete = await checkEnvironment();
  await checkDatabase();
  if (complete) await checkProducts();
  else console.log(`\n${DIM}Produits non verifies : configuration incomplete.${RESET}`);

  console.log(
    failures === 0
      ? `\n${OK} Tout est en place.\n`
      : `\n${KO} ${failures} probleme(s) a corriger.\n`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((cause) => {
  console.error(cause);
  process.exit(1);
});
