import 'dotenv/config';
import * as cheerio from 'cheerio';
import { fetchText } from '../lib/http';

const NOISE = [
  'script','style','noscript','iframe','svg','form','nav','header','footer','aside',
  '[role="navigation"]','[role="banner"]','[role="contentinfo"]','[aria-hidden="true"]',
  '.cookie','.cookies','#cookie-banner','.newsletter','.breadcrumb','.breadcrumbs',
  '.sidebar','.menu','.navbar','.social','.share','.advertisement','.ads',
];

async function main() {
  const url = process.argv[2] ?? 'https://www.python.org/jobs';
  const res = await fetchText(url);
  console.log(`\n${url} — ${res.body.length} octets\n`);

  const $ = cheerio.load(res.body);
  const total = () => $('body').text().replace(/\s+/g, ' ').trim().length;

  console.log(`  texte du body avant nettoyage : ${total()}\n`);
  console.log('  sélecteur                       éléments   texte retiré');
  console.log('  ' + '-'.repeat(58));

  for (const selector of NOISE) {
    const found = $(selector);
    if (found.length === 0) continue;
    const removed = found.text().replace(/\s+/g, ' ').trim().length;
    if (removed > 0) {
      console.log(
        `  ${selector.padEnd(30)} ${String(found.length).padStart(5)}   ${String(removed).padStart(8)}c`,
      );
    }
  }

  const before = total();
  $(NOISE.join(', ')).remove();
  console.log(`\n  après nettoyage : ${total()} (perdu ${before - total()}c)\n`);
}

main().catch((e) => { console.error(e); process.exit(1); });
