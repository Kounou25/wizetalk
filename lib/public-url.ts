/**
 * Domaine public de Deezy.
 *
 * C'est l'adresse que reçoivent vos clients : celle du script d'intégration
 * qu'ils collent sur leur site, et celle vers laquelle ce script rappelle
 * ensuite l'API. Une fois collé chez eux, on ne peut plus le changer  il doit
 * donc désigner le domaine canonique, jamais l'URL par laquelle vous consultez
 * le tableau de bord (apex sans www, aperçu Vercel, IP de réseau local…).
 *
 * La valeur par défaut est le domaine réel, et non localhost : oublier
 * NEXT_PUBLIC_APP_URL au déploiement produit alors la bonne adresse au lieu
 * d'un script pointant vers la machine du visiteur. C'est exactement l'oubli
 * qui a déjà cassé la redirection OAuth, les balises canoniques, puis le
 * contrôle d'origine du widget.
 */
const CANONICAL = 'https://www.deezy.chat';

/*
 * La barre finale est retiree, pas supposee absente.
 *
 * Cette valeur est toujours suivie d'un chemin commencant par « / ». Une
 * variable ecrite « https://www.deezy.chat/ »  ce qui n'a rien d'anormal,
 * beaucoup d'interfaces d'hebergement la completent ainsi  produisait alors
 * « https://www.deezy.chat//widget.js » dans l'extrait que le client copie sur
 * son site. Le serveur redirige, donc cela fonctionne ; mais chaque visiteur
 * paie un aller-retour de plus, et l'extrait a l'air fautif.
 */
export const PUBLIC_APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? CANONICAL).replace(
  /\/+$/,
  '',
);

/**
 * Base des ressources destinées à quitter la machine  les images d'un e-mail,
 * par exemple.
 *
 * Toujours le domaine canonique, y compris en développement : un message part
 * chez quelqu'un d'autre, où http://localhost:3000 ne désigne pas votre poste
 * mais le sien. Un logo pointant vers localhost s'affiche parfaitement pendant
 * vos essais et reste blanc chez tous vos destinataires.
 */
export const PUBLIC_ASSET_URL = PUBLIC_APP_URL.includes('localhost')
  ? CANONICAL
  : PUBLIC_APP_URL;

/**
 * Adresse de contact du support.
 *
 * Definie ici avec le reste de l'identite publique : elle sert a la fois
 * d'expediteur des messages sortants et de point de contact affiche dans
 * l'aide. Deux valeurs recopiees finiraient par diverger, et le client
 * repondrait a une adresse que personne ne releve.
 */
export const SUPPORT_EMAIL = 'hello@deezy.chat';
