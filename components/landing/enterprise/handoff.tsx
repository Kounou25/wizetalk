import Image from 'next/image';
import { Headset, Link2, Sparkles } from 'lucide-react';

import { Reveal } from '@/components/reveal';
import type { Dictionary } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { pairGrid, Section, SectionHeading } from '../section';

/**
 * Relais humain : les deux chemins d'une conversation.
 *
 * Les deux cartes s'opposent par l'image — un ecran a gauche, des visages a
 * droite — et c'est ce contraste qui porte l'argument.
 *
 * CE QUI EST LIVRE, ET CE QUI NE L'EST PAS
 *
 * Le chemin complexe fonctionne jusqu'a l'alerte : l'assistant refuse quand
 * l'information manque, propose de laisser une adresse, et /api/lead previent
 * le proprietaire par e-mail. Le transfert vers un agent en direct n'existe
 * pas — d'ou la formulation « selon les integrations » et la note sous les
 * cartes.
 *
 * Les visages illustrent les equipes DU CLIENT, jamais celles de Deezy : ni
 * nom, ni fonction, ni citation. Voir public/enterprise/SOURCES.md.
 */
export function EnterpriseHandoff({ dict }: { dict: Dictionary }) {
  const t = dict.enterprise.handoff;

  return (
    <Section>
      <SectionHeading eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

      <div className={cn(pairGrid, 'mt-14 items-stretch')}>
        <Path
          icon={<Sparkles className="size-4" aria-hidden />}
          label={t.simpleLabel}
          steps={t.simpleSteps}
          tone="brand"
          media={<AnswerPreview dict={dict} />}
        />

        <Path
          icon={<Headset className="size-4" aria-hidden />}
          label={t.complexLabel}
          steps={t.complexSteps}
          tone="neutral"
          delay={100}
          media={
            <Image
              src="/enterprise/support-team.jpg"
              alt={t.photoAlt}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          }
          footer={<TeamAvatars dict={dict} />}
        />
      </div>

      <Reveal delay={200}>
        <p className="text-muted-foreground mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-pretty">
          {t.note}
        </p>
      </Reveal>
    </Section>
  );
}

/**
 * Un trajet de conversation. La bande d'image a une hauteur fixe et identique
 * dans les deux cartes, sans quoi les etiquettes ne s'alignent plus et la
 * comparaison se perd.
 */
function Path({
  icon,
  label,
  steps,
  tone,
  media,
  footer,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  steps: string[];
  tone: 'brand' | 'neutral';
  media: React.ReactNode;
  footer?: React.ReactNode;
  delay?: number;
}) {
  const brand = tone === 'brand';

  return (
    <Reveal delay={delay} className="h-full">
      <div className="bg-card flex h-full flex-col overflow-hidden rounded-2xl border">
        <div className="bg-muted relative h-48 shrink-0 sm:h-60">{media}</div>

        <div className="flex flex-1 flex-col p-6 md:p-7">
          <span
            className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
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

          {footer && <div className="mt-auto pt-6">{footer}</div>}
        </div>
      </div>
    </Reveal>
  );
}

/** La reponse et sa source. Dessinee : c'est un ecran, une photo d'ecran
 *  serait moins lisible et moins honnete. */
function AnswerPreview({ dict }: { dict: Dictionary }) {
  const t = dict.enterprise.handoff.simplePreview;

  return (
    <div className="from-brand-soft absolute inset-0 flex flex-col justify-center gap-2.5 bg-gradient-to-br to-transparent px-6">
      <div className="flex justify-end">
        <p className="bg-brand text-brand-foreground max-w-[80%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed shadow-sm">
          {t.question}
        </p>
      </div>

      <div className="flex justify-start">
        <p className="bg-card text-foreground/80 max-w-[85%] rounded-2xl border px-3.5 py-2 text-[13px] leading-relaxed shadow-sm">
          {t.answer}
        </p>
      </div>

      <p className="text-muted-foreground flex items-center gap-1.5 pl-1 text-[11px]">
        <Link2 className="size-3 shrink-0" aria-hidden />
        {t.sourceLabel}
      </p>
    </div>
  );
}

/**
 * Les visages de l'equipe alertee.
 *
 * `aria-hidden` sur la pile : le texte de l'etape porte deja l'information.
 * Les images gardent un alt, pour le cas ou un fichier manquerait.
 */
function TeamAvatars({ dict }: { dict: Dictionary }) {
  const t = dict.enterprise.handoff;

  return (
    <div className="flex items-center gap-3 border-t pt-5">
      <div className="flex -space-x-2.5" aria-hidden>
        {['/enterprise/agent-1.jpg', '/enterprise/agent-2.jpg'].map((src) => (
          <Image
            key={src}
            src={src}
            alt={t.agentAlt}
            width={36}
            height={36}
            className="border-card size-9 rounded-full border-2 object-cover"
          />
        ))}
        <span className="border-card bg-muted text-muted-foreground flex size-9 items-center justify-center rounded-full border-2 text-[11px] font-semibold">
          +
        </span>
      </div>

      <p className="text-sm font-medium text-pretty">{t.teamLabel}</p>
    </div>
  );
}
