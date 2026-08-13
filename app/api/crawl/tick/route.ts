/**
 * Avance une analyse d'un cran.
 *
 * Le dashboard rappelle cette route tant que `done` est faux. L'onglet du
 * navigateur joue donc le role d'ordonnanceur — la solution la plus simple qui
 * fonctionne en serverless, sans file d'attente ni service tiers.
 *
 * Si l'onglet est ferme en cours de route, rien n'est perdu : l'etat vit en
 * base et le job reprend au tick suivant.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { runIndexTick } from '@/lib/indexer';

export const maxDuration = 60;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  const { jobId } = (await request.json()) as { jobId?: string };
  if (!jobId) {
    return NextResponse.json({ error: 'jobId manquant.' }, { status: 400 });
  }

  // Lu avec le client de session : le RLS sur crawl_jobs remonte jusqu'au
  // proprietaire du bot, donc un job qui n'est pas le sien reste invisible.
  const { data: job } = await supabase
    .from('crawl_jobs')
    .select('id')
    .eq('id', jobId)
    .maybeSingle();

  if (!job) {
    return NextResponse.json({ error: 'Analyse introuvable.' }, { status: 404 });
  }

  const result = await runIndexTick(createAdminClient(), jobId);
  return NextResponse.json(result);
}
