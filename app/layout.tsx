import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { JetBrains_Mono, Sora } from 'next/font/google';
import { DEFAULT_LOCALE, isLocale } from '@/lib/i18n/config';
import { PUBLIC_APP_URL } from '@/lib/public-url';
import './globals.css';

/**
 * Sora : geometrique, un peu technique, avec des terminaisons franches. Elle
 * accompagne le logotype sans lui repondre en echo, et tient aussi bien un
 * titre de landing qu'un libelle de tableau de bord.
 *
 * Chargee en fonte variable (100-800) : un seul fichier couvre tous les poids
 * utilises, au lieu d'une requete par graisse.
 *
 * JetBrains Mono pour les extraits de code, qui sont un argument de vente ici.
 */
const sans = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  /*
   * `metadataBase` est ce qui transforme les chemins relatifs des pages en
   * URL absolues. Sans elle, l'image de partage part en `/opengraph-image` —
   * une adresse qui ne veut rien dire pour Facebook, LinkedIn ou WhatsApp, qui
   * n'affichent alors aucun apercu.
   */
  metadataBase: new URL(PUBLIC_APP_URL),

  title: {
    default: 'Deezy — le chatbot IA qui connaît votre site par cœur',
    // Les pages qui posent un titre le voient complete de la marque : une
    // page de resultat sans nom d'editeur se clique moins.
    template: '%s · Deezy',
  },
  description:
    'Deezy lit votre site web et répond à vos visiteurs 24 h/24 avec vos vraies informations. Une ligne de code à coller, aucune FAQ à rédiger.',

  applicationName: 'Deezy',
  authors: [{ name: 'Deezy' }],
  creator: 'Deezy',
  publisher: 'Deezy',

  /*
   * Mots-cles : Google les ignore depuis 2009, d'autres moteurs les lisent
   * encore. Ils sont surtout ici comme reference explicite du positionnement
   * — le vrai referencement se joue dans le titre, la description et le
   * contenu, pas dans cette balise.
   */
  keywords: [
    'chatbot IA',
    'chatbot site web',
    'assistant IA site internet',
    'agent conversationnel',
    'chatbot sans code',
    'support client automatisé',
    'capture de prospects',
    'AI chatbot for website',
    'website AI assistant',
    'lead capture chatbot',
  ],

  openGraph: {
    type: 'website',
    siteName: 'Deezy',
    title: 'Deezy — le chatbot IA qui connaît votre site par cœur',
    description:
      'Un assistant qui répond à vos visiteurs 24 h/24 avec vos vraies informations, et récupère leur e-mail quand il ne sait pas.',
  },

  twitter: {
    // `summary_large_image` affiche l'image en pleine largeur ; `summary` la
    // reduit a une vignette carree, ce qui gaspille une image 1200×630.
    card: 'summary_large_image',
    title: 'Deezy — le chatbot IA qui connaît votre site par cœur',
    description:
      'Un assistant qui répond à vos visiteurs 24 h/24 avec vos vraies informations, et récupère leur e-mail quand il ne sait pas.',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Autorise les extraits longs et les grandes vignettes : sans ces
      // directives, Google se limite par defaut sur certains marches.
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },

  icons: {
    icon: '/favicon.ico',
    // Redimensionnee a 180 px : l'original fait 1254 px pour presque 1 Mo,
    // que les appareils Apple telechargeraient integralement.
    apple: '/apple-icon.png',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // La langue est resolue par le proxy et transmise en en-tete : c'est le seul
  // moyen pour un layout racine unique de poser le bon attribut lang.
  const resolved = (await headers()).get('x-deezy-locale');
  const lang = isLocale(resolved) ? resolved : DEFAULT_LOCALE;

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable} min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
