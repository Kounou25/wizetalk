import { Reveal } from '@/components/reveal';
import type { Dictionary } from '@/lib/i18n';
import { Section, SectionHeading } from '../section';
import { EnterpriseCta } from './cta';

/**
 * La valeur business, en quatre benefices.
 *
 * AUCUN POURCENTAGE, ET C'EST UN CHOIX ASSUME
 *
 * « Deezy augmente les conversions de 43 % » se lit bien et ne survit pas a la
 * premiere question. Nous n'avons aucune mesure publiable, donc chaque
 * benefice est enonce comme un mecanisme — ce qui se passe, et pourquoi —
 * plutot que comme un resultat chiffre.
 *
 * La note finale transforme cette absence en argument : le pilote de l'etape
 * 03 du workflow existe precisement pour produire le chiffre sur le perimetre
 * du client, au lieu de lui en vendre un pris ailleurs.
 *
 * Le positionnement compte autant que le contenu : jamais « remplacez votre
 * equipe support ». Le sous-titre pose l'inverse, et c'est ce que lira le
 * responsable qui devra defendre le projet en interne.
 */
export function EnterpriseValue({ dict }: { dict: Dictionary }) {
  const t = dict.enterprise.value;

  return (
    <Section>
      <SectionHeading eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        {t.items.map((item, index) => (
          <Reveal key={item.title} delay={index * 80}>
            <div className="bg-card flex h-full gap-4 rounded-xl border p-6">
              {/* Le numero remplace l'icone : quatre pictogrammes proches les
                  uns des autres se confondent, un chiffre jamais. */}
              <span className="text-brand/30 font-mono text-2xl font-bold tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <p className="text-lg font-semibold text-balance">{item.title}</p>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed text-pretty">
                  {item.body}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={220}>
        <div className="mt-12 flex flex-col items-center gap-5 text-center">
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed text-pretty">
            {t.note}
          </p>
          {/* Premier rappel a l'action apres les benefices : c'est ici que le
              lecteur convaincu cherche quoi faire. */}
          <EnterpriseCta
            size="default"
            demoLabel={dict.enterprise.hero.ctaPrimary}
            contactLabel={t.cta}
            lead="contact"
          />
        </div>
      </Reveal>
    </Section>
  );
}
