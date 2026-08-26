'use client';

import { useActionState, useEffect, useState } from 'react';
import { Globe, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Dictionary, Locale } from '@/lib/i18n';
import { createBot, type BotFormState } from '@/app/dashboard/actions';
import { UpgradeDialog } from '@/components/dashboard/upgrade-dialog';

export function CreateBotForm({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [dismissed, setDismissed] = useState(false);
  const [state, formAction, pending] = useActionState<BotFormState, FormData>(
    createBot,
    {},
  );
  const t = dict.dashboard.newBot;

  /*
   * Chaque nouvelle reponse bloquee rouvre le dialogue.
   *
   * Sans ce `useEffect`, un client qui ferme la fenetre puis resoumet ne
   * reverrait rien : l'etat « ferme » survivrait a la nouvelle tentative, et
   * le formulaire semblerait ne rien faire.
   */
  useEffect(() => {
    if (state.upgrade) setDismissed(false);
  }, [state.upgrade]);

  return (
    <form
      action={formAction}
      className="panel flex flex-col gap-5 p-5"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">{t.nameLabel}</Label>
        <Input
          id="name"
          name="name"
          placeholder={t.namePlaceholder}
          maxLength={60}
          required
        />
        <p className="text-muted-foreground text-xs">{t.nameHint}</p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="websiteUrl">{t.urlLabel}</Label>
        <div className="relative">
          <Globe
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            id="websiteUrl"
            name="websiteUrl"
            placeholder={t.urlPlaceholder}
            className="pl-9"
            required
          />
        </div>
        <p className="text-muted-foreground text-xs">{t.urlHint}</p>
      </div>

      <UpgradeDialog
        offer={state.upgrade ?? null}
        open={Boolean(state.upgrade) && !dismissed}
        onClose={() => setDismissed(true)}
        locale={locale}
        dict={dict}
      />

      {state.error && (
        <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="bg-brand hover:bg-brand/90 text-brand-foreground self-start"
      >
        <Sparkles />
        {pending ? t.submitting : t.submit}
      </Button>
    </form>
  );
}
