import { Reveal } from '@/components/reveal';
import type { Dictionary } from '@/lib/i18n';
import { Section, SectionHeading } from './section';

/**
 * Chiffres du produit, jamais de moyennes clients.
 *
 * La note du bas dit exactement ce que valent ces nombres. C'est
 * contre-intuitif sur une page de vente, mais une page qui annonce elle-meme
 * la limite de sa preuve inspire davantage confiance qu'une page qui laisse
 * croire a des resultats qu'elle n'a pas encore. Le jour ou de vraies donnees
 * existent, elles remplacent ce bloc — et la note disparait.
 */
export function Results({ dict }: { dict: Dictionary }) {
  const t = dict.results;

  return (
    <Section tone="muted">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {t.items.map((item, index) => (
          <Reveal key={item.label} delay={index * 80}>
            <div className="bg-background h-full rounded-2xl p-6 text-center ring-1 ring-black/5 dark:ring-white/10">
              <p className="text-brand text-3xl font-extrabold tracking-tight md:text-4xl">
                {item.value}
              </p>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed text-pretty">
                {item.label}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={200}>
        <p className="text-muted-foreground mx-auto mt-8 max-w-xl text-center text-xs leading-relaxed text-pretty">
          {t.note}
        </p>
      </Reveal>
    </Section>
  );
}
