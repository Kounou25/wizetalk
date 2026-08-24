export interface BotSummary {
  id: string;
  name: string;
  website_url: string;
  status: string;
  last_synced_at: string | null;
}

/** « https://www.exemple.fr/a » -> « exemple.fr ». L'URL brute est trop longue
 *  pour une ligne de liste, et le protocole n'apprend rien au lecteur. */
export function hostOf(websiteUrl: string): string {
  try {
    return new URL(websiteUrl).hostname.replace(/^www\./, '');
  } catch {
    return websiteUrl;
  }
}

/** Initiale affichee dans la pastille. Pas de favicon distant : le tableau de
 *  bord ne depend d'aucun tiers pour s'afficher. */
export function initialOf(name: string): string {
  return (name.trim()[0] ?? '?').toUpperCase();
}

/** Date de derniere analyse, ou la mention « jamais ». */
export function lastSyncLabel(
  bot: BotSummary,
  locale: 'fr' | 'en',
  labels: { analysedOn: string; neverAnalysed: string },
): string {
  if (!bot.last_synced_at) return labels.neverAnalysed;

  const date = new Date(bot.last_synced_at).toLocaleDateString(
    locale === 'fr' ? 'fr-FR' : 'en-US',
    { day: 'numeric', month: 'short', year: 'numeric' },
  );
  return `${labels.analysedOn} ${date}`;
}
