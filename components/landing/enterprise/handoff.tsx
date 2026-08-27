import { Headset, Sparkles } from 'lucide-react';

import { Reveal } from '@/components/reveal';
import type { Dictionary } from '@/lib/i18n';
import { Section, SectionHeading } from '../section';

/**
 * Relais humain : les deux chemins d'une conversation.
 *
 * Les deux trajets sont montres cote a cote parce que c'est leur difference
 * qui rassure. Un decideur qui craint qu'un assistant s'obstine a repondre a
 * tout doit voir, d'un coup d'oeil, qu'un second chemin existe et qu'il se
 * termine chez ses equipes.
 *
 * CE QUI EST VRAI AUJOURD'HUI, ET CE QUI NE L'EST PAS
 *
 * Le chemin complexe est livre jusqu'a l'alerte : l'assistant refuse quand
 * l'information manque, propose de laisser une adresse, et /api/lead previent
 * le proprietaire par e-mail. Le transfert vers un agent en direct, lui,
 * n'existe pas — d'ou la derniere puce, formulee « selon les integrations »,
 * et la note qui le dit en clair sous le schema.
 */
export function EnterpriseHandoff({ dict }: { dict: Dictionary }) {
  const t = dict.enterprise.handoff;

  return (
    <Section>
      <SectionHeading eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        <Path
          icon={<Sparkles className="size-4" aria-hidden />}
          label={t.simpleLabel}
          steps={t.simpleSteps}
          tone="brand"
        />
        <Path
          icon={<Headset className="size-4" aria-hidden />}
          label={t.complexLabel}
          steps={t.complexSteps}
          tone="neutral"
          delay={100}
        />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {t.points.map((point, index) => (
          <Reveal key={point.title} delay={index * 70}>
            <div className="border-brand/30 h-full border-l-2 pl-4">
              <p className="text-sm font-semibold">{point.title}</p>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed text-pretty">
                {point.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={200}>
        <p className="text-muted-foreground mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-pretty">
          {t.note}
        </p>
      </Reveal>
    </Section>
  );
}

/** Un trajet de conversation : l'etiquette, puis ses etapes numerotees. */
function Path({
  icon,
  label,
  steps,
  tone,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  steps: string[];
  tone: 'brand' | 'neutral';
  delay?: number;
}) {
  const brand = tone === 'brand';

  return (
    <Reveal delay={delay}>
      <div className="bg-card h-full rounded-2xl border p-6 md:p-7">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
            brand ? 'bg-brand-soft text-brand' : 'bg-muted text-muted-foreground'
          }`}
        >
          {icon}
          {label}
        </span>

        <ol className="mt-6 flex flex-col gap-4">
          {steps.map((step, index) => (
            <li key={step} className="flex items-start gap-3">
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums ${
                  brand ? 'bg-brand text-brand-foreground' : 'bg-foreground text-background'
                }`}
                aria-hidden
              >
                {index + 1}
              </span>
              <span className="pt-0.5 text-sm leading-relaxed text-pretty">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </Reveal>
  );
}
