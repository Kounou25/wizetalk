/**
 * Demarre une analyse de site.
 *
 * Ne fait qu'ouvrir le job : le travail reel est effectue tick par tick par
 * /api/crawl/tick, car une invocation serverless ne peut pas porter un crawl
 * complet.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { pageLimit } from '@/lib/plans';
import { getPlan } from '@/lib/quotas';

export const maxDuration = 60;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  const { botId } = (await request.json()) as { botId?: string };
  if (!botId) {
    return NextResponse.json({ error: 'botId manquant.' }, { status: 400 });
  }

  // Lecture via le client de session : le RLS fait office de controle
  // d'appartenance, inutile de le reimplementer.
  const { data: bot } = await supabase
    .from('bots')
    .select('id, website_url, user_id')
    .eq('id', botId)
    .maybeSingle();

  if (!bot) {
    return NextResponse.json({ error: 'Assistant introuvable.' }, { status: 404 });
  }

  try {
    const admin = createAdminClient();

    // Un seul job actif a la fois : sinon deux crawls concurrents se marchent
    // dessus sur les memes pages.
    const { data: running } = await admin
      .from('crawl_jobs')
      .select('id')
      .eq('bot_id', botId)
      .in('status', ['pending', 'crawling', 'embedding'])
      .maybeSingle();

    if (running) {
      return NextResponse.json({ jobId: running.id, resumed: true });
    }

    /*
     * Le plafond de pages vient du plan, pas d'une valeur par defaut.
     *
     * La colonne valait 50 pour tout le monde : un client Entreprise a qui l'on
     * promettait 2 000 pages en obtenait 50, et un compte en essai autant qu'un
     * client payant. C'est ici, a la creation du job, que le palier prend effet.
     */
    const plan = await getPlan(admin, bot.user_id as string);

    const { data: job, error } = await admin
      .from('crawl_jobs')
      .insert({ bot_id: botId, status: 'pending', max_pages: pageLimit(plan) })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await admin.from('bots').update({ status: 'crawling' }).eq('id', botId);

    return NextResponse.json({ jobId: job.id, resumed: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[crawl/start]', message, error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
