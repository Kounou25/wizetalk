'use client';

import { useActionState, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Globe, Loader2, Sparkles, TriangleAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Dictionary, Locale } from '@/lib/i18n';
import { createBot, type BotFormState } from '@/app/dashboard/actions';
import { UpgradeDialog } from '@/components/dashboard/upgrade-dialog';
import { runCrawl, type CrawlProgress } from '@/lib/crawl-client';

/**
 * Deduit un nom lisible d'une adresse de site.
 *
 * « www.boulangerie-durand.fr/contact » donne « Boulangerie Durand ». Ce n'est
 * pas toujours le nom exact de l'entreprise, et ce n'est pas grave : un champ
 * pre-rempli se corrige d'un geste, un champ vide se subit. Il ne remplace
 * jamais ce que la personne a deja tape.
 */
function nameFromUrl(raw: string): string {
  const host = raw
    .trim()
    .replace(/^https?:\/\//i, '')
    .split(/[/?#]/)[0]
    ?.replace(/^www\./i, '');

  const label = host?.split('.')[0];
  if (!label || label.length < 2) return '';

  return label
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function CreateBotForm({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.dashboard.newBot;
  const router = useRouter();

  const [state, formAction, pending] = useActionState<BotFormState, FormData>(
    createBot,
    {},
  );

  const [dismissed, setDismissed] = useState(false);
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  /** Vrai tant que le nom vient de l'adresse et non de la personne. */
  const [nameDerived, setNameDerived] = useState(true);

  const [progress, setProgress] = useState<CrawlProgress | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  /** L'analyse ne doit partir qu'une fois, meme si React remonte l'effet. */
  const started = useRef(false);

  /*
   * Chaque nouvelle reponse bloquee rouvre le dialogue.
   *
   * Sans cela, quelqu'un qui ferme la fenetre puis resoumet ne reverrait rien :
   * l'etat « ferme » survivrait a la nouvelle tentative.
   */
  useEffect(() => {
    if (state.upgrade) setDismissed(false);
  }, [state.upgrade]);

  const analyse = useCallback(
    async (botId: string) => {
      setFailure(null);
      try {
        await runCrawl(botId, setProgress);
        router.push(`/dashboard/bots/${botId}`);
      } catch (error) {
        setFailure(error instanceof Error ? error.message : 'Erreur inconnue.');
      }
    },
    [router],
  );

  /*
   * L'assistant vient d'etre cree : l'analyse enchaine sans rien demander.
   *
   * C'est tout l'interet — la personne a donne son adresse, elle n'a aucune
   * raison de devoir cliquer une seconde fois pour que le produit fasse ce
   * pour quoi elle est venue.
   */
  useEffect(() => {
    if (!state.botId || started.current) return;
    started.current = true;
    void analyse(state.botId);
  }, [state.botId, analyse]);

  if (state.botId) {
    return (
      <AnalysisPanel
        t={t}
        progress={progress}
        failure={failure}
        onRetry={() => void analyse(state.botId!)}
        onOpen={() => router.push(`/dashboard/bots/${state.botId}`)}
      />
    );
  }

  return (
    <form action={formAction} className="panel flex flex-col">
      <div className="flex flex-col gap-6 p-5">
        {/*
          L'adresse d'abord, le nom ensuite.

          C'est l'ordre du produit : on vient ici avec une adresse de site, pas
          avec un nom d'assistant. Poser la question essentielle en premier
          permet en plus de pre-remplir la seconde.
        */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="websiteUrl">{t.urlLabel}</Label>
          <div className="relative">
            <Globe
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden
            />
            <Input
              id="websiteUrl"
              name="websiteUrl"
              value={url}
              onChange={(event) => {
                const next = event.target.value;
                setUrl(next);
                if (nameDerived) setName(nameFromUrl(next));
              }}
              placeholder={t.urlPlaceholder}
              autoComplete="url"
              autoFocus
              className="pl-9"
              required
            />
          </div>
          <p className="text-muted-foreground text-xs text-pretty">{t.urlHint}</p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="name">{t.nameLabel}</Label>
          <Input
            id="name"
            name="name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setNameDerived(false);
            }}
            placeholder={t.namePlaceholder}
            maxLength={60}
            required
          />
          <p className="text-muted-foreground text-xs text-pretty">
            {nameDerived && name ? t.nameFromUrl : t.nameHint}
          </p>
        </div>

        {state.error && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600"
          >
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {state.error}
          </p>
        )}
      </div>

      <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4">
        <p className="text-muted-foreground text-xs text-pretty">{t.submitHint}</p>
        <Button
          type="submit"
          disabled={pending}
          className="bg-brand hover:bg-brand/90 text-brand-foreground shrink-0"
        >
          {pending ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {pending ? t.submitting : t.submit}
        </Button>
      </div>

      <UpgradeDialog
        offer={state.upgrade ?? null}
        open={Boolean(state.upgrade) && !dismissed}
        onClose={() => setDismissed(true)}
        locale={locale}
        dict={dict}
      />
    </form>
  );
}

/**
 * Deuxieme etape : l'analyse, avec ses chiffres.
 *
 * Trois compteurs plutot qu'une barre de progression : on ne connait pas le
 * nombre de pages avant de les avoir trouvees, donc un pourcentage serait
 * invente. Des nombres qui montent disent la meme chose — il se passe quelque
 * chose — sans rien promettre de faux.
 */
function AnalysisPanel({
  t,
  progress,
  failure,
  onRetry,
  onOpen,
}: {
  t: Dictionary['dashboard']['newBot'];
  progress: CrawlProgress | null;
  failure: string | null;
  onRetry: () => void;
  onOpen: () => void;
}) {
  const problem = failure ?? progress?.error ?? null;

  if (problem) {
    return (
      <section className="panel flex flex-col items-center gap-3 p-8 text-center">
        <span className="flex size-11 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
          <TriangleAlert className="size-5" aria-hidden />
        </span>
        <h2 className="text-lg font-semibold">{t.analysisFailed}</h2>
        <p className="text-muted-foreground max-w-md text-sm text-pretty">{problem}</p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <Button onClick={onRetry} className="bg-brand hover:bg-brand/90 text-brand-foreground">
            {t.retry}
          </Button>
          {/* L'assistant existe malgre l'echec : on ne piege personne sur cet
              ecran, la fiche reste accessible. */}
          <Button variant="outline" onClick={onOpen}>
            {t.openBot}
            <ArrowRight />
          </Button>
        </div>
      </section>
    );
  }

  const finished = progress?.done === true;

  return (
    <section className="panel flex flex-col items-center gap-3 p-8 text-center">
      <span className="bg-brand-soft text-brand flex size-11 items-center justify-center rounded-xl">
        {finished ? (
          <Check className="size-5" aria-hidden />
        ) : (
          <Loader2 className="size-5 animate-spin" aria-hidden />
        )}
      </span>

      <h2 className="text-lg font-semibold">{t.analysing}</h2>
      <p className="text-muted-foreground max-w-md text-sm text-pretty">{t.analysingLead}</p>

      {/* `aria-live` : sans cela, les compteurs montent en silence pour qui
          n'a pas l'ecran sous les yeux. */}
      <dl
        aria-live="polite"
        className="border-border bg-surface-subtle mt-4 grid w-full max-w-sm grid-cols-3 gap-px overflow-hidden rounded-xl border"
      >
        <Counter label={t.pagesFound} value={progress?.pagesFound ?? 0} />
        <Counter label={t.pagesRead} value={progress?.pagesDone ?? 0} />
        <Counter label={t.sectionsBuilt} value={progress?.chunksDone ?? 0} />
      </dl>

      <p className="text-muted-foreground mt-2 text-xs text-pretty">{t.keepOpen}</p>
    </section>
  );
}

function Counter({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface flex flex-col gap-0.5 px-3 py-3">
      <dd className="text-lg font-semibold tabular-nums">{value}</dd>
      <dt className="text-muted-foreground text-[11px] text-pretty">{label}</dt>
    </div>
  );
}
