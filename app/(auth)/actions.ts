'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requestOrigin } from '@/lib/request-origin';

/**
 * N'accepte qu'un chemin interne.
 *
 * Sans ce filtre, `?next=https://site-malveillant.com` transformerait la
 * connexion en redirection ouverte  un classique du phishing : le lien part
 * bien de votre domaine, mais atterrit ailleurs.
 */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === 'string' ? value : '';
  return next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
}


const credentials = z.object({
  email: z.email("L'adresse e-mail n'est pas valide."),
  password: z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères.'),
});

/**
 * L'inscription par e-mail demande en plus le nom.
 *
 * Google le transmet deja ; sur ce chemin-la, personne d'autre ne peut nous le
 * donner. Il sert des le message de bienvenue, qui se contentait jusqu'ici de
 * deviner un prenom a partir de l'adresse.
 */
const registration = credentials.extend({
  fullName: z
    .string()
    .trim()
    .min(2, 'Indiquez votre nom et prénom.')
    .max(80, 'Ce nom est trop long.'),
});

export interface AuthState {
  error?: string;
  message?: string;
}

function readCredentials(formData: FormData) {
  return credentials.safeParse({
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
  });
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = readCredentials(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Identifiants invalides.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    // Message volontairement identique pour un e-mail inconnu et un mot de
    // passe faux : sinon le formulaire permet d'enumerer les comptes.
    return { error: 'E-mail ou mot de passe incorrect.' };
  }

  revalidatePath('/', 'layout');
  redirect(safeNext(formData.get('next')));
}

/** Demarre le flux OAuth Google  Supabase fournit l'URL de consentement. */
export async function signInWithGoogle(formData: FormData): Promise<void> {
  const next = safeNext(formData.get('next'));
  const origin = await requestOrigin();

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data.url) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? 'oauth_failed')}`);
  }

  redirect(data.url);
}

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registration.safeParse({
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
    fullName: String(formData.get('fullName') ?? ''),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Identifiants invalides.' };
  }

  const { fullName, ...credentialsOnly } = parsed.data;
  const origin = await requestOrigin();

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...credentialsOnly,
    options: {
      // Range dans user_metadata.full_name  la meme cle que renseigne
      // Google, donc le message de bienvenue n'a rien de particulier a savoir.
      data: { full_name: fullName },

      /*
       * Ou aboutit le lien de confirmation.
       *
       * Sans cette adresse, Supabase renvoie le visiteur vers la « Site URL »
       * du projet  la page d'accueil. Il y arrive deconnecte, puisque rien,
       * la-bas, n'echange le code contre une session : l'inscription semble
       * n'avoir servi a rien. Le passage par /auth/callback est ce qui ouvre
       * la session, exactement comme apres une connexion Google.
       *
       * L'adresse doit figurer dans les « Redirect URLs » du projet Supabase.
       * Toute URL absente de cette liste est silencieusement remplacee par la
       * Site URL  meme symptome, sans le moindre message d'erreur.
       */
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(
        safeNext(formData.get('next')),
      )}`,
    },
  });

  if (error) return { error: error.message };

  // Si la confirmation par e-mail est active, aucune session n'est ouverte.
  if (!data.session) {
    return { message: 'Vérifiez votre boîte mail pour confirmer votre inscription.' };
  }

  redirect('/dashboard');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
