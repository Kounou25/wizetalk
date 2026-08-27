import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getUser } from '@/lib/supabase/server';
import { getDictionary, isLocale, LOCALES, type Locale } from '@/lib/i18n';
import { requestOrigin } from '@/lib/request-origin';
import { ScrollProgressBar } from '@/components/scroll-progress-bar';
import { LandingNav } from '@/components/landing/nav';
import { LandingFooter } from '@/components/landing/footer';
import { Faq } from '@/components/landing/faq';
import { DeezyWidget } from '@/components/landing/deezy-widget';
import { EnterpriseStructuredData } from '@/components/landing/enterprise/structured-data';
import { EnterpriseHero } from '@/components/landing/enterprise/hero';
import { EnterprisePositioning } from '@/components/landing/enterprise/positioning';
import { EnterpriseProblem } from '@/components/landing/enterprise/problem';
import { EnterpriseSolution } from '@/components/landing/enterprise/solution';
import { EnterpriseGrounded } from '@/components/landing/enterprise/grounded';
import { EnterpriseControl } from '@/components/landing/enterprise/control';
import { EnterpriseHandoff } from '@/components/landing/enterprise/handoff';
import { EnterpriseAnalytics } from '@/components/landing/enterprise/analytics';
import { EnterpriseMultilingual } from '@/components/landing/enterprise/multilingual';
import { EnterpriseUseCases } from '@/components/landing/enterprise/use-cases';
import { EnterpriseValue } from '@/components/landing/enterprise/value';
import { EnterpriseIntegrations } from '@/components/landing/enterprise/integrations';
import { EnterpriseSecurity } from '@/components/landing/enterprise/security';
import { EnterpriseScale } from '@/components/landing/enterprise/scale';
import { EnterpriseWorkflow } from '@/components/landing/enterprise/workflow';
import { EnterprisePricing } from '@/components/landing/enterprise/pricing';
import { EnterpriseEditions } from '@/components/landing/enterprise/editions';
import { EnterpriseFinalCta } from '@/components/landing/enterprise/final-cta';
import { EnterpriseDemoForm } from './demo-form';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const t = getDictionary(locale).enterprise;
  // L'origine reelle de la requete, et non la variable d'environnement : voir
  // le commentaire de la page de presentation.
  const appUrl = await requestOrigin();

  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: `${appUrl}/${locale}/enterprise`,
      languages: Object.fromEntries(
        LOCALES.map((other) => [other, `${appUrl}/${other}/enterprise`]),
      ),
    },
    openGraph: {
      type: 'website',
      siteName: 'Deezy',
      url: `${appUrl}/${locale}/enterprise`,
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      title: t.meta.title,
      description: t.meta.description,
    },
    twitter: {
      card: 'summary_large_image',
      title: t.meta.title,
      description: t.meta.description,
    },
  };
}

export default async function EnterprisePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  // Page publique : la session ne sert qu'a adapter les boutons de la barre.
  const user = await getUser();
  const typed = locale as Locale;

  return (
    <>
      <EnterpriseStructuredData locale={typed} dict={dict} />

      <ScrollProgressBar />
      <LandingNav
        locale={typed}
        dict={dict}
        authenticated={Boolean(user)}
        variant="enterprise"
      />

      {/*
        L'ordre suit le raisonnement d'un comite d'achat, pas celui d'une
        fiche produit. Chaque section repond a l'objection que la precedente
        vient de faire naitre :

          Heros         ce que c'est, pour qui, et quoi faire
          Positionnement-> « en quoi est-ce different d'un chatbot ? »
          Probleme      -> « est-ce que ca nous coute vraiment quelque chose ? »
          Solution      -> « concretement, comment ca marche ? »
          Fiabilite     -> « et si l'assistant raconte n'importe quoi ? »  ★
          Controle      -> « qui decide de ce qu'il dit ? »
          Relais humain -> « et quand il ne faut pas repondre ? »
          Analyse       -> « qu'est-ce qu'on en retire au-dela des reponses ? »
          Multilingue   -> « nos clients ne parlent pas tous la meme langue »
          Secteurs      -> « est-ce que ca marche dans NOTRE metier ? »
          Valeur        -> « qu'est-ce que ca change pour l'organisation ? »
          Integrations  -> « ca se branche a quoi ? »
          Securite      -> « et nos donnees ? »                            ★
          Echelle       -> « est-ce que ca tient nos volumes ? »
          Methode       -> « comment se passe un deploiement ? »
          Tarifs        -> « combien, et comment c'est construit ? »
          Business/Ent. -> « suis-je au bon endroit ? »
          FAQ           -> les derniers doutes
          CTA + form    -> la seule chose qu'il reste a faire

        Fiabilite et Securite sont les deux pivots : ce sont les seules
        sections qu'un comite relira mot a mot, et les seules ou reconnaitre
        une limite rapporte davantage que la masquer.
      */}
      <main>
        <EnterpriseHero dict={dict} />
        <EnterprisePositioning dict={dict} />

        <EnterpriseProblem dict={dict} />
        <EnterpriseSolution dict={dict} />

        <EnterpriseGrounded dict={dict} />
        <EnterpriseControl dict={dict} />
        <EnterpriseHandoff dict={dict} />

        <EnterpriseAnalytics dict={dict} />
        <EnterpriseMultilingual dict={dict} />

        <EnterpriseUseCases dict={dict} />
        <EnterpriseValue dict={dict} />

        <EnterpriseIntegrations dict={dict} />
        <EnterpriseSecurity dict={dict} />
        <EnterpriseScale dict={dict} />

        <EnterpriseWorkflow dict={dict} />
        <EnterprisePricing dict={dict} />
        <EnterpriseEditions locale={typed} dict={dict} />

        <Faq
          id="faq-enterprise"
          eyebrow={dict.enterprise.faq.eyebrow}
          title={dict.enterprise.faq.title}
          items={dict.enterprise.faq.items}
        />

        <EnterpriseFinalCta dict={dict} />
        <EnterpriseDemoForm locale={typed} dict={dict} />
      </main>

      <LandingFooter locale={typed} dict={dict} />

      {/*
        Notre propre assistant, sur la page qui le vend.
        C'est la preuve la plus courte de tout ce qui precede — a condition que
        le bot de demonstration ait indexe cette page. Une resynchronisation
        apres chaque mise en ligne fait partie du deploiement, sinon il repond
        « je ne trouve pas cette information » aux questions sur l'offre
        Enterprise, ce qui se retourne contre nous.
      */}
      <DeezyWidget />
    </>
  );
}
