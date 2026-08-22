/**
 * Delivre une URL d'envoi signee vers le stockage.
 *
 * Le fichier ne transite JAMAIS par cette fonction : une fonction serverless
 * Vercel plafonne le corps d'une requete a 4,5 Mo, et charger un document en
 * memoire pour le rerouter serait de toute facon du gaspillage. Le navigateur
 * l'envoie directement a Supabase Storage, sur un chemin que nous imposons.
 */

import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ACCEPTED, MAX_FILE_BYTES, isAcceptedMime } from '@/lib/documents';

export const maxDuration = 30;

const payload = z.object({
  botId: z.uuid(),
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().min(1),
  size: z.number().int().positive(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });

  const parsed = payload.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  const { botId, fileName, mimeType, size } = parsed.data;

  if (!isAcceptedMime(mimeType)) {
    return NextResponse.json(
      { error: 'Format non pris en charge. PDF, Word ou texte uniquement.' },
      { status: 400 },
    );
  }
  if (size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: 'Fichier trop volumineux (10 Mo maximum).' }, { status: 400 });
  }

  // Lecture via le client de session : le RLS fait office de controle
  // d'appartenance, inutile de le reimplementer.
  const { data: bot } = await supabase
    .from('bots')
    .select('id')
    .eq('id', botId)
    .maybeSingle();

  if (!bot) return NextResponse.json({ error: 'Assistant introuvable.' }, { status: 404 });

  // Le chemin est impose par le serveur, jamais fourni par le client : c'est
  // ce qui garantit qu'un fichier atterrit sous le bon assistant.
  const path = `${botId}/${randomUUID()}.${ACCEPTED[mimeType].ext}`;

  const { data, error } = await createAdminClient()
    .storage.from('documents')
    .createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json(
      { error: `Envoi impossible : ${error?.message ?? 'inconnu'}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ path, token: data.token, fileName });
}
