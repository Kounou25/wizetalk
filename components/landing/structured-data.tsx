import type { Dictionary, Locale } from '@/lib/i18n';
import { PUBLIC_APP_URL } from '@/lib/public-url';
import { PLAN_PRICING, type PlanId } from '@/lib/plans';

/**
 * Donnees structurees de la page de presentation.
 *
 * Trois blocs, chacun pour une raison precise :
 *
 *   Organization         rattache le site a une entite nommee. C'est ce qui
 *                        permet a un moteur d'associer « Deezy » a ce domaine
 *                        plutot qu'a un homonyme.
 *
 *   SoftwareApplication  decrit le produit et ses tarifs. Les offres sont
 *                        lues depuis le meme dictionnaire que la grille
 *                        affichee : impossible qu'elles divergent.
 *
 *   FAQPage              rend les questions eligibles aux resultats enrichis.
 *                        Google exige que ces questions soient VISIBLES sur la
 *                        page — elles le sont, c'est la section FAQ.
 *
 * Le balisage doit toujours decrire ce que la page montre. Y declarer une note
 * moyenne ou un nombre d'avis qu'on n'a pas serait une fausse declaration, et
 * ce qui se sanctionne le plus surement en referencement.
 */
export function StructuredData({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const url = `${PUBLIC_APP_URL}/${locale}`;

  const graph = [
    {
      '@type': 'Organization',
      '@id': `${PUBLIC_APP_URL}/#organization`,
      name: 'Deezy',
      url: PUBLIC_APP_URL,
      logo: `${PUBLIC_APP_URL}/deezy-logo.png`,
      description: dict.meta.description,
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'hello@deezy.chat',
        availableLanguage: ['fr', 'en'],
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${PUBLIC_APP_URL}/#website`,
      url,
      name: 'Deezy',
      inLanguage: locale,
      publisher: { '@id': `${PUBLIC_APP_URL}/#organization` },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Deezy',
      applicationCategory: 'BusinessApplication',
      applicationSubCategory: 'Customer Service Chatbot',
      operatingSystem: 'Web',
      url,
      description: dict.meta.description,
      publisher: { '@id': `${PUBLIC_APP_URL}/#organization` },
      offers: dict.pricing.plans.map((plan) => ({
        '@type': 'Offer',
        name: plan.name,
        // Le prix vient du code, comme la page : la table `plans` ne le porte
        // pas, puisque c'est le prestataire de paiement qui le decide.
        price: PLAN_PRICING[plan.id as PlanId].monthly,
        priceCurrency: 'USD',
        category: 'subscription',
        url: `${url}#tarifs`,
      })),
    },
    {
      '@type': 'FAQPage',
      mainEntity: dict.faq.items.map((item) => ({
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
