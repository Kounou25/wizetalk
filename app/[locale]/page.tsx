import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getUser } from '@/lib/supabase/server';
import { getDictionary, isLocale, LOCALES, type Locale } from '@/lib/i18n';
import { requestOrigin } from '@/lib/request-origin';
import { ScrollProgressBar } from '@/components/scroll-progress-bar';
import { LandingNav } from '@/components/landing/nav';
import { Hero } from '@/components/landing/hero';
import { LogoMarquee } from '@/components/landing/logo-marquee';
import { Problem } from '@/components/landing/problem';
import { Showcase } from '@/components/landing/showcase';
import { Comparison } from '@/components/landing/comparison';
import { Solution } from '@/components/landing/solution';
import { Platforms } from '@/components/landing/platforms';
import { Features } from '@/components/landing/features';
import { Pricing } from '@/components/landing/pricing';
import { Faq } from '@/components/landing/faq';
import { FinalCta } from '@/components/landing/final-cta';
import { LandingFooter } from '@/components/landing/footer';

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

  const dict = getDictionary(locale);
  // L'origine reelle de la requete, et non la variable d'environnement : une
  // NEXT_PUBLIC_APP_URL oubliee ferait pointer canonical et hreflang vers un
  // domaine inexistant, ce qui desindexerait la page.
  const appUrl = await requestOrigin();

  return {
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      canonical: `${appUrl}/${locale}`,
      // hreflang : c'est ce qui indique a Google que les deux pages sont
      // deux versions du meme contenu, et non du duplicata.
      languages: Object.fromEntries(
        LOCALES.map((other) => [other, `${appUrl}/${other}`]),
      ),
    },
  };
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  // Page publique : la session ne sert qu'a adapter les boutons de la barre.
  const user = await getUser();

  return (
    <>
      <ScrollProgressBar />
      <LandingNav locale={locale as Locale} dict={dict} authenticated={Boolean(user)} />

      <main>
        <Hero locale={locale as Locale} dict={dict} />
        <LogoMarquee dict={dict} />

        {/*
          Probleme -> demonstration -> comparaison -> mise en oeuvre.
          Showcase porte l'essentiel : quatre rangees alternees ou chaque
          benefice est montre autant qu'affirme. Comparison est la seule bande
          sombre — elle marque le creux du recit, le retour au clair fait le
          soulagement.
        */}
        <Problem dict={dict} />
        <Showcase dict={dict} />
        <Comparison dict={dict} />
        <Solution dict={dict} />

        <Platforms dict={dict} />
        <Features dict={dict} />
        <Pricing locale={locale as Locale} pricing={dict.pricing} />
        <Faq dict={dict} />
        <FinalCta locale={locale as Locale} dict={dict} />
      </main>

      <LandingFooter locale={locale as Locale} dict={dict} />
    </>
  );
}
