'use client';

import { useActionState, useEffect, useId, useState, useTransition } from 'react';
import { Check, Power, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ChatGlyph } from '@/components/landing/logo';
import type { Dictionary } from '@/lib/i18n';
import {
  deleteBot,
  setBotActive,
  updateBot,
  type BotFormState,
} from '@/app/dashboard/actions';

/** Teintes lisibles en blanc : le texte du widget est toujours clair dessus. */
const PRESET_COLORS = [
  '#2563eb',
  '#0ea5e9',
  '#0d9488',
  '#16a34a',
  '#d97706',
  '#dc2626',
  '#db2777',
  '#7c3aed',
  '#1e293b',
];

interface SettingsCardProps {
  botId: string;
  name: string;
  welcomeMessage: string;
  primaryColor: string;
  position: string;
  isActive: boolean;
  leadCapture: boolean;
  dict: Dictionary;
}

export function SettingsCard({
  botId,
  name: initialName,
  welcomeMessage: initialWelcome,
  primaryColor: initialColor,
  position: initialPosition,
  isActive: initialActive,
  leadCapture: initialLeadCapture,
  dict,
}: SettingsCardProps) {
  const t = dict.dashboard.settings;
  const [state, formAction, pending] = useActionState<BotFormState, FormData>(
    updateBot.bind(null, botId),
    {},
  );

  const [name, setName] = useState(initialName);
  const [welcome, setWelcome] = useState(initialWelcome);
  const [color, setColor] = useState(initialColor);
  const [position, setPosition] = useState(initialPosition);
  const [leadCapture, setLeadCapture] = useState(initialLeadCapture);
  const leadLabelId = useId();

  return (
    <div className="flex flex-col gap-6">
      <ActivationRow botId={botId} initialActive={initialActive} t={t} />

      <section className="panel p-6">
        <h2 className="font-semibold">{t.title}</h2>
        <p className="text-muted-foreground mt-1 text-sm">{t.lead}</p>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_18rem]">
          <form action={formAction} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">{t.nameLabel}</Label>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={60}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="welcomeMessage">{t.welcomeLabel}</Label>
              <Textarea
                id="welcomeMessage"
                name="welcomeMessage"
                value={welcome}
                onChange={(event) => setWelcome(event.target.value)}
                maxLength={200}
                rows={3}
                required
              />
              <p className="text-muted-foreground text-xs tabular-nums">
                {welcome.length}/200 {t.chars}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t.colorLabel}</Label>
              <input type="hidden" name="primaryColor" value={color} />
              <div className="flex flex-wrap items-center gap-2">
                {PRESET_COLORS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setColor(preset)}
                    aria-label={`${t.colorLabel} ${preset}`}
                    aria-pressed={color.toLowerCase() === preset}
                    className={`size-8 cursor-pointer rounded-lg transition-transform hover:scale-110 ${
                      color.toLowerCase() === preset
                        ? 'ring-foreground ring-2 ring-offset-2'
                        : ''
                    }`}
                    style={{ backgroundColor: preset }}
                  />
                ))}

                <label className="border-input hover:bg-accent flex h-8 cursor-pointer items-center gap-2 rounded-lg border px-2.5 text-xs font-medium">
                  <input
                    type="color"
                    value={color}
                    onChange={(event) => setColor(event.target.value)}
                    className="size-4 cursor-pointer border-0 bg-transparent p-0"
                  />
                  <span className="font-mono uppercase">{color}</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t.positionLabel}</Label>
              <input type="hidden" name="position" value={position} />
              <div className="flex gap-2">
                {(
                  [
                    ['bottom-left', t.bottomLeft],
                    ['bottom-right', t.bottomRight],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPosition(value)}
                    aria-pressed={position === value}
                    className={`cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      position === value
                        ? 'bg-brand-soft text-brand ring-brand/30 ring-1'
                        : 'bg-muted/70 hover:bg-muted'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-muted/50 flex items-start justify-between gap-4 rounded-lg p-4">
              <div>
                <p id={leadLabelId} className="text-sm font-medium">
                  {t.leadCaptureTitle}
                </p>
                <p className="text-muted-foreground mt-1 max-w-sm text-xs text-pretty">
                  {t.leadCaptureBody}
                </p>
              </div>
              {/* Case reelle pour que la valeur parte avec le formulaire ;
                  l'interrupteur ne sert qu'a l'affichage. */}
              <input
                type="checkbox"
                name="leadCapture"
                checked={leadCapture}
                onChange={(event) => setLeadCapture(event.target.checked)}
                className="sr-only"
              />
              <Switch
                checked={leadCapture}
                onCheckedChange={setLeadCapture}
                aria-labelledby={leadLabelId}
              />
            </div>

            {state.error && (
              <p
                role="alert"
                className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600"
              >
                {state.error}
              </p>
            )}

            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={pending}
                className="bg-brand hover:bg-brand/90 text-brand-foreground self-start"
              >
                {pending ? t.saving : t.save}
              </Button>
              {state.saved && !pending && (
                <span
                  role="status"
                  className="flex items-center gap-1.5 text-sm text-emerald-600"
                >
                  <Check className="size-4" aria-hidden />
                  {t.saved}
                </span>
              )}
            </div>
          </form>

          <WidgetPreview
            name={name}
            welcome={welcome}
            color={color}
            position={position}
            t={t}
          />
        </div>
      </section>

      <DangerZone botId={botId} name={initialName} t={t} />
    </div>
  );
}

type SettingsText = Dictionary['dashboard']['settings'];

function ActivationRow({
  botId,
  initialActive,
  t,
}: {
  botId: string;
  initialActive: boolean;
  t: SettingsText;
}) {
  const [active, setActive] = useState(initialActive);
  const [pending, startTransition] = useTransition();
  const labelId = useId();

  // L'etat vient du serveur apres revalidation : on resynchronise si la
  // valeur change ailleurs (autre onglet, retour arriere).
  useEffect(() => setActive(initialActive), [initialActive]);

  return (
    <section className="panel flex flex-wrap items-center justify-between gap-4 p-6">
      <div className="flex items-start gap-3">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
            active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'
          }`}
        >
          <Power className="size-4" aria-hidden />
        </span>
        <div>
          <p id={labelId} className="font-semibold">
            {active ? t.activeTitle : t.inactiveTitle}
          </p>
          <p className="text-muted-foreground mt-0.5 max-w-md text-sm text-pretty">
            {active ? t.activeBody : t.inactiveBody}
          </p>
        </div>
      </div>

      <Switch
        checked={active}
        disabled={pending}
        aria-labelledby={labelId}
        onCheckedChange={(next) => {
          setActive(next); // retour visuel immediat
          startTransition(() => setBotActive(botId, next));
        }}
      />
    </section>
  );
}

function DangerZone({
  botId,
  name,
  t,
}: {
  botId: string;
  name: string;
  t: SettingsText;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <section className="rounded-xl p-6 ring-1 ring-red-500/20">
      <h2 className="font-semibold text-red-600">{t.dangerTitle}</h2>
      <p className="text-muted-foreground mt-1 max-w-lg text-sm text-pretty">
        {t.dangerBody}
      </p>

      {confirming ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="text-sm font-medium">
            {t.confirmPrefix} « {name} » {t.confirmSuffix}
          </p>
          <form action={deleteBot.bind(null, botId)}>
            <Button type="submit" variant="destructive" size="sm">
              <Trash2 />
              {t.confirmYes}
            </Button>
          </form>
          <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
            {t.cancel}
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="mt-4 border-red-500/30 text-red-600 hover:bg-red-500/10 hover:text-red-700"
          onClick={() => setConfirming(true)}
        >
          <Trash2 />
          {t.delete}
        </Button>
      )}
    </section>
  );
}

/** Rendu fidele au widget reel, alimente par l'etat du formulaire. */
function WidgetPreview({
  name,
  welcome,
  color,
  position,
  t,
}: {
  name: string;
  welcome: string;
  color: string;
  position: string;
  t: SettingsText;
}) {
  const isLeft = position === 'bottom-left';

  return (
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-sm font-medium">{t.preview}</p>

      <div className="bg-muted/50 relative h-80 overflow-hidden rounded-xl border">
        {/* Esquisse du site client, pour situer le widget dans une page. */}
        <div className="p-4 opacity-40">
          <div className="h-2 w-16 rounded-full bg-slate-300" />
          <div className="mt-3 h-4 w-32 rounded bg-slate-300" />
          <div className="mt-2 h-2 w-full rounded-full bg-slate-200" />
          <div className="mt-1.5 h-2 w-4/5 rounded-full bg-slate-200" />
        </div>

        <div
          className={`absolute bottom-3 flex flex-col gap-2 ${
            isLeft ? 'left-3 items-start' : 'right-3 items-end'
          }`}
        >
          <div className="w-52 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5">
            <div
              className="flex items-center gap-2 px-3 py-2.5"
              style={{ backgroundColor: color }}
            >
              <ChatGlyph className="size-5" />
              <span className="truncate text-xs font-semibold text-white">
                {name || 'Assistant'}
              </span>
            </div>
            <div className="p-3">
              <p className="rounded-xl bg-slate-100 px-2.5 py-2 text-[11px] leading-relaxed text-slate-700">
                {welcome || t.previewPlaceholder}
              </p>
            </div>
          </div>

          <span
            className="flex size-11 items-center justify-center rounded-full shadow-lg"
            style={{ backgroundColor: color }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}
