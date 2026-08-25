import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { JetBrains_Mono, Sora } from 'next/font/google';
import { DEFAULT_LOCALE, isLocale } from '@/lib/i18n/config';
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
  title: 'Deezy — le chatbot IA qui connaît votre site par cœur',
  description:
    "Deezy lit votre site web et répond à vos visiteurs 24 h/24 avec vos vraies informations. Une ligne de code à coller, aucune FAQ à rédiger.",
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
