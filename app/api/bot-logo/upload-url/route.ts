/**
 * Delivre une URL d'envoi signee pour le logo d'un assistant.
 *
 * Meme mecanique que /api/documents/upload-url : le fichier ne transite pas
 * par cette fonction, le navigateur l'envoie directement au stockage sur un
 * chemin que nous imposons. Un logo tient sous la limite de 4,5 Mo d'une
 * fonction serverless, mais faire transiter un binaire pour le reposter
 * ailleurs resterait du gaspillage — et deux chemins d'envoi differents dans
 * le meme produit finiraient par diverger.
 *
 * LE CHEMIN EST IMPOSE ICI
 *
 * `<bot_id>/<uuid>.<ext>` : c'est ce premier segment que verifie la politique
 * de stockage. Le laisser choisir au navigateur reviendrait a s'en remettre a
 * la seule politique, alors que les deux barrieres doivent tenir seules.
 *
 * UN NOM NEUF A CHAQUE ENVOI
 *
 * Le logo remplace n'est pas ecrase : un nouveau fichier est ecrit, et
 * l'ancien supprime par l'action serveur une fois la ligne mise a jour. Ecraser
 * le meme chemin laisserait les caches des visiteurs sur l'ancienne image, sans
 * moyen de les invalider — un seau public est servi avec un cache long.
 */

import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { LOGO_BUCKET, LOGO_MIME, MAX_LOGO_BYTES } from '@/lib/bot-logo';

export const maxDuration = 30;

const payload = z.object({
  botId: z.uuid(),
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

  const { botId, mimeType, size } = parsed.data;

  // L'entree porte l'extension de rangement : la recuperer ici vaut controle
  // du format, et evite un second acces indexe plus bas.
  const accepted = LOGO_MIME[mimeType];
  if (!accepted) {
    return NextResponse.json(
      { error: 'Format non pris en charge. PNG, JPG ou WebP uniquement.' },
      { status: 400 },
    );
  }
  if (size > MAX_LOGO_BYTES) {
    return NextResponse.json({ error: 'Fichier trop volumineux (1 Mo maximum).' }, { status: 400 });
  }

  // Lecture via le client de session : le RLS fait office de controle
  // d'appartenance, inutile de le reimplementer.
  const { data: bot } = await supabase
    .from('bots')
    .select('id')
    .eq('id', botId)
    .maybeSingle();

  if (!bot) return NextResponse.json({ error: 'Assistant introuvable.' }, { status: 404 });

  const path = `${botId}/${randomUUID()}.${accepted.ext}`;

  const { data, error } = await createAdminClient()
    .storage.from(LOGO_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json(
      { error: `Envoi impossible : ${error?.message ?? 'inconnu'}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ path, token: data.token });
}
