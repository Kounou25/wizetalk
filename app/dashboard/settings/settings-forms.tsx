'use client';

import { useActionState } from 'react';

import type { Dictionary } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updatePassword, updateProfile, type SettingsState } from './actions';

/** Retour d'une action : erreur ou confirmation, jamais les deux. */
function FormFeedback({ state }: { state: SettingsState }) {
  if (state.error) {
    return (
      <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
        {state.error}
      </p>
    );
  }

  if (state.message) {
    return (
      <p
        role="status"
        className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700"
      >
        {state.message}
      </p>
    );
  }

  return null;
}

export function ProfileForm({
  fullName,
  email,
  dict,
}: {
  fullName: string;
  email: string;
  dict: Dictionary;
}) {
  const t = dict.dashboard.account;
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    updateProfile,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="fullName">{t.fullName}</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          defaultValue={fullName}
          placeholder={t.fullNamePlaceholder}
          minLength={2}
          maxLength={80}
          required
          className="max-w-sm"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="settings-email">{t.email}</Label>
        {/* L'adresse est le point d'ancrage de la session et des envois : la
            changer ici ouvrirait un chemin de reprise de compte sans
            verification. Elle reste affichee, en lecture seule. */}
        <Input
          id="settings-email"
          type="email"
          value={email}
          readOnly
          disabled
          className="max-w-sm"
        />
        <p className="text-muted-foreground text-xs">{t.emailHint}</p>
      </div>

      <FormFeedback state={state} />

      <div>
        <Button
          type="submit"
          disabled={pending}
          className="bg-brand hover:bg-brand/90 text-brand-foreground"
        >
          {pending ? t.saving : t.save}
        </Button>
      </div>
    </form>
  );
}

export function PasswordForm({ dict }: { dict: Dictionary }) {
  const t = dict.dashboard.account;
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    updatePassword,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="currentPassword">{t.currentPassword}</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className="max-w-sm"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">{t.newPassword}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="max-w-sm"
        />
        <p className="text-muted-foreground text-xs">{t.passwordHint}</p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="max-w-sm"
        />
      </div>

      <FormFeedback state={state} />

      <div>
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? t.updating : t.updatePassword}
        </Button>
      </div>
    </form>
  );
}
