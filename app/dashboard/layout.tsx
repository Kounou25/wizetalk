import type { Metadata } from 'next';
import { after } from 'next/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDictionary } from '@/lib/i18n';
import { getRequestLocale } from '@/lib/i18n/server';
import { isAdmin } from '@/lib/admin/guard';
import { requestOrigin } from '@/lib/request-origin';
import { sendWelcomeEmailOnce } from '@/lib/email/send-welcome';
import { DashboardShell } from '@/components/dashboard/shell';
/*
 * Interdit d'indexation.
 *
 * Ces pages redirigent deja un visiteur anonyme, donc rien ne fuiterait — mais
 * un robot qui les demande consomme du budget d'exploration pour recevoir une
 * redirection, budget pris sur les pages qu'on veut voir indexees. robots.txt
 * le dit deja ; cette balise le repete pour les robots qui l'ignorent.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

import { getMessageBalance } from '@/lib/quotas';
import { isExhausted } from '@/lib/plans';
import { buildUpgradeOffer } from '@/lib/upgrade';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import { ACQ_COOKIE, decodeAcquisition, recordAcquisitionOnce } from '@/lib/acquisition';

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

  // Le portefeuille est unique et porte par le compte : une seule lecture, au
  // lieu d'une somme sur les assistants qui donnait autant de quotas que de
  // bots. `bots` ne sert plus qu'a alimenter le compteur de la navigation.
  const [{ count: botCount }, balance, locale, admin] = await Promise.all([
    supabase.from('bots').select('id', { count: 'exact', head: true }),
    getMessageBalance(supabase, user.id),
    getRequestLocale(),
    isAdmin(),
  ]);

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
  /*
   * Quota epuise : on prepare la proposition de mise a niveau.
   *
   * Calculee ici et pas systematiquement — c'est une lecture de plus, inutile
   * tant que la jauge n'est pas au bout.
   */
  const messagesOffer =
    balance && isExhausted(balance) ? await buildUpgradeOffer(balance.plan, 'messages') : null;

  /*
   * Provenance du compte, ecrite au premier passage dans le tableau de bord.
   *
   * Ici parce que c'est le seul endroit traverse par les deux chemins
   * d'inscription — mot de passe et Google — et parce que le declencheur SQL
   * qui cree la ligne `profiles` tourne dans Postgres, sans acces aux cookies.
   */
  const acq = decodeAcquisition((await cookies()).get(ACQ_COOKIE)?.value);

  const appUrl = await requestOrigin();
  after(async () => {
    await recordAcquisitionOnce(
      createAdminClient(),
      user.id,
      user.created_at,
      acq,
    );

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
      botCount={botCount ?? 0}
      balance={balance}
      messagesOffer={messagesOffer}
      locale={locale}
      dict={getDictionary(locale)}
      isAdmin={admin}
    >
      {children}
    </DashboardShell>
  );
}
