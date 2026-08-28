'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { getDictionary } from '@/lib/i18n';
import { getRequestLocale } from '@/lib/i18n/server';

export interface SettingsState {
  error?: string;
  message?: string;
}

/** Les messages suivent la langue choisie, comme le reste du tableau de bord. */
async function messages() {
  return getDictionary(await getRequestLocale()).dashboard.account;
}

export async function updateProfile(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const t = await messages();

  const parsed = z
    .string()
    .trim()
    .min(2)
    .max(80)
    .safeParse(String(formData.get('fullName') ?? ''));

  if (!parsed.success) return { error: t.errorName };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    // Meme cle que celle renseignee par Google et par l'inscription par
    // e-mail : le message de bienvenue n'a rien de particulier a savoir.
    data: { full_name: parsed.data },
  });

  if (error) return { error: t.errorGeneric };

  revalidatePath('/dashboard/settings');
  return { message: t.saved };
}

export async function updatePassword(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const t = await messages();

  const current = String(formData.get('currentPassword') ?? '');
  const next = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirmPassword') ?? '');

  if (next.length < 8) return { error: t.errorPassword };
  if (next !== confirm) return { error: t.errorMismatch };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return { error: t.errorGeneric };

  /*
   * Le mot de passe actuel est verifie avant tout changement.
   *
   * Supabase accepte updateUser({ password }) sur la seule foi de la session.
   * Cela suffit tant que la session est sure  et cesse de suffire des qu'elle
   * ne l'est plus : un poste laisse ouvert, un cookie recopie, et l'intrus
   * change le mot de passe puis verrouille le proprietaire dehors. La
   * verification transforme le vol de session en incident temporaire.
   */
  const { error: wrongPassword } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: current,
  });

  if (wrongPassword) return { error: t.errorCurrentPassword };

  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) return { error: t.errorGeneric };

  revalidatePath('/dashboard/settings');
  return { message: t.passwordSaved };
}
