'use client';

import { useActionState, useEffect, useState } from 'react';
import { CalendarDays, Check, ChevronDown, MessagesSquare, ShieldCheck } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/ui/submit-button';
import { Textarea } from '@/components/ui/textarea';
import { Reveal } from '@/components/reveal';
import { splitAside, splitGrid, splitMain } from '@/components/landing/section';
import type { Dictionary, Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { submitDemoRequest, type DemoRequestState } from './actions';

/**
 * Le formulaire commercial — la destination de tous les appels a l'action.
 *
 * #demo est portee par la section, #contact par un repere pose juste dessous.
 * Les deux amenent au meme endroit, mais le fragment d'URL pre-selectionne
 * l'intention : quelqu'un qui a clique « parler a notre equipe » ne doit pas
 * trouver « demander une demo » coche a l'arrivee. L'intention part en base
 * avec la demande.
 *
 * AUCUN VISAGE DANS CETTE SECTION. Les photographies de la page viennent de
 * banques d'images ; un visage sous « notre equipe vous repond » designerait
 * un employe de Deezy qui n'existe pas. Les trois etapes sont donc portees par
 * des pictogrammes. Voir public/enterprise/SOURCES.md.
 */
export function EnterpriseDemoForm({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const t = dict.enterprise.form;
  const [state, formAction] = useActionState<DemoRequestState, FormData>(
    submitDemoRequest,
    {},
  );

  const [intent, setIntent] = useState<'demo' | 'contact'>('demo');

  /*
   * Horodatage de l'affichage, pose apres l'hydratation — le filtre anti-robot
   * du serveur ecarte les envois arrives en moins de trois secondes.
   *
   * NE PAS DEPLACER CE CALCUL DANS UN GESTIONNAIRE DE FOCUS : le point de
   * depart est le CHARGEMENT DE LA PAGE, ce qui rend le seuil sans danger.
   * Reparti depuis la premiere frappe, il ecarterait un formulaire rempli au
   * remplissage automatique — et une demande ecartee est perdue en silence.
   */
  const [startedAt, setStartedAt] = useState(0);
  useEffect(() => setStartedAt(Date.now()), []);

  /* Le fragment d'URL choisit l'intention. `hashchange` couvre le cas d'un
     second clic depuis une autre section de la page. */
  useEffect(() => {
    const read = () => {
      if (window.location.hash === '#contact') setIntent('contact');
      else if (window.location.hash === '#demo') setIntent('demo');
    };

    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);

  const errors = state.fieldErrors ?? {};

  return (
    <section id="demo" className="bg-muted/40 scroll-mt-20 border-t">
      <span id="contact" className="block scroll-mt-20" aria-hidden />

      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className={splitGrid}>
          <Reveal className={splitMain}>
            <p className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
              {t.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance md:text-4xl">
              {t.title}
            </h2>
            <p className="text-muted-foreground mt-4 leading-relaxed text-pretty">
              {t.lead}
            </p>

            <p className="mt-10 text-xs font-semibold tracking-widest uppercase">
              {t.nextTitle}
            </p>

            <ol className="mt-5 flex flex-col gap-5">
              {t.nextSteps.map((step, index) => {
                const Icon = [MessagesSquare, CalendarDays, ShieldCheck][index] ?? Check;

                return (
                  <li key={step.title} className="flex gap-3.5">
                    <span className="bg-brand-soft text-brand flex size-9 shrink-0 items-center justify-center rounded-lg">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{step.title}</p>
                      <p className="text-muted-foreground mt-1 text-sm leading-relaxed text-pretty">
                        {step.body}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <p className="text-muted-foreground border-brand/30 mt-8 border-l-2 pl-4 text-sm leading-relaxed text-pretty">
              {t.noSpam}
            </p>
          </Reveal>

          <Reveal delay={120} className={splitAside}>
            {state.ok ? (
              <div className="bg-card flex flex-col items-center rounded-2xl border p-10 text-center shadow-sm">
                <span className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                  <Check className="size-6" aria-hidden />
                </span>
                <p className="mt-4 text-lg font-semibold">{t.successTitle}</p>
                <p className="text-muted-foreground mt-2 max-w-sm text-sm text-pretty">
                  {t.successBody}
                </p>
              </div>
            ) : (
              <form
                action={formAction}
                className="bg-card relative rounded-2xl border p-6 shadow-sm md:p-8"
              >
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="intent" value={intent} />
                <input type="hidden" name="startedAt" value={startedAt} />

                {/*
                  Champ leurre.
                  Invisible a l'ecran et retire de l'ordre de tabulation comme
                  de l'arbre d'accessibilite : un lecteur d'ecran ne l'annonce
                  pas, un robot qui remplit tout le formulaire le remplit.
                  `sr-only` serait exactement le mauvais choix — il le rendrait
                  audible.
                */}
                <div
                  className="pointer-events-none absolute -left-[9999px] opacity-0"
                  aria-hidden
                >
                  <label htmlFor="company_size">Company size</label>
                  <input
                    id="company_size"
                    name="company_size"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {/* L'intention d'abord : c'est la seule decision du
                    formulaire, les six champs n'en sont que la consequence. */}
                <fieldset>
                  <legend className="sr-only">{t.intentLabel}</legend>
                  <div className="grid grid-cols-2 gap-3">
                    <IntentCard
                      label={t.intentDemo}
                      selected={intent === 'demo'}
                      onSelect={() => setIntent('demo')}
                    />
                    <IntentCard
                      label={t.intentContact}
                      selected={intent === 'contact'}
                      onSelect={() => setIntent('contact')}
                    />
                  </div>
                </fieldset>

                <Group title={t.groupYou}>
                  <Field htmlFor="fullName" label={t.name} error={errors.fullName}>
                    <Input
                      id="fullName"
                      name="fullName"
                      autoComplete="name"
                      placeholder={t.namePlaceholder}
                      aria-invalid={Boolean(errors.fullName)}
                      minLength={2}
                      maxLength={120}
                      required
                    />
                  </Field>

                  <Field htmlFor="email" label={t.email} error={errors.email}>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder={t.emailPlaceholder}
                      aria-invalid={Boolean(errors.email)}
                      maxLength={200}
                      required
                    />
                  </Field>
                </Group>

                <Group title={t.groupOrg}>
                  <Field htmlFor="company" label={t.company} error={errors.company}>
                    <Input
                      id="company"
                      name="company"
                      autoComplete="organization"
                      placeholder={t.companyPlaceholder}
                      aria-invalid={Boolean(errors.company)}
                      minLength={2}
                      maxLength={160}
                      required
                    />
                  </Field>

                  <Field htmlFor="website" label={t.website} hint={t.optional}>
                    <Input
                      id="website"
                      name="website"
                      autoComplete="url"
                      placeholder={t.websitePlaceholder}
                      maxLength={200}
                    />
                  </Field>

                  <Field
                    htmlFor="industry"
                    label={t.industry}
                    hint={t.optional}
                    className="sm:col-span-2"
                  >
                    {/* <select> natif : un menu maison serait moins bon au
                        clavier et sur telephone. Le chevron est dessine
                        par-dessus, l'apparence native retiree. */}
                    <div className="relative">
                      <select
                        id="industry"
                        name="industry"
                        defaultValue=""
                        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full appearance-none rounded-md border bg-transparent pr-9 pl-3 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] md:text-sm"
                      >
                        <option value="">{t.industryPlaceholder}</option>
                        {t.industries.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
                        aria-hidden
                      />
                    </div>
                  </Field>
                </Group>

                <Group title={t.groupNeed}>
                  <Field
                    htmlFor="message"
                    label={t.message}
                    hint={t.optional}
                    className="sm:col-span-2"
                  >
                    <Textarea
                      id="message"
                      name="message"
                      rows={4}
                      maxLength={4000}
                      placeholder={t.messagePlaceholder}
                    />
                  </Field>
                </Group>

                {/* Reservee aux pannes d'enregistrement : une erreur de saisie
                    s'affiche sous son champ, pas ici. */}
                {state.error && (
                  <p
                    role="alert"
                    className="border-destructive/20 bg-destructive/5 text-destructive mt-6 rounded-lg border px-3.5 py-2.5 text-sm"
                  >
                    {state.error}
                  </p>
                )}

                <div className="mt-8 border-t pt-6">
                  <SubmitButton
                    size="lg"
                    pendingLabel={t.submitting}
                    className="bg-brand hover:bg-brand/90 text-brand-foreground h-12 w-full px-6 text-base"
                  >
                    {t.submit}
                  </SubmitButton>

                  <p className="text-muted-foreground mt-3 text-center text-xs text-pretty">
                    {t.privacy}
                  </p>
                </div>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/**
 * Une des deux intentions. `role="radio"` plutot qu'un bouton : c'est un choix
 * exclusif, un lecteur d'ecran doit l'annoncer comme tel.
 */
function IntentCard({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'focus-ring flex cursor-pointer items-center gap-2.5 rounded-xl border p-3.5 text-left text-sm font-medium transition-colors',
        selected
          ? 'border-brand bg-brand-soft text-brand'
          : 'text-muted-foreground hover:border-border-strong hover:text-foreground',
      )}
    >
      <span
        className={cn(
          'flex size-4 shrink-0 items-center justify-center rounded-full border',
          selected ? 'border-brand bg-brand' : 'border-muted-foreground/40',
        )}
        aria-hidden
      >
        {selected && <span className="size-1.5 rounded-full bg-white" />}
      </span>
      {label}
    </button>
  );
}

/** Un groupe de champs, precede de son intitule. */
function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
        {title}
      </p>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">{children}</div>
    </div>
  );
}

/** Libelle, mention « facultatif », le champ, puis son erreur eventuelle. */
function Field({
  htmlFor,
  label,
  hint,
  error,
  className,
  children,
}: {
  htmlFor: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {hint && (
          <span className="text-muted-foreground text-xs font-normal">({hint})</span>
        )}
      </Label>
      {children}
      {error && (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
