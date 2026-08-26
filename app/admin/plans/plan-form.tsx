'use client';

import { useState } from 'react';
import { Infinity as InfinityIcon } from 'lucide-react';

import type { PlanId, PlanLimits } from '@/lib/plans';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SubmitButton } from '@/components/ui/submit-button';
import { savePlanLimits } from '@/app/admin/actions';

const LABELS: Record<PlanId, string> = {
  trial: 'Essai',
  essential: 'Essentiel',
  growth: 'Croissance',
  business: 'Entreprise',
};

/**
 * Formulaire d'un palier.
 *
 * Un formulaire par palier plutot qu'un seul pour les quatre : on modifie
 * rarement les quatre d'un coup, et un enregistrement global obligerait a
 * relire les trois autres pour verifier qu'on ne les a pas touches par
 * megarde.
 */
export function PlanForm({
  id,
  limits,
  price,
  dodoPrice,
}: {
  id: PlanId;
  limits: PlanLimits;
  /** Prix affiche sur la page de tarifs. Vient du code. */
  price: number | null;
  /** Prix reellement facture, lu chez le prestataire. `null` si illisible. */
  dodoPrice: number | null;
}) {
  const [unlimitedDocs, setUnlimitedDocs] = useState(limits.documents === null);
  const [gapsReport, setGapsReport] = useState(limits.gapsReport);
  const [removeBranding, setRemoveBranding] = useState(limits.removeBranding);
  const [prioritySupport, setPrioritySupport] = useState(limits.prioritySupport);

  const save = savePlanLimits.bind(null, id);
  const mismatch = price !== null && dodoPrice !== null && price !== dodoPrice;

  return (
    <form action={save} className="panel flex flex-col">
      <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3.5">
        <h2 className="text-sm font-semibold">{LABELS[id]}</h2>

        {/*
          Le prix est en lecture seule, et confronte a celui du prestataire.
          Le modifier ici ne changerait rien a ce qui est preleve : autant
          montrer l'ecart plutot que d'offrir un reglage qui ment.
        */}
        <div className="flex items-center gap-2 text-xs">
          {price === null ? (
            <span className="text-muted-foreground">Non vendu</span>
          ) : (
            <>
              <span className="text-muted-foreground">Affiché</span>
              <span className="font-semibold tabular-nums">{price} $</span>
              <span className="text-muted-foreground">· Dodo</span>
              <span
                className={
                  mismatch
                    ? 'font-semibold text-red-600 tabular-nums'
                    : 'font-semibold tabular-nums'
                }
              >
                {dodoPrice === null ? '—' : `${dodoPrice} $`}
              </span>
            </>
          )}
        </div>
      </div>

      {mismatch && (
        <p className="mx-4 mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
          Le prix affiché sur la page de tarifs ne correspond pas au produit chez
          Dodo. C’est Dodo qui prélève : corrigez-le là-bas, ou ajustez
          <code className="mx-1 font-mono text-xs">PLAN_PRICING</code> dans le code.
        </p>
      )}

      <div className="grid gap-4 p-4 sm:grid-cols-2">
        <Field name="messages" label="Messages par mois" defaultValue={limits.messages} />
        <Field name="bots" label="Assistants" defaultValue={limits.bots} />
        <Field name="pages" label="Pages par assistant" defaultValue={limits.pages} />

        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-documents`}>Documents par assistant</Label>
          <div className="flex items-center gap-2">
            <Input
              id={`${id}-documents`}
              name="documents"
              type="number"
              min={0}
              defaultValue={limits.documents ?? 0}
              disabled={unlimitedDocs}
              className="tabular-nums"
            />
            <input
              type="checkbox"
              name="documentsUnlimited"
              checked={unlimitedDocs}
              onChange={(event) => setUnlimitedDocs(event.target.checked)}
              className="sr-only"
            />
            <button
              type="button"
              onClick={() => setUnlimitedDocs((current) => !current)}
              aria-pressed={unlimitedDocs}
              title="Documents illimités"
              className={`focus-ring flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border transition-colors ${
                unlimitedDocs
                  ? 'border-brand bg-brand-soft text-brand'
                  : 'border-border text-muted-foreground hover:bg-surface-subtle'
              }`}
            >
              <InfinityIcon className="size-4" />
            </button>
          </div>
          <p className="text-muted-foreground text-xs">
            {unlimitedDocs ? 'Illimité' : 'Cliquez sur ∞ pour retirer la limite.'}
          </p>
        </div>
      </div>

      <div className="border-border flex flex-col gap-3 border-t px-4 py-4">
        <Toggle
          label="Rapport des questions sans réponse"
          name="gapsReport"
          checked={gapsReport}
          onChange={setGapsReport}
        />
        <Toggle
          label="Retrait de la mention Deezy"
          name="removeBranding"
          checked={removeBranding}
          onChange={setRemoveBranding}
        />
        <Toggle
          label="Support prioritaire"
          name="prioritySupport"
          checked={prioritySupport}
          onChange={setPrioritySupport}
        />
      </div>

      <div className="border-border flex items-center justify-between gap-3 border-t px-4 py-3.5">
        <p className="text-muted-foreground text-xs text-pretty">
          Le nouveau quota s’applique immédiatement aux comptes déjà sur ce palier.
          Leur consommation du mois n’est pas remise à zéro.
        </p>
        <SubmitButton
          size="sm"
          className="bg-brand hover:bg-brand/90 text-brand-foreground shrink-0"
          pendingLabel="Enregistrement…"
        >
          Enregistrer
        </SubmitButton>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type="number"
        min={0}
        defaultValue={defaultValue}
        className="tabular-nums"
      />
    </div>
  );
}

/** Interrupteur double d'une case reelle, pour que la valeur parte au serveur. */
function Toggle({
  label,
  name,
  checked,
  onChange,
}: {
  label: string;
  name: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm">{label}</span>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}
