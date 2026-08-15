import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // jsdom et @mozilla/readability ont ete retires du projet : leur chaine de
  // dependances faisait un require() sur un module ES, refuse par le runtime
  // serverless. cheerio, lui, se bundle sans probleme.

  /**
   * Machines autorisees a charger les ressources du serveur de developpement.
   *
   * Depuis Next 15.3, une requete de dev provenant d'une autre origine que
   * localhost est refusee : sans cette liste, un telephone du meme reseau
   * obtient une page blanche et des erreurs sur les fichiers du bundle.
   * N'a aucun effet en production.
   */
  allowedDevOrigins: ['192.168.1.193', '*.local'],

  async headers() {
    return [
      {
        // Le widget est charge depuis les sites des clients : il lui faut
        // un CORS permissif, sinon aucun navigateur ne l'executera.
        source: '/widget.js',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cache-Control', value: 'public, max-age=300, s-maxage=3600' },
        ],
      },
    ];
  },
};

export default nextConfig;
