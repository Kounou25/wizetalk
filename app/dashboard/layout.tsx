import { after } from 'next/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDictionary } from '@/lib/i18n';
import { getRequestLocale } from '@/lib/i18n/server';
import { isAdmin } from '@/lib/admin/guard';
import { requestOrigin } from '@/lib/request-origin';
import { sendWelcomeEmailOnce } from '@/lib/email/send-welcome';
import { DashboardShell } from '@/components/dashboard/shell';

/** "marie.dupont@exemple.fr" -> "MD" */
function initialsFromEmail(email: string): string {
  const local = email.split('@')[0] ?? '';
  const parts = local.split(/[._-]+/).filter(Boolean);
  const letters = parts.length >= 2 ? `${parts[0]?.[0]}${parts[1]?.[0]}` : local.slice(0, 2);
  return letters.toUpperCase();
}

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Le proxy protege deja /dashboard ; ce garde-fou couvre le cas ou la
  // session expire entre le passage du proxy et le rendu.
  if (!user) redirect('/login');

  // Le RLS restreint la lecture aux bots de l'utilisateur : la somme obtenue
  // est donc bien sa consommation, sans filtre supplementaire.
  const { data: bots } = await supabase.from('bots').select('messages_used, messages_quota');

  const usage = (bots ?? []).reduce(
    (total, bot) => ({
      used: total.used + (bot.messages_used ?? 0),
      quota: total.quota + (bot.messages_quota ?? 0),
    }),
    { used: 0, quota: 0 },
  );

  const [locale, admin] = await Promise.all([getRequestLocale(), isAdmin()]);

  /*
   * Message de bienvenue, envoye une seule fois.
   *
   * Ici plutot que dans l'inscription : c'est le seul endroit par lequel
   * passent les deux chemins d'inscription (mot de passe et Google OAuth).
   * L'idempotence vient du marqueur en base, pas de l'endroit d'appel.
   *
   * after() differe l'envoi apres l'envoi de la reponse : le tableau de bord
   * s'affiche sans attendre l'API de messagerie.
   */
  const appUrl = await requestOrigin();
  after(async () => {
    await sendWelcomeEmailOnce({
      id: user.id,
      email: user.email ?? '',
      fullName:
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined) ??
        null,
      locale,
      appUrl,
    });
  });

  return (
    <DashboardShell
      user={{ email: user.email ?? '', initials: initialsFromEmail(user.email ?? '?') }}
      botCount={bots?.length ?? 0}
      usage={usage}
      locale={locale}
      dict={getDictionary(locale)}
      isAdmin={admin}
    >
      {children}
    </DashboardShell>
  );
}
