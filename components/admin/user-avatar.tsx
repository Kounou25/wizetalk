'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';

/**
 * Initiales, tirees du nom complet quand il existe.
 *
 * « Gnimassou gilbert Kounou » -> « GK », « marie.dupont@ex.fr » -> « MD ».
 * Le nom donne un meilleur resultat que l'adresse : deux comptes chez le meme
 * employeur partagent souvent le debut de leur adresse.
 */
function initialsOf(fullName: string | null, email: string): string {
  const source = fullName?.trim();

  if (source) {
    const parts = source.split(/\s+/).filter(Boolean);
    const letters =
      parts.length >= 2 ? `${parts[0]?.[0]}${parts[parts.length - 1]?.[0]}` : source.slice(0, 2);
    return letters.toUpperCase();
  }

  const local = email.split('@')[0] ?? '?';
  const parts = local.split(/[._-]+/).filter(Boolean);
  const letters = parts.length >= 2 ? `${parts[0]?.[0]}${parts[1]?.[0]}` : local.slice(0, 2);
  return letters.toUpperCase();
}

/**
 * Photo de profil d'un compte, dans le back-office.
 *
 * Deliberement distincte du composant `Avatar` du tableau de bord, qui ne
 * charge jamais d'image distante  c'est une propriete qu'on tient a garder
 * cote client. Ici la contrainte ne s'applique pas : le back-office ne
 * s'affiche que pour l'equipe, et reconnaitre un compte a son visage vaut bien
 * une requete vers le CDN de Google.
 *
 * Balise `img` et non `next/image` : passer par l'optimiseur ferait telecharger
 * les photos de vos utilisateurs par votre serveur, et imposerait de declarer
 * chaque domaine de fournisseur d'identite dans next.config.
 */
export function UserAvatar({
  src,
  fullName,
  email,
  className,
}: {
  src: string | null;
  fullName: string | null;
  email: string;
  className?: string;
}) {
  // Une photo peut disparaitre : compte Google supprime, image revoquee. Sans
  // ce repli, la ligne afficherait une icone d'image cassee.
  const [failed, setFailed] = useState(false);

  const initials = initialsOf(fullName, email);
  const shell = cn(
    'flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full',
    className,
  );

  if (!src || failed) {
    return (
      <span
        className={cn(shell, 'bg-surface-subtle text-muted-foreground border-border border text-[11px] font-semibold')}
        aria-hidden
      >
        {initials}
      </span>
    );
  }

  return (
    <span className={cn(shell, 'border-border border')}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        width={32}
        height={32}
        loading="lazy"
        // Google renvoie 403 sur ces URLs quand un referrer est transmis.
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="size-full object-cover"
      />
    </span>
  );
}
