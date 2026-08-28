/**
 * Supprime un document importe.
 *
 * Trois choses a effacer, pas une : la ligne de `pages`, ses morceaux (qui
 * partent en cascade) et le fichier stocke. Aucune contrainte SQL ne va
 * jusqu'au stockage  sans cet appel explicite, les fichiers s'accumuleraient
 * indefiniment et le client continuerait de payer pour eux.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const maxDuration = 30;

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });

  // Lecture via le client de session : le RLS garantit que le document
  // appartient bien a un assistant de l'utilisateur.
  const { data: page } = await supabase
    .from('pages')
    .select('id, storage_path, source')
    .eq('id', documentId)
    .eq('source', 'document')
    .maybeSingle();

  if (!page) return NextResponse.json({ error: 'Document introuvable.' }, { status: 404 });

  const admin = createAdminClient();

  if (page.storage_path) {
    await admin.storage.from('documents').remove([page.storage_path as string]);
  }
  await admin.from('pages').delete().eq('id', documentId);

  return NextResponse.json({ ok: true });
}
