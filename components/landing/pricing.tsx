'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Minus, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';
import { cn } from '@/lib/utils';
import type { Dictionary, Locale } from '@/lib/i18n';

type PricingText = Dictionary['pricing'];

/**
 * Grille tarifaire.
 *
 * Le palier recommande est rendu sur fond sombre au milieu de deux cartes
 * claires. C'est le contraste qui designe l'offre, pas seulement un badge :
 * l'oeil s'y pose avant d'avoir lu quoi que ce soit.
 *
 * Chaque palier n'enumere que ce qu'il AJOUTE au precedent. Repeter les memes
 * lignes d'une colonne a l'autre oblige le lecteur a comparer mot a mot ;
 * « Tout de l'Essentiel, plus : » lui epargne ce travail.
 *
 * ⚠ Aucun paiement n'est branche : tous les boutons menent a l'inscription.
 * La bascule annuelle change l'affichage, elle ne cree pas encore de
 * facturation annuelle.
 *
 * Ce composant est rendu cote client (la bascule a un etat). Il ne recoit donc
 * que dict.pricing, jamais le dictionnaire entier : React serialise les
 * proprietes d'un composant client dans la page, et passer l'objet complet
 * expediait au navigateur tous les libelles du tableau de bord et de
 * l'authentification, sur une page ou ils ne servent a rien.
 */
const FEATURED_INDEX = 1;

export function Pricing({ locale, pricing }: { locale: Locale; pricing: PricingText }) {
  const t = pricing;
  const [annual, setAnnual] = useState(false);

  return (
    <section id="tarifs" className="relative overflow-hidden border-y">
      {/* Fond travaille : degrade doux, quadrillage estompe, puis une lueur
          centree exactement sous la carte mise en avant. */}
      <div
        aria-hidden
        className="from-muted/60 absolute inset-0 -z-20 bg-gradient-to-b via-transparent to-transparent"
      />
      <div
        aria-hidden
        className="bg-grid absolute inset-0 -z-20 opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000,transparent)]"
      />
      <div
        aria-hidden
        className="bg-brand/20 animate-glow absolute top-1/3 left-1/2 -z-10 size-[34rem] -translate-x-1/2 rounded-full blur-[100px]"
      />

      <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
            {t.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance md:text-5xl">
            {t.title}
          </h2>
          <p className="text-muted-foreground mt-4 text-lg text-pretty">{t.lead}</p>

          {/*
            La justification business, avant les montants.
            Un prix lu seul se compare a d'autres prix ; lu apres ce qu'il
            rapporte, il se compare a une opportunite perdue. C'est la seule
            comparaison qui joue en faveur du produit.
          */}
          <p className="mt-6 text-lg font-semibold text-balance">{t.roi}</p>

          {/* Sans palier gratuit, l'essai est la seule porte d'entree :
              il doit se voir avant les prix, pas apres. */}
          <p className="border-brand/20 bg-brand-soft text-brand mt-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold">
            <Sparkles className="size-4" aria-hidden />
            {t.trialBadge}
          </p>
        </Reveal>

        <Reveal className="mt-10 flex justify-center">
          <BillingToggle annual={annual} onChange={setAnnual} labels={t.billing} />
        </Reveal>

        <div className="mt-14 grid items-center gap-6 lg:grid-cols-3">
          {t.plans.map((plan, index) => (
            <Reveal key={plan.name} delay={index * 90} className="h-full">
              <PlanCard
                plan={plan}
                featured={index === FEATURED_INDEX}
                annual={annual}
                labels={t}
                href={`/${locale}/signup`}
              />
            </Reveal>
          ))}
        </div>

        {/* Le sur-mesure n'est plus une quatrieme carte : il desequilibrait la
            grille pour une offre qui ne se compare pas aux autres. */}
        <Reveal className="mt-12">
          <div className="bg-background/70 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6 ring-1 ring-black/5 backdrop-blur dark:ring-white/10">
            <div>
              <p className="font-semibold">{t.custom.label}</p>
              <p className="text-muted-foreground mt-0.5 max-w-xl text-sm text-pretty">
                {t.custom.description}
              </p>
            </div>
            <Button asChild variant="outline" className="shrink-0">
              <Link href={`/${locale}/signup`}>{t.custom.cta}</Link>
            </Button>
          </div>
        </Reveal>

        <Reveal>
          <p className="text-muted-foreground mx-auto mt-8 max-w-2xl text-center text-sm text-pretty">
            {t.footnote}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

type Plan = PricingText['plans'][number];

function PlanCard({
  plan,
  featured,
  annual,
  labels,
  href,
}: {
  plan: Plan;
  featured: boolean;
  annual: boolean;
  labels: PricingText;
  href: string;
}) {
  const price = annual ? plan.annual : plan.monthly;

  return (
    <div
      className={cn(
        'relative flex h-full flex-col rounded-3xl p-8 transition-all duration-300',
        featured
          ? 'bg-slate-950 text-white shadow-2xl ring-1 ring-white/10 lg:scale-105'
          : 'bg-background ring-1 ring-black/5 hover:-translate-y-1 hover:shadow-xl dark:ring-white/10',
      )}
    >
      {/* Filet degrade sur l'arete haute : signale la carte sans ajouter de
          badge supplementaire au-dessus du titre. */}
      {featured && (
        <span
          aria-hidden
          className="from-brand absolute inset-x-8 top-0 h-px bg-gradient-to-r via-sky-400 to-transparent"
        />
      )}

      <div className="flex items-center justify-between gap-3">
        <h3 className={cn('text-lg font-bold', featured && 'text-white')}>{plan.name}</h3>
        {featured && (
          <span className="bg-brand rounded-full px-2.5 py-1 text-[11px] font-semibold text-white">
            {labels.popular}
          </span>
        )}
      </div>

      <p
        className={cn(
          'mt-2 min-h-10 text-sm text-pretty',
          featured ? 'text-slate-400' : 'text-muted-foreground',
        )}
      >
        {plan.description}
      </p>

      <div className="mt-7">
        {/* Le prix mensuel barre rend l'economie tangible : sans lui, la
            bascule annuelle affiche juste un nombre plus petit. */}
        <p
          className={cn(
            'h-5 text-sm line-through',
            featured ? 'text-slate-500' : 'text-muted-foreground/60',
          )}
        >
          {annual ? `${plan.monthly} $` : ''}
        </p>

        <p className="flex items-baseline gap-1.5">
          {/* key : force le remontage a chaque bascule, ce qui rejoue
              l'animation et rend le changement perceptible. */}
          <span
            key={price}
            className="animate-price text-5xl font-extrabold tracking-tight tabular-nums"
          >
            {price}&nbsp;$
          </span>
          <span className={cn('text-sm', featured ? 'text-slate-400' : 'text-muted-foreground')}>
            {labels.perMonth}
          </span>
        </p>

        <p
          className={cn(
            'mt-1 h-4 text-xs',
            featured ? 'text-slate-400' : 'text-muted-foreground',
          )}
        >
          {annual ? labels.billing.annualNote.replace('{total}', String(plan.annualTotal)) : ''}
        </p>
      </div>

      <Button
        asChild
        size="lg"
        className={cn(
          'group mt-7 h-12 w-full text-base',
          featured
            ? 'bg-brand hover:bg-brand/90 text-white shadow-lg'
            : 'bg-foreground text-background hover:bg-foreground/90',
        )}
      >
        <Link href={href}>
          {plan.cta}
          <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </Button>

      {plan.inherits && (
        <p
          className={cn(
            'mt-8 text-sm font-semibold',
            featured ? 'text-slate-300' : 'text-foreground',
          )}
        >
          {plan.inherits}
        </p>
      )}

      <ul className={cn('flex flex-col gap-3.5', plan.inherits ? 'mt-4' : 'mt-8')}>
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <span
              className={cn(
                'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full',
                featured ? 'bg-brand/25 text-sky-300' : 'bg-brand-soft text-brand',
              )}
            >
              <Check className="size-3" aria-hidden />
            </span>
            <span className={featured ? 'text-slate-200' : undefined}>{feature}</span>
          </li>
        ))}
      </ul>

      {/*
        Ce que le palier ne comprend pas.
        
        Volontairement en retrait : un tiret gris et un texte attenue, pas une
        croix rouge. L'objectif est de montrer la marche suivante, pas de
        devaloriser l'offre qu'on est en train de vendre.
        
        Le dernier palier n'affiche rien : c'est precisement son argument.
      */}
      {plan.excluded.length > 0 && (
        <div
          className={cn(
            'mt-6 border-t pt-5',
            featured ? 'border-white/10' : 'border-black/5 dark:border-white/10',
          )}
        >
          <p
            className={cn(
              'text-[11px] font-semibold tracking-wider uppercase',
              featured ? 'text-slate-500' : 'text-muted-foreground/70',
            )}
          >
            {labels.notIncluded}
          </p>

          <ul className="mt-3 flex flex-col gap-2.5">
            {plan.excluded.map((item) => (
              <li
                key={item}
                className={cn(
                  'flex items-start gap-3 text-sm',
                  featured ? 'text-slate-500' : 'text-muted-foreground/70',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full',
                    featured ? 'bg-white/5' : 'bg-muted',
                  )}
                >
                  <Minus className="size-3" aria-hidden />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pousse le bloc precedent en bas : les cartes gardent la meme hauteur
          et leurs separateurs restent alignes. */}
      <div className="flex-1" aria-hidden />
    </div>
  );
}

/**
 * Bascule a pastille glissante.
 *
 * La piste ne contient QUE les deux boutons et la pastille. Le badge du gain
 * annuel est un frere, place a cote — a l'interieur, il elargissait le
 * conteneur, donc la pastille calculee en pourcentage debordait sur les deux
 * boutons. Et comme ce badge est masque sous 640 px, le decalage etait faux
 * differemment selon la taille d'ecran.
 *
 * La pastille fait exactement la largeur d'un bouton (w-36) : translate-x-full
 * la deplace donc d'un bouton pile, sans calcul.
 */
function BillingToggle({
  annual,
  onChange,
  labels,
}: {
  annual: boolean;
  onChange: (annual: boolean) => void;
  labels: PricingText['billing'];
}) {
  const options = [
    { value: false, label: labels.monthly },
    { value: true, label: labels.annual },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <div className="bg-background/80 relative inline-flex rounded-full p-1 shadow-sm ring-1 ring-black/5 backdrop-blur dark:ring-white/10">
        <span
          aria-hidden
          className={cn(
            'bg-foreground absolute top-1 bottom-1 left-1 w-36 rounded-full transition-transform duration-300 ease-out',
            annual ? 'translate-x-full' : 'translate-x-0',
          )}
        />

        {options.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={annual === option.value}
            className={cn(
              'relative z-10 w-36 cursor-pointer rounded-full px-4 py-2.5 text-sm font-semibold transition-colors duration-200',
              annual === option.value
                ? 'text-background'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Frere de la piste, jamais dedans : le gain reste lisible dans les
          deux etats sans fausser la geometrie de la pastille. */}
      <span className="rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
        {labels.save}
      </span>
    </div>
  );
}
