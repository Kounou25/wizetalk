'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { canCreateBot } from '@/lib/quotas';

const botInput = z.object({
  name: z.string().trim().min(2, 'Donnez un nom à votre assistant.').max(60),
  websiteUrl: z.url("L'adresse du site n'est pas valide."),
});

export interface BotFormState {
  error?: string;
  saved?: boolean;
}

/** Complete "monentreprise.com" en "https://monentreprise.com". */
function withScheme(raw: string): string {
  const trimmed = raw.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export async function createBot(
  _prev: BotFormState,
  formData: FormData,
): Promise<BotFormState> {
  const parsed = botInput.safeParse({
    name: String(formData.get('name') ?? ''),
    websiteUrl: withScheme(String(formData.get('websiteUrl') ?? '')),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Formulaire invalide.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  /*
   * Plafond d'assistants du plan.
   *
   * Verifie a la creation, et nulle part ailleurs : les assistants deja crees
   * ne sont jamais desactives retroactivement. Un widget deja installe sur le
   * site d'un client ne doit pas s'eteindre parce que la regle a change.
   */
  const room = await canCreateBot(supabase, user.id);
  if (!room.allowed) {
    return {
      error:
        room.plan === 'trial'
          ? `Votre essai permet ${room.limit} assistant. Choisissez un plan pour en créer d’autres.`
          : `Votre plan permet ${room.limit} assistant${(room.limit ?? 0) > 1 ? 's' : ''}. Passez à un plan supérieur pour en créer davantage.`,
    };
  }

  const hostname = new URL(parsed.data.websiteUrl).hostname;

  const { data, error } = await supabase
    .from('bots')
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      website_url: parsed.data.websiteUrl,
      // Le widget ne repondra qu'aux pages servies depuis ce domaine.
      allowed_domains: [hostname.replace(/^www\./, '')],
    })
    .select('id')
    .single();

  if (error) return { error: `Création impossible : ${error.message}` };

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/bots');
  redirect(`/dashboard/bots/${data.id}`);
}

const botSettings = z.object({
  name: z.string().trim().min(2, "Donnez un nom à votre assistant.").max(60),
  welcomeMessage: z
    .string()
    .trim()
    .min(2, "Le message d'accueil ne peut pas être vide.")
    .max(200, "200 caractères maximum : c'est une bulle, pas une page."),
  // Hexadecimal a 6 chiffres : c'est ce que produit <input type="color">,
  // et ce que widget.js injecte tel quel dans un style inline.
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'La couleur doit être au format #RRGGBB.'),
  position: z.enum(['bottom-right', 'bottom-left']),
  leadCapture: z.boolean(),
  notifyLeads: z.boolean(),
});

/** Personnalisation du widget : nom, accueil, couleur, position. */
export async function updateBot(
  botId: string,
  _prev: BotFormState,
  formData: FormData,
): Promise<BotFormState> {
  const parsed = botSettings.safeParse({
    name: String(formData.get('name') ?? ''),
    welcomeMessage: String(formData.get('welcomeMessage') ?? ''),
    primaryColor: String(formData.get('primaryColor') ?? ''),
    position: String(formData.get('position') ?? ''),
    leadCapture: formData.get('leadCapture') === 'on',
    notifyLeads: formData.get('notifyLeads') === 'on',
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Formulaire invalide.' };
  }

  const supabase = await createClient();
  // Le RLS limite deja la mise a jour aux bots de l'utilisateur : un botId
  // etranger ne touche aucune ligne plutot que d'echouer bruyamment.
  const { error } = await supabase
    .from('bots')
    .update({
      name: parsed.data.name,
      welcome_message: parsed.data.welcomeMessage,
      primary_color: parsed.data.primaryColor,
      position: parsed.data.position,
      lead_capture: parsed.data.leadCapture,
      notify_leads: parsed.data.notifyLeads,
    })
    .eq('id', botId);

  if (error) return { error: `Enregistrement impossible : ${error.message}` };

  revalidatePath(`/dashboard/bots/${botId}`);
  revalidatePath('/dashboard/bots');
  revalidatePath('/dashboard');
  return { saved: true };
}

/**
 * Active ou desactive l'assistant.
 *
 * Desactive, /api/chat repond 403 et /api/widget/[botId] renvoie 404 : le
 * widget disparait des sites clients sans qu'ils aient a retirer le script.
 */
export async function setBotActive(botId: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from('bots').update({ is_active: isActive }).eq('id', botId);

  revalidatePath(`/dashboard/bots/${botId}`);
  revalidatePath('/dashboard/bots');
}

/** Marque un prospect comme traite, ou le remet en attente. */
export async function setLeadStatus(
  botId: string,
  leadId: string,
  status: 'new' | 'handled',
) {
  const supabase = await createClient();
  // Le RLS verifie l'appartenance : un leadId etranger ne touche aucune ligne.
  await supabase.from('leads').update({ status }).eq('id', leadId);

  revalidatePath(`/dashboard/bots/${botId}/leads`);
}

export async function deleteLead(botId: string, leadId: string) {
  const supabase = await createClient();
  await supabase.from('leads').delete().eq('id', leadId);

  revalidatePath(`/dashboard/bots/${botId}/leads`);
}

export async function deleteBot(botId: string) {
  const supabase = await createClient();
  // Le RLS garantit qu'on ne peut supprimer que ses propres bots ;
  // pages, chunks et conversations partent en cascade.
  await supabase.from('bots').delete().eq('id', botId);
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/bots');
  redirect('/dashboard/bots');
}
