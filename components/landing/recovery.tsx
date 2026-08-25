import Link from 'next/link';
import { ArrowRight, CornerDownRight, Mail, ShieldAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';
import type { Dictionary, Locale } from '@/lib/i18n';
import { ChatGlyph } from './logo';
import { Section, SectionHeading } from './section';

/**
 * Le differenciateur de la page, en un seul bloc.
 *
 * Le refus de repondre et la capture du prospect sont la meme scene vue de
 * deux cotes. Traites en deux sections separees, ils se repetaient : le
 * lecteur croyait avoir deja lu la seconde. Reunis — la conversation a gauche,
 * ce qu'elle declenche a droite — ils forment l'argument le plus fort de la
 * page, et ne frappent qu'une fois.
 */
export function Recovery({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.recovery;

  return (
    <Section id="fiabilite">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

      <div className="mt-14 grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
        <Reveal>
          <RefusalConversation dict={dict} />
        </Reveal>

        <Reveal delay={120}>
          <Funnel dict={dict} />
        </Reveal>
      </div>

      <Reveal delay={160} className="mx-auto mt-12 max-w-2xl text-center">
        <p className="text-lg leading-relaxed font-medium text-pretty">{t.payoff}</p>

        <Button
          asChild
          size="lg"
          className="bg-brand hover:bg-brand/90 text-brand-foreground group mt-7 h-12 px-6 text-base"
        >
          <Link href={`/${locale}/signup`}>
            {t.cta}
            <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </Reveal>
    </Section>
  );
}

/**
 * La scene : Deezy refuse, puis propose de recuperer l'adresse.
 *
 * Volontairement inerte — aucun appel reseau depuis la landing. Le champ
 * e-mail est une maquette : le rendre saisissable ferait croire a un vrai
 * formulaire et produirait un envoi qui n'arriverait nulle part.
 */
function RefusalConversation({ dict }: { dict: Dictionary }) {
  const t = dict.recovery.conversation;

  return (
    <div className="bg-card overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10">
      <div className="bg-brand text-brand-foreground flex items-center gap-2.5 px-4 py-3.5">
        <ChatGlyph className="size-7" />
        <p className="truncate text-sm font-semibold">{dict.hero.mockup.title}</p>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex justify-end">
          <p className="bg-brand text-brand-foreground max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed">
            {t.question}
          </p>
        </div>

        {/* Le refus, marque par un ton d'alerte doux plutot que par du rouge :
            ce n'est pas une erreur du produit, c'est son comportement voulu. */}
        <div className="flex justify-start">
          <div className="bg-muted text-foreground/80 max-w-[90%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed">
            <p className="flex items-start gap-2">
              <ShieldAlert
                className="mt-0.5 size-3.5 shrink-0 text-amber-600"
                aria-hidden
              />
              {t.refusal}
            </p>
            <p className="mt-2.5">{t.invite}</p>
          </div>
        </div>

        {/* La capture, dans le fil de la conversation : c'est ce qui la rend
            naturelle pour le visiteur, et efficace pour le client. */}
        <div className="border-brand/20 bg-brand-soft/40 mt-1 rounded-xl border border-dashed p-3">
          <div className="flex items-center gap-2">
            <div className="bg-background text-muted-foreground flex flex-1 items-center gap-2 rounded-lg border px-3 py-2 text-xs">
              <Mail className="size-3.5 shrink-0" aria-hidden />
              {t.placeholder}
            </div>
            <span className="bg-brand text-brand-foreground shrink-0 rounded-lg px-3 py-2 text-xs font-semibold">
              {t.send}
            </span>
          </div>
          <p className="text-muted-foreground mt-2 flex items-center gap-1.5 text-[11px]">
            <CornerDownRight className="size-3 shrink-0" aria-hidden />
            {t.sent}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Les deux issues possibles, cote a cote. */
function Funnel({ dict }: { dict: Dictionary }) {
  const t = dict.recovery;

  return (
    <div>
      <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
        {t.funnelLabel}
      </p>

      <div className="border-border bg-background mt-4 rounded-xl border px-4 py-3 text-center text-sm font-medium shadow-sm">
        {t.funnel.start}
      </div>

      {/* Le trait de bifurcation. Purement decoratif : la structure reelle est
          portee par les deux colonnes et leurs intitules. */}
      <div aria-hidden className="flex justify-center">
        <span className="bg-border h-6 w-px" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Branch
          label={t.funnel.branchAnswer.label}
          steps={t.funnel.branchAnswer.steps}
          outcome={t.funnel.branchAnswer.outcome}
          tone="neutral"
        />
        <Branch
          label={t.funnel.branchLead.label}
          steps={t.funnel.branchLead.steps}
          outcome={t.funnel.branchLead.outcome}
          tone="brand"
        />
      </div>
    </div>
  );
}

function Branch({
  label,
  steps,
  outcome,
  tone,
}: {
  label: string;
  steps: readonly string[];
  outcome: string;
  /** `brand` marque la branche qui porte l'argument : celle du rattrapage. */
  tone: 'neutral' | 'brand';
}) {
  const highlighted = tone === 'brand';

  return (
    <div
      className={`flex flex-col rounded-2xl border p-4 ${
        highlighted ? 'border-brand/30 bg-brand-soft/40' : 'border-border bg-muted/30'
      }`}
    >
      <p
        className={`text-sm font-semibold ${highlighted ? 'text-brand' : 'text-foreground'}`}
      >
        {label}
      </p>

      <ol className="mt-3 flex flex-1 flex-col gap-2">
        {steps.map((step) => (
          <li
            key={step}
            className="text-muted-foreground flex items-start gap-2 text-sm leading-relaxed"
          >
            <span
              className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                highlighted ? 'bg-brand' : 'bg-muted-foreground/40'
              }`}
              aria-hidden
            />
            {step}
          </li>
        ))}
      </ol>

      <p
        className={`mt-4 rounded-lg px-3 py-2 text-center text-sm font-semibold ${
          highlighted
            ? 'bg-brand text-brand-foreground'
            : 'bg-background text-foreground border-border border'
        }`}
      >
        {outcome}
      </p>
    </div>
  );
}
