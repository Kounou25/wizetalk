import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getUser } from '@/lib/supabase/server';
import { getDictionary, isLocale, LOCALES, type Locale } from '@/lib/i18n';
import { requestOrigin } from '@/lib/request-origin';
import { ScrollProgressBar } from '@/components/scroll-progress-bar';
import { LandingNav } from '@/components/landing/nav';
import { Hero } from '@/components/landing/hero';
import { ProductProof } from '@/components/landing/product-proof';
import { Problem } from '@/components/landing/problem';
import { Change } from '@/components/landing/change';
import { Recovery } from '@/components/landing/recovery';
import { Insight } from '@/components/landing/insight';
import { BeforeAfter } from '@/components/landing/before-after';
import { WhyDeezy } from '@/components/landing/why-deezy';
import { Comparison } from '@/components/landing/comparison';
import { Install } from '@/components/landing/install';
import { Platforms } from '@/components/landing/platforms';
import { Benefits } from '@/components/landing/benefits';
import { Results } from '@/components/landing/results';
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
  const typed = locale as Locale;

  return (
    <>
      <ScrollProgressBar />
      <LandingNav locale={typed} dict={dict} authenticated={Boolean(user)} />

      {/*
        L'ordre EST l'argument. La page ne decrit pas un produit, elle conduit
        un raisonnement, et chaque section repond a la question que la
        precedente vient de poser :

          Hero        ce que vous perdez, et la preuve qu'on peut l'eviter
          Preuve      sur quoi reposent les reponses — faute de clients citables
          Probleme    -> « ca me parle, mais est-ce que ca me coute vraiment ? »
          Changement  -> « d'accord, mais qu'est-ce que ca fait, concretement ? »
          Fiabilite   -> « et si l'IA raconte n'importe quoi ? »   ★ le coeur
          Insight     -> « qu'est-ce que j'y gagne au-dela des reponses ? »
          Avant/Apres -> « montrez-moi la difference »
          Pourquoi    -> « en quoi c'est different des autres ? »
          Comparaison -> « j'ai deja essaye autre chose »
          Installation-> « ca va me prendre combien de temps ? »
          Plateformes -> « est-ce que ca marche chez moi ? »
          Benefices   -> « et au quotidien, ca donne quoi ? »
          Resultats   -> « qu'est-ce que vous promettez vraiment ? »
          Tarifs      -> « combien, et est-ce que ca vaut le coup ? »
          FAQ         -> les derniers doutes, dans l'ordre ou ils arrivent
          CTA final   -> la seule chose qu'il reste a faire

        Fiabilite est le pivot : le refus de repondre et la recuperation du
        prospect y sont traites ensemble. Les separer les faisait se repeter,
        et le lecteur croyait avoir deja lu la seconde section.
      */}
      <main>
        <Hero locale={typed} dict={dict} />
        <ProductProof dict={dict} />

        <Problem locale={typed} dict={dict} />
        <Change dict={dict} />

        <Recovery locale={typed} dict={dict} />
        <Insight dict={dict} />
        <BeforeAfter dict={dict} />

        <WhyDeezy dict={dict} />
        <Comparison dict={dict} />

        <Install locale={typed} dict={dict} />
        <Platforms dict={dict} />

        <Benefits dict={dict} />
        <Results dict={dict} />

        <Pricing locale={typed} pricing={dict.pricing} />
        <Faq dict={dict} />
        <FinalCta locale={typed} dict={dict} />
      </main>

      <LandingFooter locale={typed} dict={dict} />
    </>
  );
}
