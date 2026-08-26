'use client';

import { useState } from 'react';

import type { Dictionary, Locale } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { UpgradeDialog, type UpgradeOffer } from './upgrade-dialog';

/**
 * Bouton qui ouvre la proposition de mise a niveau.
 *
 * Les ecrans verrouilles sont rendus sur le serveur ; il leur faut donc un
 * point d'entree client pour ouvrir la modale. Ce composant ne fait que
 * porter l'etat d'ouverture — la proposition, elle, est calculee sur le
 * serveur et transmise telle quelle.
 */
export function UpgradeButton({
  offer,
  label,
  locale,
  dict,
  variant,
  size,
  className,
}: {
  offer: UpgradeOffer;
  label: string;
  locale: Locale;
  dict: Dictionary;
  variant?: React.ComponentProps<typeof Button>['variant'];
  size?: React.ComponentProps<typeof Button>['size'];
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant={variant}
        size={size}
        className={className}
      >
        {label}
      </Button>

      <UpgradeDialog
        offer={offer}
        open={open}
        onClose={() => setOpen(false)}
        locale={locale}
        dict={dict}
      />
    </>
  );
}
