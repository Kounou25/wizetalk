import { Lock, MessageCircle, Palette, Quote, RefreshCw, ShieldCheck } from 'lucide-react';
import { Reveal } from '@/components/reveal';
import { Spotlight } from '@/components/spotlight';
import type { Dictionary } from '@/lib/i18n';

/** Appariees par ordre aux entrees du dictionnaire. */
const ICONS = [ShieldCheck, Quote, RefreshCw, Palette, MessageCircle, Lock];

export function Features({ dict }: { dict: Dictionary }) {
  return (
    <section id="fonctionnalites" className="bg-muted/40 border-y">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
            {dict.features.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance md:text-4xl">
            {dict.features.title}
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dict.features.items.map((feature, index) => {
            const Icon = ICONS[index % ICONS.length] ?? ShieldCheck;

            return (
              <Reveal key={feature.title} delay={(index % 3) * 90}>
                <Spotlight className="bg-background hover:ring-brand/25 h-full rounded-2xl p-6 ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:ring-white/10">
                  <div className="bg-brand-soft text-brand flex size-11 items-center justify-center rounded-xl">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <h3 className="mt-5 font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed text-pretty">
                    {feature.body}
                  </p>
                </Spotlight>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
