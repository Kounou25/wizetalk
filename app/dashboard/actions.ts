'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { canCreateBot, getPlan } from '@/lib/quotas';
import { getLimitsFor } from '@/lib/plans-db';
import { buildUpgradeOffer, type UpgradeOffer } from '@/lib/upgrade';

const botInput = z.object({
  name: z.string().trim().min(2, 'Donnez un nom à votre assistant.').max(60),
  websiteUrl: z.url("L'adresse du site n'est pas valide."),
});

export interface BotFormState {
  error?: string;
  /** Limite atteinte : le formulaire ouvre la proposition de mise a niveau. */
  upgrade?: UpgradeOffer;
  /**
   * Assistant cree. Le formulaire enchaine alors sur l'analyse du site.
   *
   * Renvoye plutot que redirige : la redirection quittait la page avant que
   * quoi que ce soit ait pu demarrer, et l'analyse est pilotee par l'onglet.
   */
  botId?: string;
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
    /*
     * On ne renvoie pas une phrase, mais la proposition entiere.
     *
     * Le formulaire ouvre alors un dialogue qui montre ce que le palier
     * suivant apporte. Un message d'erreur seul laisse le client devant une
     * porte fermee ; la comparaison lui donne une raison d'avancer.
     */
    return { upgrade: await buildUpgradeOffer(room.plan, 'bots') };
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
  return { botId: data.id as string };
}

const botSettings = z.object({
  name: z.string().trim().min(2, "Donnez un nom à votre assistant.").max(60),
  /*
   * Vide est une valeur, pas une erreur : elle signifie « garde l'accueil de
   * Deezy », qui suit alors la langue du visiteur. L'imposer non vide obligeait
   * chaque proprietaire a figer une langue sans le savoir.
   */
  welcomeMessage: z
    .string()
    .trim()
    .max(200, "200 caractères maximum : c'est une bulle, pas une page."),
  // Hexadecimal a 6 chiffres : c'est ce que produit <input type="color">,
  // et ce que widget.js injecte tel quel dans un style inline.
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'La couleur doit être au format #RRGGBB.'),
  position: z.enum(['bottom-right', 'bottom-left']),
  leadCapture: z.boolean(),
  notifyLeads: z.boolean(),
  hideBranding: z.boolean(),
  // Domaine ferme, comme la contrainte en base : une valeur inattendue
  // produirait une fenetre sans libelles chez le visiteur.
  widgetLocale: z.enum(['auto', 'fr', 'en']),
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
    hideBranding: formData.get('hideBranding') === 'on',
    widgetLocale: String(formData.get('widgetLocale') ?? 'auto'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Formulaire invalide.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const changes: Record<string, unknown> = {
    name: parsed.data.name,
    welcome_message: parsed.data.welcomeMessage || null,
    primary_color: parsed.data.primaryColor,
    position: parsed.data.position,
    lead_capture: parsed.data.leadCapture,
    notify_leads: parsed.data.notifyLeads,
    widget_locale: parsed.data.widgetLocale,
  };

  /*
   * Le retrait de la mention ne s'enregistre que si le palier l'inclut.
   *
   * L'interrupteur est verrouille dans l'interface, mais un formulaire forge
   * enverrait le champ quand meme. La regle qui compte est celle-ci, cote
   * serveur : sans elle, l'option se contournerait avec une ligne de console.
   *
   * Hors palier, la colonne n'est pas ecrite du tout  plutot que forcee a
   * false. Le choix du client survit ainsi a un changement de plan et
   * redevient effectif s'il remonte, sans qu'il ait a le refaire.
   */
  const limits = await getLimitsFor(await getPlan(supabase, user.id));
  if (limits.removeBranding) changes.hide_branding = parsed.data.hideBranding;

  // Le RLS limite deja la mise a jour aux bots de l'utilisateur : un botId
  // etranger ne touche aucune ligne plutot que d'echouer bruyamment.
  const { error } = await supabase.from('bots').update(changes).eq('id', botId);

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
