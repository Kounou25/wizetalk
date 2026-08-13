import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import { DEFAULT_LOCALE, isLocale } from '@/lib/i18n/config';
import './globals.css';

/**
 * Plus Jakarta Sans : geometrique, chaleureuse, avec de vrais poids lourds
 * (800) pour les titres. Elle donne un caractere que la pile systeme n'a pas.
 * JetBrains Mono pour les extraits de code, qui sont un argument de vente ici.
 */
const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Wizetalk — le chatbot IA qui connaît votre site par cœur',
  description:
    "Wizetalk lit votre site web et répond à vos visiteurs 24 h/24 avec vos vraies informations. Une ligne de code à coller, aucune FAQ à rédiger.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // La langue est resolue par le proxy et transmise en en-tete : c'est le seul
  // moyen pour un layout racine unique de poser le bon attribut lang.
  const resolved = (await headers()).get('x-wizetalk-locale');
  const lang = isLocale(resolved) ? resolved : DEFAULT_LOCALE;

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable} min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
