import Script from 'next/script';

import { PUBLIC_APP_URL } from '@/lib/public-url';

/**
 * L'assistant « Deezy AI », celui qui a indexe ce site.
 *
 * Ecrit en clair plutot que dans une variable d'environnement : cet
 * identifiant part de toute facon dans le HTML de chaque visiteur, et une
 * variable oubliee au deploiement ferait disparaitre le widget sans bruit.
 */
const BOT_ID = 'dd6a47aa-72d9-4a69-8e00-686e7a4e5cd4';

/**
 * Notre propre widget, sur notre propre site.
 *
 * POURQUOI ICI ET PAS DANS LE LAYOUT RACINE
 *
 * Le layout racine couvre TOUT : le tableau de bord, le back-office, la
 * connexion — et surtout /chat/[botId], qui est la fenetre du widget
 * elle-meme. Le script s'y chargerait a l'interieur de son propre cadre.
 * La page de presentation est le seul endroit ou il a un sens : c'est la que
 * se trouvent les visiteurs qui ont des questions.
 *
 * `lazyOnload` le charge apres tout le reste. Un widget de discussion n'a
 * aucune raison de disputer la bande passante au premier ecran — ce qui
 * convainc, c'est la page, pas la bulle.
 */
export function DeezyWidget() {
  return (
    <Script src={`${PUBLIC_APP_URL}/widget.js`} data-bot={BOT_ID} strategy="lazyOnload" />
  );
}
