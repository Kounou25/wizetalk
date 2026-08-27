/**
 * Configuration publique d'un widget.
 *
 * Appelee par widget.js depuis le site du client, avant meme d'ouvrir
 * l'iframe : le lanceur a besoin de la couleur et de la position.
 *
 * Ne renvoie QUE des champs destines a etre publics. Ni l'URL du site, ni les
 * quotas, ni les domaines autorises n'ont a sortir d'ici.
 */

import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Cache court volontairement.
 *
 * Un client qui change la couleur ou le message d'accueil de son widget doit
 * voir l'effet sur son site en moins d'une minute, sinon il conclut que ca ne
 * marche pas. Une minute suffit deja a absorber l'essentiel du trafic.
 */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'public, max-age=30, s-maxage=60',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ botId: string }> },
) {
  const { botId } = await params;

  const { data: bot } = await createAdminClient()
    .from('bots')
    .select('id, name, welcome_message, primary_color, position, is_active, widget_locale')
    .eq('id', botId)
    .maybeSingle();

  if (!bot || !bot.is_active) {
    return Response.json({ error: 'Assistant indisponible.' }, { status: 404, headers: CORS });
  }

  return Response.json(
    {
      id: bot.id,
      name: bot.name,
      welcomeMessage: bot.welcome_message,
      primaryColor: bot.primary_color,
      position: bot.position,
      // « auto » laisse widget.js deduire ; 'fr' ou 'en' l'imposent.
      locale: bot.widget_locale ?? 'auto',
    },
    { headers: CORS },
  );
}
