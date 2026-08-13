import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Point d'atterrissage apres une connexion Google.
 *
 * Enchainement complet :
 *   /login → Google → https://<ref>.supabase.co/auth/v1/callback → ICI
 *
 * Supabase renvoie un `code` a usage unique que l'on echange contre une
 * session. L'echange doit avoir lieu dans un gestionnaire de route : c'est le
 * seul endroit ou l'ecriture de cookies est autorisee.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  // Derriere le proxy Vercel, request.url porte l'hote interne : les
  // redirections atterriraient sur une URL inaccessible au visiteur.
  // x-forwarded-host contient le domaine public reel.
  const forwardedHost = request.headers.get('x-forwarded-host');
  const origin = forwardedHost
    ? `${request.headers.get('x-forwarded-proto') ?? 'https'}://${forwardedHost}`
    : new URL(request.url).origin;

  const fail = (reason: string) =>
    NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(reason)}`);

  // Google peut refuser : consentement annule, compte non autorise…
  const oauthError = searchParams.get('error_description') ?? searchParams.get('error');
  if (oauthError) return fail(oauthError);

  if (!code) return fail('missing_code');

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return fail(error.message);

  // Ne rediriger que vers un chemin interne : sans cette verification,
  // `?next=https://site-malveillant.com` deviendrait une redirection ouverte.
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
  return NextResponse.redirect(`${origin}${safeNext}`);
}
