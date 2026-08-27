/**
 * Pilotage de l'analyse depuis le navigateur.
 *
 * L'onglet joue le role d'ordonnanceur : chaque appel a /api/crawl/tick avance
 * le job d'un cran, jusqu'a ce que le serveur reponde `done`. C'est ce qui
 * permet de tenir dans les limites de duree du serverless sans file d'attente
 * ni processus de fond.
 *
 * Extrait ici parce que deux ecrans le declenchent — la creation d'un
 * assistant et la resynchronisation depuis sa fiche — et que cette boucle
 * porte des details qu'on ne veut pas voir diverger : la reprise d'un job deja
 * ouvert, et le garde-fou sur les reponses non-JSON.
 */

export interface CrawlProgress {
  status: string;
  pagesFound: number;
  pagesDone: number;
  chunksDone: number;
  done: boolean;
  error?: string;
}

/**
 * Deroule l'analyse jusqu'au bout, en signalant chaque avancee.
 *
 * Leve une exception plutot que de renvoyer un etat d'erreur : l'appelant sait
 * mieux que cette fonction s'il faut afficher un encart rouge ou une page
 * entiere. Les erreurs METIER remontees par le serveur, elles, passent par
 * `progress.error` — ce ne sont pas des pannes, mais des resultats.
 */
export async function runCrawl(
  botId: string,
  onProgress: (progress: CrawlProgress) => void,
): Promise<void> {
  const startResponse = await fetch('/api/crawl', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ botId }),
  });

  const started = (await startResponse.json()) as { jobId?: string; error?: string };
  if (!started.jobId) throw new Error(started.error ?? 'Analyse impossible.');

  let done = false;
  while (!done) {
    const tickResponse = await fetch('/api/crawl/tick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: started.jobId }),
    });

    /*
     * Une coupure de la plateforme (502, 504, delai depasse) ne renvoie pas de
     * JSON. Sans ce garde-fou, l'analyse s'arreterait sur une erreur d'analyse
     * syntaxique au lieu de dire ce qui s'est reellement passe.
     */
    const raw = await tickResponse.text();
    let result: CrawlProgress;
    try {
      result = JSON.parse(raw) as CrawlProgress;
    } catch {
      throw new Error(
        `Le serveur a répondu ${tickResponse.status} : ${raw.slice(0, 200) || 'réponse vide'}`,
      );
    }

    onProgress(result);
    if (result.error) return;
    done = result.done;
  }
}
