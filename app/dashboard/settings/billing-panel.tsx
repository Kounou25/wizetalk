'use client';

import { useState } from 'react';
import { CreditCard, ExternalLink } from 'lucide-react';

import type { Dictionary, Locale } from '@/lib/i18n';
import { PLANS, type MessageBalance, type PlanId } from '@/lib/plans';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Segmented } from '@/components/ui/segmented';
import { SubmitButton } from '@/components/ui/submit-button';
import { Panel, PanelHeader } from '@/components/dashboard/panel';
import { openBillingPortal, subscribe } from './billing-actions';

type Period = 'monthly' | 'annual';

const PAID: Exclude<PlanId, 'trial'>[] = ['essential', 'growth', 'business'];

/**
 * Abonnement : etat courant et choix d'un plan.
 *
 * Le bouton de paiement n'accorde rien par lui-meme — il ouvre la page de Dodo.
 * Le plan ne prend effet qu'a la reception du webhook d'activation, ce qui
 * explique le message d'attente affiche au retour de paiement.
 */
export function BillingPanel({
  balance,
  subscriptionStatus,
  billingPeriod,
  currentPeriodEnd,
  cancelAtPeriodEnd,
  hasCustomer,
  locale,
  dict,
  notice,
}: {
  balance: MessageBalance | null;
  subscriptionStatus: string | null;
  billingPeriod: Period | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  hasCustomer: boolean;
  locale: Locale;
  dict: Dictionary;
  /** Message renvoye par la redirection de retour, s'il y en a un. */
  notice: 'done' | 'error' | 'portal-absent' | 'portal-error' | null;
}) {
  const t = dict.dashboard.billing;
  const tc = dict.dashboard.quota;
  const numberLocale = locale === 'fr' ? 'fr-FR' : 'en-US';

  // La periodicite proposee reprend celle deja souscrite : un client mensuel
  // qui vient changer de palier ne doit pas basculer en annuel sans le vouloir.
  const [period, setPeriod] = useState<Period>(billingPeriod ?? 'monthly');

  const activePlan = balance?.plan ?? 'trial';
  const subscribed = activePlan !== 'trial';

  const noticeText = {
    done: t.checkoutDone,
    error: t.checkoutError,
    'portal-absent': t.portalAbsent,
    'portal-error': t.portalError,
  };

  return (
    <Panel>
      <PanelHeader
        title={t.title}
        description={t.lead}
        action={
          subscriptionStatus && (
            <Badge
              variant={
                subscriptionStatus === 'active'
                  ? 'success'
                  : subscriptionStatus === 'on_hold' || subscriptionStatus === 'failed'
                    ? 'danger'
                    : 'neutral'
              }
            >
              {t.statusLabels[subscriptionStatus as keyof typeof t.statusLabels] ??
                subscriptionStatus}
            </Badge>
          )
        }
      />

      <div className="flex flex-col gap-4 p-4">
        {notice && (
          <p
            role="status"
            className={cn(
              'rounded-lg px-3 py-2 text-sm',
              notice === 'done'
                ? 'bg-emerald-500/10 text-emerald-700'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
            )}
          >
            {noticeText[notice]}
          </p>
        )}

        {subscribed ? (
          <div className="border-border flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs">{t.currentPlan}</p>
              <p className="mt-0.5 font-semibold">
                {tc.plans[activePlan]}
                <span className="text-muted-foreground font-normal">
                  {' · '}
                  {billingPeriod === 'annual' ? t.annual : t.monthly}
                </span>
              </p>
              {currentPeriodEnd && (
                <p className="text-muted-foreground mt-1 text-xs tabular-nums">
                  {cancelAtPeriodEnd ? t.endsOn : t.renewsOn}{' '}
                  {new Date(currentPeriodEnd).toLocaleDateString(numberLocale)}
                </p>
              )}
            </div>

            {hasCustomer && (
              <form action={openBillingPortal}>
                <SubmitButton variant="outline" icon={<CreditCard />}>
                  {t.manage}
                  <ExternalLink className="size-3.5" aria-hidden />
                </SubmitButton>
              </form>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm text-pretty">{t.noPlan}</p>
        )}

        {cancelAtPeriodEnd && (
          <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
            {t.cancelNotice}
          </p>
        )}

        <div className="border-border border-t pt-4">
          <Segmented
            label={t.title}
            value={period}
            onChange={setPeriod}
            options={[
              { value: 'monthly', label: t.monthly },
              { value: 'annual', label: `${t.annual} · ${t.annualSave}` },
            ]}
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {PAID.map((id) => {
              const plan = PLANS[id];
              const isCurrent = activePlan === id && billingPeriod === period;
              const price = period === 'annual' ? plan.annualMonthly : plan.monthly;

              return (
                <div
                  key={id}
                  className={cn(
                    'flex flex-col rounded-xl border p-3',
                    isCurrent ? 'border-brand bg-brand-soft/40' : 'border-border',
                  )}
                >
                  <p className="text-sm font-semibold">{tc.plans[id]}</p>

                  <p className="mt-1 text-lg font-bold tabular-nums">
                    {price} $
                    <span className="text-muted-foreground text-xs font-normal">
                      {t.perMonth}
                    </span>
                  </p>

                  {period === 'annual' && (
                    <p className="text-muted-foreground text-[11px] tabular-nums">
                      {plan.annualTotal} $ {t.perYear}
                    </p>
                  )}

                  <p className="text-brand mt-2 text-xs font-semibold tabular-nums">
                    {plan.messages.toLocaleString(numberLocale)} {tc.title.toLowerCase()}
                  </p>

                  {isCurrent ? (
                    <p className="text-muted-foreground mt-3 text-center text-xs font-medium">
                      {t.current}
                    </p>
                  ) : (
                    <form action={subscribe} className="mt-3">
                      <input type="hidden" name="plan" value={id} />
                      <input type="hidden" name="period" value={period} />
                      <SubmitButton
                        size="sm"
                        className="bg-brand hover:bg-brand/90 text-brand-foreground w-full"
                      >
                        {subscribed ? t.switchTo : t.choose}
                      </SubmitButton>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Panel>
  );
}
