import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { getDictionary } from '@/lib/i18n';
import { getRequestLocale } from '@/lib/i18n/server';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LocaleSwitch } from '@/components/dashboard/locale-switch';
import { PageHeader, Panel, PanelHeader } from '@/components/dashboard/panel';
import { PasswordForm, ProfileForm } from './settings-forms';

interface BotUsageRow {
  id: string;
  name: string;
  messages_used: number | null;
  messages_quota: number | null;
}

/**
 * Le compte a-t-il un mot de passe ?
 *
 * Un compte cree par Google n'en a pas : lui proposer un formulaire de
 * changement ne menerait qu'a un echec incomprehensible. `identities` liste
 * tous les moyens de connexion rattachés — un meme compte peut en cumuler
 * plusieurs. On retombe sur `app_metadata` quand la liste n'est pas fournie.
 */
function hasPasswordIdentity(user: {
  identities?: { provider: string }[] | null;
  app_metadata?: { provider?: string };
}): boolean {
  const identities = user.identities;
  if (identities && identities.length > 0) {
    return identities.some((identity) => identity.provider === 'email');
  }
  return user.app_metadata?.provider === 'email';
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const t = dict.dashboard.account;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Le proxy protege deja /dashboard ; ce garde-fou couvre l'expiration de
  // session entre le passage du proxy et le rendu.
  if (!user) redirect('/login');

  const { data } = await supabase
    .from('bots')
    .select('id, name, messages_used, messages_quota')
    .order('created_at', { ascending: false });

  const bots = (data ?? []) as BotUsageRow[];
  const withPassword = hasPasswordIdentity(user);
  const numberLocale = locale === 'fr' ? 'fr-FR' : 'en-US';

  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    '';

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <PageHeader title={t.title} description={t.lead} />

      <Panel>
        <PanelHeader
          title={t.profileTitle}
          description={t.profileLead}
          action={
            <Badge variant={withPassword ? 'neutral' : 'brand'}>
              {t.signedInWith} {withPassword ? t.providerPassword : t.providerGoogle}
            </Badge>
          }
        />
        <ProfileForm fullName={fullName} email={user.email ?? ''} dict={dict} />
      </Panel>

      <Panel>
        <PanelHeader title={t.languageTitle} description={t.languageLead} />
        <div className="p-4">
          <LocaleSwitch locale={locale} />
        </div>
      </Panel>

      <Panel>
        <PanelHeader title={t.securityTitle} description={t.securityLead} />
        {withPassword ? (
          <PasswordForm dict={dict} />
        ) : (
          <p className="text-muted-foreground p-4 text-sm text-pretty">{t.googleOnly}</p>
        )}
      </Panel>

      <Panel>
        <PanelHeader title={t.usageTitle} description={t.usageLead} />
        {bots.length === 0 ? (
          <p className="text-muted-foreground p-4 text-sm">{t.usageEmpty}</p>
        ) : (
          <ul className="divide-border divide-y">
            {bots.map((bot) => {
              const used = bot.messages_used ?? 0;
              const quota = bot.messages_quota ?? 0;
              const ratio = quota > 0 ? Math.min(1, used / quota) : 0;

              return (
                <li key={bot.id} className="flex flex-col gap-2 px-4 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-sm font-medium">{bot.name}</span>
                    <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                      {used.toLocaleString(numberLocale)} {dict.dashboard.nav.usageOf}{' '}
                      {quota.toLocaleString(numberLocale)}
                    </span>
                  </div>
                  <Progress
                    value={used}
                    max={Math.max(1, quota)}
                    label={bot.name}
                    tone={ratio >= 0.8 ? 'warning' : 'brand'}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
