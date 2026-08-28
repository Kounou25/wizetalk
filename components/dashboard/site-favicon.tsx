'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';

const SIZES = {
  md: 'size-8 text-xs',
  lg: 'size-10 text-sm',
} as const;

/**
 * Icone du site indexe par un assistant.
 *
 * ELLE VIENT DU SITE DU CLIENT, PAS D'UN SERVICE TIERS
 *
 * Les services d'icones  celui de Google, celui de DuckDuckGo  evitent tout
 * ce travail en une ligne. Mais ils recevraient, a chaque affichage du tableau
 * de bord, la liste des domaines de nos clients. Ce n'est pas une information a
 * confier a un tiers pour economiser quelques lignes.
 *
 * REPLI EN DEUX TEMPS
 *
 *   1. l'adresse relevee a l'exploration, dans le HTML du site ;
 *   2. `/favicon.ico` a la racine, que la plupart des serveurs servent encore
 *       c'est ce qui fait marcher les assistants indexes avant cette
 *      fonctionnalite, sans attendre une resynchronisation ;
 *   3. l'initiale, quand il n'y a rien a afficher.
 *
 * Sans le troisieme temps, une icone absente laisserait l'image cassee du
 * navigateur dans chaque ligne de la liste.
 */
export function SiteFavicon({
  faviconUrl,
  websiteUrl,
  initial,
  size = 'md',
  className,
}: {
  /** Adresse relevee a l'exploration. `null` tant que le site n'a pas ete relu. */
  faviconUrl: string | null;
  websiteUrl: string;
  initial: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const sources = buildSources(faviconUrl, websiteUrl);
  const [attempt, setAttempt] = useState(0);

  const shell = cn(
    'flex shrink-0 items-center justify-center overflow-hidden rounded-lg',
    SIZES[size],
    className,
  );

  const src = sources[attempt];

  if (!src) {
    return (
      <span className={cn(shell, 'bg-brand-soft text-brand font-bold')} aria-hidden>
        {initial}
      </span>
    );
  }

  return (
    <span className={cn(shell, 'bg-surface border-border border p-1')}>
      {/* Balise `img` et non `next/image` : l'optimiseur ferait telecharger
          l'icone par notre serveur, et imposerait de declarer le domaine de
          chaque client dans next.config  ce qui est impossible, ils sont
          arbitraires. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        // `key` force le navigateur a retenter reellement quand on change de
        // source : sans elle, il conserve l'element en echec.
        key={src}
        src={src}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setAttempt((current) => current + 1)}
        className="size-full object-contain"
      />
    </span>
  );
}

/** Les adresses a tenter, dans l'ordre, sans doublon. */
function buildSources(faviconUrl: string | null, websiteUrl: string): string[] {
  const sources: string[] = [];

  if (faviconUrl) sources.push(faviconUrl);

  try {
    const guess = `${new URL(websiteUrl).origin}/favicon.ico`;
    if (!sources.includes(guess)) sources.push(guess);
  } catch {
    // URL de site invalide : on se contentera de l'initiale.
  }

  return sources;
}
