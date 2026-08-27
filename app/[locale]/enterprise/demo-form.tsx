'use client';

import { useActionState, useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Segmented } from '@/components/ui/segmented';
import { SubmitButton } from '@/components/ui/submit-button';
import { Textarea } from '@/components/ui/textarea';
import { Reveal } from '@/components/reveal';
import type { Dictionary, Locale } from '@/lib/i18n';
import { submitDemoRequest, type DemoRequestState } from './actions';

/**
 * Le formulaire commercial — la seule destination de tous les appels a
 * l'action de la page.
 *
 * DEUX ANCRES, UNE SEULE SECTION
 *
 * #demo est portee par la section, #contact par un repere pose juste dessous.
 * Les deux amenent au meme endroit, mais le fragment d'URL pre-selectionne
 * l'intention : quelqu'un qui a clique « parler a notre equipe » ne doit pas
 * trouver « demander une demo » coche a l'arrivee, sous peine de croire qu'il
 * s'est trompe de bouton.
 *
 * L'intention part en base avec la demande. C'est ce qui permettra de savoir
 * lequel des deux libelles amene reellement des rendez-vous.
 *
 * POURQUOI SIX CHAMPS
 *
 * Le poste, l'effectif, le budget et l'echeance sont ce que demanderait un
 * formulaire de qualification — et ce qui fait fermer l'onglet. Ils se
 * demandent pendant l'echange, ou ils ne coutent rien.
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
   * Horodatage de l'affichage, pose apres l'hydratation.
   *
   * Il sert au filtre anti-robot du serveur : un envoi arrive moins de trois
   * secondes apres est ecarte. Calcule ici plutot que rendu par le serveur,
   * sinon une page mise en cache porterait un horodatage vieux de plusieurs
   * heures et le filtre ne verrait plus jamais rien.
   *
   * NE PAS DEPLACER CE CALCUL DANS UN GESTIONNAIRE DE FOCUS.
   *
   * Le point de depart est le CHARGEMENT DE LA PAGE, pas le premier clic dans
   * un champ. C'est ce qui rend le seuil sans danger : le visiteur a traverse
   * dix-huit sections avant d'arriver ici, il est a plusieurs minutes du
   * depart. Reparti depuis la premiere frappe, le meme seuil ecarterait un
   * formulaire rempli au remplissage automatique — et une demande commerciale
   * ecartee est perdue en silence, ce qui coute infiniment plus cher qu'un
   * message indesirable de plus.
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

  return (
    <section id="demo" className="scroll-mt-20 border-t">
      <span id="contact" className="block scroll-mt-20" aria-hidden />

      <div className="mx-auto max-w-3xl px-6 py-20 md:py-24">
        <Reveal className="text-center">
          <p className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
            {t.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance md:text-4xl">
            {t.title}
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-pretty">
            {t.lead}
          </p>
        </Reveal>

        {state.ok ? (
          <div className="bg-card mt-10 flex flex-col items-center rounded-2xl border p-10 text-center">
            <CheckCircle2 className="size-10 text-emerald-500" aria-hidden />
            <p className="mt-4 text-lg font-semibold">{t.successTitle}</p>
            <p className="text-muted-foreground mt-2 max-w-sm text-sm text-pretty">
              {t.successBody}
            </p>
          </div>
        ) : (
          <form
            action={formAction}
            className="bg-card relative mt-10 rounded-2xl border p-6 md:p-8"
          >
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="intent" value={intent} />
            <input type="hidden" name="startedAt" value={startedAt} />

            {/*
              Champ leurre.
              Invisible a l'ecran et retire de l'ordre de tabulation comme de
              l'arbre d'accessibilite : un lecteur d'ecran ne l'annonce pas, un
              robot qui remplit tout le formulaire le remplit. `sr-only`
              serait exactement le mauvais choix ici — il le rendrait audible.
            */}
            <div className="pointer-events-none absolute -left-[9999px] opacity-0" aria-hidden>
              <label htmlFor="company_size">Company size</label>
              <input
                id="company_size"
                name="company_size"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t.intentLabel}</Label>
              <Segmented
                label={t.intentLabel}
                value={intent}
                onChange={setIntent}
                options={[
                  { value: 'demo', label: t.intentDemo },
                  { value: 'contact', label: t.intentContact },
                ]}
              />
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field htmlFor="fullName" label={t.name}>
                <Input
                  id="fullName"
                  name="fullName"
                  autoComplete="name"
                  placeholder={t.namePlaceholder}
                  minLength={2}
                  maxLength={120}
                  required
                />
              </Field>

              <Field htmlFor="email" label={t.email}>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t.emailPlaceholder}
                  maxLength={200}
                  required
                />
              </Field>

              <Field htmlFor="company" label={t.company}>
                <Input
                  id="company"
                  name="company"
                  autoComplete="organization"
                  placeholder={t.companyPlaceholder}
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
            </div>

            <div className="mt-5">
              <Field htmlFor="industry" label={t.industry} hint={t.optional}>
                {/*
                  <select> natif plutot qu'un menu construit : il n'existe pas
                  de composant de selection dans le depot, et un menu maison
                  serait moins bon au clavier et sur telephone qu'un selecteur
                  du systeme.
                */}
                <select
                  id="industry"
                  name="industry"
                  defaultValue=""
                  className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] md:text-sm"
                >
                  <option value="">{t.industryPlaceholder}</option>
                  {t.industries.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-5">
              <Field htmlFor="message" label={t.message} hint={t.optional}>
                <Textarea
                  id="message"
                  name="message"
                  rows={4}
                  maxLength={4000}
                  placeholder={t.messagePlaceholder}
                />
              </Field>
            </div>

            {state.error && (
              <p
                role="alert"
                className="border-destructive/20 bg-destructive/5 text-destructive mt-5 rounded-lg border px-3.5 py-2.5 text-sm"
              >
                {state.error}
              </p>
            )}

            <div className="mt-7 flex flex-col items-center gap-3">
              <SubmitButton
                size="lg"
                pendingLabel={t.submitting}
                className="bg-brand hover:bg-brand/90 text-brand-foreground h-12 w-full px-6 text-base sm:w-auto"
              >
                {t.submit}
              </SubmitButton>

              <p className="text-muted-foreground text-center text-xs text-pretty">
                {t.privacy}
              </p>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

/** Libelle, mention « facultatif », et le champ. */
function Field({
  htmlFor,
  label,
  hint,
  children,
}: {
  htmlFor: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={htmlFor}>
        {label}
        {hint && (
          <span className="text-muted-foreground text-xs font-normal">({hint})</span>
        )}
      </Label>
      {children}
    </div>
  );
}
