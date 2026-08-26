'use client';

import Link from 'next/link';
import { ArrowRight, Check, Minus } from 'lucide-react';

import type { Dictionary, Locale } from '@/lib/i18n';
import type { PlanId, PlanLimits } from '@/lib/plans';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

/** Ce qui a bloque l'utilisateur. Miroir de `BlockedBy` cote serveur. */
export type BlockedBy =
  | 'messages'
  | 'bots'
  | 'documents'
  | 'pages'
  | 'gapsReport'
  | 'removeBranding';

export interface UpgradeOffer {
  blockedBy: BlockedBy;
  currentPlan: PlanId;
  suggestedPlan: PlanId | null;
  isTopPlan: boolean;
  current: PlanLimits;
  suggested: PlanLimits | null;
}

/**
 * Proposition de mise a niveau, ouverte quand une limite est atteinte.
 *
 * Elle montre le GAIN, pas le refus. Un message qui dit seulement « votre plan
 * ne le permet pas » laisse le client devant une porte fermee ; un tableau qui
 * compare son palier au suivant lui donne une raison d'avancer.
 *
 * Les nombres viennent du serveur, donc de la table `plans` : ce qui est promis
 * ici est exactement ce que le produit appliquera apres la mise a niveau.
 */
export function UpgradeDialog({
  offer,
  open,
  onClose,
  locale,
  dict,
}: {
  offer: UpgradeOffer | null;
  open: boolean;
  onClose: () => void;
  locale: Locale;
  dict: Dictionary;
}) {
  const t = dict.dashboard.upgrade;
  const planNames = dict.dashboard.quota.plans;
  const tag = locale === 'fr' ? 'fr-FR' : 'en-US';

  if (!offer) return null;

  const titles: Record<BlockedBy, string> = {
    messages: t.titleMessages,
    bots: t.titleBots,
    documents: t.titleDocuments,
    pages: t.titlePages,
    gapsReport: t.titleGaps,
    removeBranding: t.titleBranding,
  };

  /*
   * Rien a proposer. Deux situations distinctes, et deux messages distincts :
   * le client est au sommet de la grille, ou bien aucun palier superieur ne
   * change quoi que ce soit a la limite qu'il vient d'atteindre. Les confondre
   * reviendrait a lui annoncer un statut qu'il n'a pas.
   */
  if (!offer.suggested || !offer.suggestedPlan) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        title={offer.isTopPlan ? t.topTitle : t.noneTitle}
        description={offer.isTopPlan ? t.topBody : t.noneBody}
        footer={
          <>
            <Button variant="ghost" onClick={onClose}>
              {t.dismiss}
            </Button>
            <Button asChild className="bg-brand hover:bg-brand/90 text-brand-foreground">
              <a href="mailto:hello@deezy.chat">{t.topCta}</a>
            </Button>
          </>
        }
      />
    );
  }

  const suggestedName = planNames[offer.suggestedPlan];

  const rows: { label: string; from: React.ReactNode; to: React.ReactNode }[] = [
    {
      label: t.rowMessages,
      from: offer.current.messages.toLocaleString(tag),
      to: offer.suggested.messages.toLocaleString(tag),
    },
    { label: t.rowBots, from: offer.current.bots, to: offer.suggested.bots },
    {
      label: t.rowPages,
      from: offer.current.pages.toLocaleString(tag),
      to: offer.suggested.pages.toLocaleString(tag),
    },
    {
      label: t.rowDocuments,
      from: offer.current.documents === null ? t.unlimited : offer.current.documents,
      to: offer.suggested.documents === null ? t.unlimited : offer.suggested.documents,
    },
    {
      label: t.rowGaps,
      from: <Flag on={offer.current.gapsReport} t={t} />,
      to: <Flag on={offer.suggested.gapsReport} t={t} />,
    },
    {
      label: t.rowBranding,
      from: <Flag on={offer.current.removeBranding} t={t} />,
      to: <Flag on={offer.suggested.removeBranding} t={t} />,
    },
    {
      label: t.rowSupport,
      from: <Flag on={offer.current.prioritySupport} t={t} />,
      to: <Flag on={offer.suggested.prioritySupport} t={t} />,
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={titles[offer.blockedBy]}
      description={t.lead.replace('{plan}', suggestedName)}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t.dismiss}
          </Button>
          <Button
            asChild
            className="bg-brand hover:bg-brand/90 text-brand-foreground group"
          >
            <Link href="/dashboard/settings">
              {t.cta}
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </>
      }
    >
      <table className="w-full text-sm">
        <thead className="text-muted-foreground text-xs">
          <tr>
            <th scope="col" className="pb-2 text-left font-medium">
              <span className="sr-only">{t.rowMessages}</span>
            </th>
            <th scope="col" className="pb-2 text-right font-medium">
              {t.current}
            </th>
            <th scope="col" className="text-brand pb-2 text-right font-semibold">
              {t.suggested.replace('{plan}', suggestedName)}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-border border-t">
              <td className="py-2 pr-3">{row.label}</td>
              <td className="text-muted-foreground py-2 text-right tabular-nums">
                {row.from}
              </td>
              {/* La colonne proposee est mise en avant : c'est la seule qui
                  doit retenir l'oeil dans un tableau de comparaison. */}
              <td className="text-foreground py-2 text-right font-semibold tabular-nums">
                {row.to}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Dialog>
  );
}

/** Oui/non, avec une icone ET un mot : la couleur ne porte jamais seule. */
function Flag({ on, t }: { on: boolean; t: { yes: string; no: string } }) {
  return (
    <span className="inline-flex items-center justify-end gap-1">
      {on ? (
        <Check className="size-3.5 text-emerald-600" aria-hidden />
      ) : (
        <Minus className="text-muted-foreground size-3.5" aria-hidden />
      )}
      <span className="sr-only">{on ? t.yes : t.no}</span>
    </span>
  );
}
