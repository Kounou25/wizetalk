import { ArrowDown, ArrowRight, FileText, Globe, MessagesSquare, User } from 'lucide-react';

import { Reveal } from '@/components/reveal';
import type { Dictionary } from '@/lib/i18n';
import { ChatGlyph } from '../logo';
import { Section, SectionHeading } from '../section';

/**
 * Le fonctionnement, en trois etapes puis en un schema.
 *
 * Le schema resume les etapes plutot qu'il ne les illustre : quelqu'un qui
 * saute le texte doit comprendre le produit rien qu'en le regardant.
 */
export function EnterpriseSolution({ dict }: { dict: Dictionary }) {
  const t = dict.enterprise.solution;

  return (
    <Section id="solution" tone="muted">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {t.steps.map((step, index) => (
          <Reveal key={step.index} delay={index * 90}>
            <div className="bg-card h-full rounded-xl border p-6">
              <span className="text-brand font-mono text-sm font-bold">{step.index}</span>
              <p className="mt-3 text-lg font-semibold text-balance">{step.title}</p>
              <p className="text-muted-foreground mt-2.5 text-sm leading-relaxed text-pretty">
                {step.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={160}>
        <Flow dict={dict} />
      </Reveal>
    </Section>
  );
}

/**
 * Vos sources → Deezy → votre visiteur.
 *
 * Les fleches changent de direction avec la mise en page : vers la droite en
 * ligne, vers le bas une fois empilees.
 */
function Flow({ dict }: { dict: Dictionary }) {
  const t = dict.enterprise.solution.flow;

  const icons = [Globe, FileText, MessagesSquare, FileText];

  return (
    <div className="bg-card mt-14 rounded-2xl border p-6 md:p-8">
      <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center md:gap-6">
        <div className="flex-1">
          <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
            {t.sourceTitle}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {t.sourceItems.map((item, index) => {
              const Icon = icons[index] ?? FileText;
              return (
                <span
                  key={item}
                  className="bg-muted/60 text-foreground/80 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium"
                >
                  <Icon className="text-muted-foreground size-3.5 shrink-0" aria-hidden />
                  {item}
                </span>
              );
            })}
          </div>
        </div>

        <FlowArrow />

        <div className="border-brand/25 bg-brand-soft flex-1 rounded-xl border p-5 text-center">
          <ChatGlyph className="mx-auto size-9" />
          <p className="text-brand mt-3 font-semibold">{t.engineTitle}</p>
          <p className="text-brand/80 mt-1 text-xs leading-relaxed text-pretty">
            {t.engineBody}
          </p>
        </div>

        <FlowArrow />

        <div className="flex-1 rounded-xl border p-5 text-center">
          <span className="bg-muted text-muted-foreground mx-auto flex size-9 items-center justify-center rounded-full">
            <User className="size-4" aria-hidden />
          </span>
          <p className="mt-3 font-semibold">{t.visitorTitle}</p>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed text-pretty">
            {t.visitorBody}
          </p>
        </div>
      </div>
    </div>
  );
}

function FlowArrow() {
  return (
    <span
      className="text-muted-foreground/40 flex shrink-0 items-center justify-center"
      aria-hidden
    >
      <ArrowDown className="size-5 md:hidden" />
      <ArrowRight className="hidden size-5 md:block" />
    </span>
  );
}
