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
    .select('id, website_url')
    .eq('id', botId)
    .maybeSingle();

  if (!bot) {
    return NextResponse.json({ error: 'Assistant introuvable.' }, { status: 404 });
  }

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

  const { data: job, error } = await admin
    .from('crawl_jobs')
    .insert({ bot_id: botId, status: 'pending' })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await admin.from('bots').update({ status: 'crawling' }).eq('id', botId);

  return NextResponse.json({ jobId: job.id, resumed: false });
}
