import { FileSearch, ShieldCheck, Lock } from 'lucide-react';

import { Reveal } from '@/components/reveal';
import type { Dictionary } from '@/lib/i18n';

/**
 * Preuve produit, a la place d'un mur de logos.
 *
 * Cet emplacement affichait un bandeau de huit marques inventees. Un mur de
 * logos se lit comme un mur de clients : le laisser en ligne revient a
 * fabriquer une preuve sociale. Tant qu'il n'y a pas d'entreprises citables,
 * la seule preuve honnete est le fonctionnement du produit lui-meme — et elle
 * a l'avantage d'etre verifiable.
 */
const ICONS = [FileSearch, ShieldCheck, Lock];

export function ProductProof({ dict }: { dict: Dictionary }) {
  const t = dict.proof;

  return (
    <section className="bg-muted/40 border-y">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <Reveal className="text-center">
          <p className="text-lg font-semibold tracking-tight text-balance md:text-xl">
            {t.title}
          </p>
        </Reveal>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {t.items.map((item, index) => {
            const Icon = ICONS[index % ICONS.length] ?? FileSearch;

            return (
              <Reveal key={item.title} delay={index * 90} className="flex gap-3">
                <span className="bg-brand-soft text-brand flex size-9 shrink-0 items-center justify-center rounded-xl">
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed text-pretty">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
