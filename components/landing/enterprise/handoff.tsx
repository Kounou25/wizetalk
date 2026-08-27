import Image from 'next/image';
import { Headset, Link2, Sparkles } from 'lucide-react';

import { Reveal } from '@/components/reveal';
import type { Dictionary } from '@/lib/i18n';
import { Section, SectionHeading } from '../section';

/**
 * Relais humain : les deux chemins d'une conversation.
 *
 * LE CONTRASTE VISUEL EST L'ARGUMENT
 *
 * Les deux cartes portent chacune une image, et ces images s'opposent : a
 * gauche un ecran — la reponse arrive, avec sa source ; a droite des visages —
 * quelqu'un reprend la conversation. Ce que les deux colonnes de texte
 * disaient, le regard le comprend maintenant avant de lire.
 *
 * C'est la seule section de la page ou une photographie apporte quelque chose.
 * Ailleurs, une image de bureau ou de reunion n'illustrerait rien : le produit
 * est un ecran, et le montrer vaut mieux qu'une mise en scene. Ici, le sujet
 * EST la presence humaine, donc l'absence d'humain se voyait.
 *
 * CE QUE CES VISAGES DISENT, ET CE QU'ILS N'ONT PAS LE DROIT DE DIRE
 *
 * Ce sont des photographies de banque d'images (Pexels), et elles illustrent
 * les equipes DU CLIENT — jamais celles de Deezy. Pas de nom, pas de fonction,
 * pas de citation : preter une identite a un visage achete fabriquerait un
 * faux temoignage, exactement ce que le reste de la page se refuse a faire.
 * Elles n'apparaissent pas non plus a cote du formulaire, ou elles
 * designeraient un employe de Deezy qui n'existe pas.
 * Voir public/enterprise/SOURCES.md.
 *
 * CE QUI EST VRAI AUJOURD'HUI, ET CE QUI NE L'EST PAS
 *
 * Le chemin complexe est livre jusqu'a l'alerte : l'assistant refuse quand
 * l'information manque, propose de laisser une adresse, et /api/lead previent
 * le proprietaire par e-mail. Le transfert vers un agent en direct, lui,
 * n'existe pas — d'ou la derniere puce, formulee « selon les integrations »,
 * et la note qui le dit en clair sous les deux cartes.
 */
export function EnterpriseHandoff({ dict }: { dict: Dictionary }) {
  const t = dict.enterprise.handoff;

  return (
    <Section>
      <SectionHeading eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

      <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-2">
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
              // Deux colonnes au-dela de lg, pleine largeur en dessous : sans
              // cette indication, le navigateur telecharge la variante prevue
              // pour la largeur totale de l'ecran sur un telephone.
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          }
          footer={<TeamAvatars dict={dict} />}
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

/**
 * Un trajet de conversation : son image, son etiquette, puis ses etapes.
 *
 * La bande d'image a une hauteur fixe et identique dans les deux cartes. Sans
 * elle, la photographie et la maquette se caleraient chacune sur leur contenu,
 * et les deux etiquettes ne seraient plus alignees — le regard perdrait
 * justement la comparaison que la section cherche a produire.
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
        <div className="bg-muted relative h-48 shrink-0 sm:h-56">{media}</div>

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

/**
 * Ce que voit le visiteur quand la question est simple : la reponse, et d'ou
 * elle vient.
 *
 * Dessinee plutot que photographiee — c'est un ecran, le montrer tel quel est
 * plus honnete et plus lisible qu'une photo de quelqu'un devant un ecran.
 */
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
 * Les visages de l'equipe alertee, en pile.
 *
 * Poses sous la derniere etape, la ou le texte dit « vos equipes reprennent la
 * main » : c'est le moment de la page ou le lecteur doit se representer des
 * personnes plutot qu'un systeme.
 *
 * `aria-hidden` sur la pile : le texte de l'etape porte deja l'information, et
 * un lecteur d'ecran n'a rien a gagner a s'entendre annoncer deux portraits
 * decoratifs. Les images gardent tout de meme un alt, pour le cas ou le
 * fichier manquerait.
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
