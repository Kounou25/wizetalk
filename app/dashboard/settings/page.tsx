import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { getDictionary } from '@/lib/i18n';
import { getRequestLocale } from '@/lib/i18n/server';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LocaleSwitch } from '@/components/dashboard/locale-switch';
import { PageHeader, Panel, PanelHeader } from '@/components/dashboard/panel';
import { PasswordForm, ProfileForm } from './settings-forms';
import { isExhausted, isNearLimit, remaining } from '@/lib/credits';
import { getCreditBalance } from '@/lib/credits-db';
import { BillingPanel } from './billing-panel';

/** Date du prochain rechargement : un mois apres le debut de la periode. */
function nextRenewal(periodStartedAt: string): Date {
  const next = new Date(periodStartedAt);
  next.setMonth(next.getMonth() + 1);
  return next;
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

/** Traduit les parametres de retour en un message unique pour le panneau. */
function noticeFrom(params: Record<string, string | string[] | undefined>) {
  if (params.checkout === 'done') return 'done' as const;
  if (params.checkout === 'error' || params.checkout === 'invalid') return 'error' as const;
  if (params.portal === 'absent') return 'portal-absent' as const;
  if (params.portal === 'error') return 'portal-error' as const;
  return null;
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createClient();
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const t = dict.dashboard.account;
  const tc = dict.dashboard.credits;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Le proxy protege deja /dashboard ; ce garde-fou couvre l'expiration de
  // session entre le passage du proxy et le rendu.
  if (!user) redirect('/login');

  const [balance, { data: profile }, params] = await Promise.all([
    getCreditBalance(supabase, user.id),
    supabase
      .from('profiles')
      .select(
        'dodo_customer_id, subscription_status, billing_period, current_period_end, cancel_at_period_end',
      )
      .eq('user_id', user.id)
      .maybeSingle(),
    searchParams,
  ]);

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

      <BillingPanel
        balance={balance}
        subscriptionStatus={(profile?.subscription_status as string | null) ?? null}
        billingPeriod={(profile?.billing_period as 'monthly' | 'annual' | null) ?? null}
        currentPeriodEnd={(profile?.current_period_end as string | null) ?? null}
        cancelAtPeriodEnd={Boolean(profile?.cancel_at_period_end)}
        hasCustomer={Boolean(profile?.dodo_customer_id)}
        locale={locale}
        dict={dict}
        notice={noticeFrom(params)}
      />

      <Panel>
        <PanelHeader title={t.usageTitle} description={t.usageLead} />

        {balance ? (
          <div className="flex flex-col gap-4 p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-2xl font-semibold tabular-nums">
                {remaining(balance).toLocaleString(numberLocale)}{' '}
                <span className="text-muted-foreground text-sm font-normal">
                  {tc.remaining} {tc.of} {balance.included.toLocaleString(numberLocale)}
                </span>
              </p>
              <Badge variant={balance.plan === 'trial' ? 'neutral' : 'brand'}>
                {tc.plans[balance.plan]}
              </Badge>
            </div>

            <Progress
              value={balance.used}
              max={Math.max(1, balance.included)}
              label={tc.title}
              tone={
                isExhausted(balance) ? 'danger' : isNearLimit(balance) ? 'warning' : 'brand'
              }
            />

            {/* L'essai ne se recharge jamais : le dire ici evite au client
                d'attendre un renouvellement qui n'arrivera pas. */}
            <p className="text-muted-foreground text-xs">
              {balance.plan === 'trial'
                ? tc.trialNote
                : `${tc.renews} ${nextRenewal(balance.periodStartedAt).toLocaleDateString(numberLocale)}`}
            </p>

            {isExhausted(balance) && (
              <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
                {tc.exhaustedHint}
              </p>
            )}

            <div className="border-border border-t pt-4">
              <p className="text-sm font-medium">{tc.costTitle}</p>
              <ul className="text-muted-foreground mt-2 flex flex-col gap-1.5 text-sm">
                {tc.costs.map((cost) => (
                  <li key={cost} className="flex items-start gap-2">
                    <span
                      className="bg-brand mt-2 size-1.5 shrink-0 rounded-full"
                      aria-hidden
                    />
                    {cost}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground p-4 text-sm">{tc.exhausted}</p>
        )}
      </Panel>
    </div>
  );
}
