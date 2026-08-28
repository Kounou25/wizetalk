import nodemailer, { type Transporter } from 'nodemailer';

/**
 * Transport SMTP.
 *
 * SMTP est le seul protocole d'envoi : IMAP, souvent fourni par le meme
 * hebergeur, ne sert qu'a LIRE les messages d'une boite. Les reponses a
 * hello@deezy.chat se consultent donc en IMAP, mais partent d'ici en SMTP.
 *
 * Le transport est mis en cache au niveau du module : sur une plateforme
 * serverless, une instance chaude reutilise la connexion d'une invocation a
 * l'autre plutot que de refaire la poignee de main TLS a chaque message.
 */

let cached: Transporter | null = null;

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
}

export function readSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !user || !password) return null;

  /*
   * 587 par defaut : c'est le port de soumission moderne (STARTTLS).
   * Le 465 utilise un TLS implicite  d'ou `secure` deduit du port, sauf
   * mention contraire explicite. Le 25 est presque toujours bloque en sortie
   * chez les hebergeurs, il ne faut pas s'en servir.
   */
  const port = Number(process.env.SMTP_PORT ?? 587);

  return {
    host,
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
    user,
    password,
  };
}

export function getTransport(config: SmtpConfig): Transporter {
  if (cached) return cached;

  cached = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.password },
    // Une fonction serverless est coupee sans preavis : mieux vaut echouer
    // vite que rester bloque sur un serveur qui ne repond pas.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

  return cached;
}

/** Verifie la connexion et l'authentification, sans envoyer de message. */
export async function verifySmtp(): Promise<{ ok: boolean; error?: string }> {
  const config = readSmtpConfig();
  if (!config) return { ok: false, error: 'Configuration SMTP absente.' };

  try {
    await getTransport(config).verify();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
