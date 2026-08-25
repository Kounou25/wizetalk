/**
 * Traite un document deja televerse : extraction, decoupage, vectorisation.
 *
 * Un fichier par requete, volontairement. Un PDF de 50 pages donne une
 * centaine de morceaux, soit deux appels d'embedding groupes — largement sous
 * les 60 secondes d'une fonction serverless. Inutile d'ajouter une machinerie
 * de file d'attente : le navigateur boucle sur les fichiers, comme il le fait
 * deja pour l'analyse du site.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { chunkPage } from '@/lib/chunker';
import { embedDocuments } from '@/lib/embeddings';
import { replaceChunks } from '@/lib/database';
import {
  MAX_FILE_BYTES,
  isAcceptedMime,
  matchesSignature,
  parseDocument,
} from '@/lib/documents';
import type { EmbeddedChunk } from '@/lib/types';
import { CREDIT_COST } from '@/lib/credits';
import { consumeCredits } from '@/lib/credits-db';

export const maxDuration = 60;

const payload = z.object({
  botId: z.uuid(),
  path: z.string().min(1),
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().min(1),
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

  const { botId, path, fileName, mimeType } = parsed.data;

  if (!isAcceptedMime(mimeType)) {
    return NextResponse.json({ error: 'Format non pris en charge.' }, { status: 400 });
  }

  const { data: bot } = await supabase.from('bots').select('id').eq('id', botId).maybeSingle();
  if (!bot) return NextResponse.json({ error: 'Assistant introuvable.' }, { status: 404 });

  // Le chemin doit commencer par l'identifiant du bot : sans cette
  // verification, un client pourrait faire analyser le fichier d'un autre.
  if (!path.startsWith(`${botId}/`)) {
    return NextResponse.json({ error: 'Chemin invalide.' }, { status: 403 });
  }

  const admin = createAdminClient();

  try {
    const { data: blob, error: downloadError } = await admin.storage
      .from('documents')
      .download(path);

    if (downloadError || !blob) {
      return NextResponse.json({ error: 'Fichier introuvable.' }, { status: 404 });
    }
    if (blob.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: 'Fichier trop volumineux.' }, { status: 400 });
    }

    const buffer = await blob.arrayBuffer();

    /*
     * Le type annonce par le navigateur ne se croit pas : n'importe qui peut
     * appeler cette route en declarant « application/pdf » pour tout autre
     * chose. Les premiers octets, eux, ne mentent pas.
     */
    if (!matchesSignature(new Uint8Array(buffer.slice(0, 8)), mimeType)) {
      await admin.storage.from('documents').remove([path]);
      return NextResponse.json(
        { error: 'Le contenu du fichier ne correspond pas à son format.' },
        { status: 400 },
      );
    }

    /*
     * Debit avant traitement.
     *
     * L'ordre compte : c'est l'analyse puis la vectorisation qui coutent, pas
     * le televersement. On debite donc une fois le fichier valide mais avant
     * de l'envoyer au modele — un compte a sec ne declenche aucun appel
     * facturable.
     */
    const debit = await consumeCredits(admin, botId, CREDIT_COST.document);
    if (!debit.allowed) {
      await admin.storage.from('documents').remove([path]);
      return NextResponse.json(
        {
          error:
            'Crédits épuisés : ce document ne peut pas être traité. Rechargez votre compte pour continuer.',
          code: 'credits_exhausted',
        },
        { status: 402 },
      );
    }

    const document = await parseDocument(buffer, mimeType, fileName, path);

    if (!document) {
      await admin.storage.from('documents').remove([path]);
      return NextResponse.json(
        {
          error:
            "Aucun texte exploitable trouvé. S'il s'agit d'un PDF scanné, il ne contient que des images.",
        },
        { status: 422 },
      );
    }

    const { data: page, error: pageError } = await admin
      .from('pages')
      .upsert(
        {
          bot_id: botId,
          url: path,
          title: document.title,
          content: document.text,
          sections: document.sections,
          content_hash: document.contentHash,
          source: 'document',
          file_name: fileName,
          file_size: blob.size,
          storage_path: path,
        },
        { onConflict: 'bot_id,url' },
      )
      .select('id')
      .single();

    if (pageError || !page) {
      return NextResponse.json(
        { error: `Enregistrement impossible : ${pageError?.message}` },
        { status: 500 },
      );
    }

    // A partir d'ici, un document est traite exactement comme une page de
    // site : meme decoupage, memes embeddings, meme table de morceaux.
    const chunks = chunkPage(document);
    if (chunks.length === 0) {
      return NextResponse.json({ error: 'Document trop court pour être utile.' }, { status: 422 });
    }

    const vectors = await embedDocuments(chunks.map((chunk) => chunk.content));
    const embedded: EmbeddedChunk[] = chunks.map((chunk, index) => ({
      ...chunk,
      embedding: vectors[index] as number[],
    }));

    await replaceChunks(admin, botId, page.id as string, embedded);

    return NextResponse.json({
      id: page.id,
      title: document.title,
      chunks: embedded.length,
      truncated: document.truncated,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[documents]', message, error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
