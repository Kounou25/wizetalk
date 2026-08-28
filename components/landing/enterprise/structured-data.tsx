import type { Dictionary, Locale } from '@/lib/i18n';
import { PUBLIC_APP_URL } from '@/lib/public-url';

/**
 * Donnees structurees de la page Enterprise.
 *
 * AUCUN BLOC `offers` — la page annonce qu'il n'y a pas de grille publique, et
 * y declarer un prix serait une fausse declaration.
 *
 * L'organisation est declaree par la page d'accueil : on la reference, on ne
 * la recopie pas. Les questions du bloc FAQPage viennent de la meme cle du
 * dictionnaire que la section FAQ, que Google exige visible sur la page.
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
