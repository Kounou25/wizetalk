import type { Dictionary, Locale } from '@/lib/i18n';
import { PUBLIC_APP_URL } from '@/lib/public-url';

/**
 * Donnees structurees de la page Enterprise.
 *
 * AUCUN BLOC `offers`, ET C'EST LE POINT IMPORTANT
 *
 * Le balisage de la page de presentation declare les tarifs de Deezy Business,
 * parce que la page les affiche. Ici, la page annonce explicitement qu'il n'y a
 * pas de grille publique : y declarer un prix, meme approximatif, serait une
 * fausse declaration — exactement ce qui se sanctionne le plus surement en
 * referencement, et exactement ce que le brief interdit.
 *
 * Trois blocs, chacun pour une raison precise :
 *
 *   Service    decrit l'offre et a qui elle s'adresse. `audience` porte les
 *              secteurs vises, qui sont deja les titres des cartes de la page.
 *
 *   WebPage    rattache la page a l'organisation deja declaree par la landing,
 *              plutot que de redeclarer une seconde entite du meme nom.
 *
 *   FAQPage    rend les questions eligibles aux resultats enrichis. Google
 *              exige qu'elles soient VISIBLES sur la page : elles le sont,
 *              c'est la section FAQ, et les deux listes viennent de la meme
 *              cle du dictionnaire — impossible qu'elles divergent.
 *
 * Le balisage doit toujours decrire ce que la page montre, jamais davantage.
 */
export function EnterpriseStructuredData({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const url = `${PUBLIC_APP_URL}/${locale}/enterprise`;
  const t = dict.enterprise;

  const graph = [
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: t.meta.title,
      description: t.meta.description,
      inLanguage: locale,
      // L'organisation est declaree par la page d'accueil : on la reference,
      // on ne la recopie pas. Deux definitions divergeraient.
      isPartOf: { '@id': `${PUBLIC_APP_URL}/#website` },
      publisher: { '@id': `${PUBLIC_APP_URL}/#organization` },
    },
    {
      '@type': 'Service',
      name: 'Deezy Enterprise',
      serviceType: 'AI-powered customer assistance',
      description: t.meta.description,
      url,
      provider: { '@id': `${PUBLIC_APP_URL}/#organization` },
      // Les secteurs affiches par la section « cas d'usage », et rien d'autre.
      audience: t.useCases.items.map((item) => ({
        '@type': 'BusinessAudience',
        name: item.title,
      })),
      availableLanguage: ['fr', 'en'],
    },
    {
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: t.faq.items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    },
  ];

  return (
    <script
      type="application/ld+json"
      // Le contenu vient de nos propres dictionnaires, jamais d'une saisie
      // utilisateur. `JSON.stringify` echappe de toute facon les chevrons.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }),
      }}
    />
  );
}
