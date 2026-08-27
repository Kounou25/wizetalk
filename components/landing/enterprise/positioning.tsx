import { Reveal } from '@/components/reveal';
import type { Dictionary } from '@/lib/i18n';

/**
 * Bandeau de positionnement, colle sous le heros.
 *
 * Il repond a la seule question que se pose le lecteur a cet instant :
 * « en quoi est-ce different des chatbots qu'on nous propose deja ». Trois
 * affirmations, aucune illustration — c'est un palier de lecture, pas une
 * section.
 *
 * A la place d'un bandeau de logos clients : tant qu'il n'y a pas de
 * references citables, une rangee de marques inventees serait la premiere
 * chose qu'une grande organisation verifierait, et la premiere qui la ferait
 * partir.
 */
export function EnterprisePositioning({ dict }: { dict: Dictionary }) {
  const t = dict.enterprise.positioning;

  return (
    <section className="bg-muted/40 border-y">
      <div className="mx-auto max-w-6xl px-6 py-14 md:py-16">
        <Reveal>
          <h2 className="max-w-2xl text-xl font-semibold tracking-tight text-balance md:text-2xl">
            {t.title}
          </h2>
        </Reveal>

        <div className="mt-8 grid gap-x-10 gap-y-7 md:grid-cols-3">
          {t.items.map((item, index) => (
            <Reveal key={item.title} delay={index * 80}>
              {/* Le filet a gauche remplace la carte : trois panneaux poses ici
                  alourdiraient une bande qui doit se traverser vite. */}
              <div className="border-brand/30 border-l-2 pl-4">
                <p className="font-semibold">{item.title}</p>
                <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed text-pretty">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
