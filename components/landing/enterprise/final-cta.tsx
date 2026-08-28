import { Reveal } from '@/components/reveal';
import type { Dictionary } from '@/lib/i18n';
import { EnterpriseCta } from './cta';

/**
 * Dernier appel a l'action, juste avant le formulaire.
 *
 * Deux boutons, alors que la landing n'en garde qu'un : ils menent au meme
 * formulaire dix centimetres plus bas, donc ils ne dispersent rien  ils
 * laissent le lecteur nommer sa demande.
 */
export function EnterpriseFinalCta({ dict }: { dict: Dictionary }) {
  const t = dict.enterprise.finalCta;

  return (
    <section className="border-t">
      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="bg-brand/10 animate-float pointer-events-none absolute -bottom-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full blur-3xl"
        />
        <div
          aria-hidden
          className="bg-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_100%,#000,transparent)]"
        />

        <Reveal className="relative mx-auto max-w-3xl px-6 py-24 text-center md:py-28">
          <h2 className="text-3xl font-bold tracking-tight text-balance md:text-5xl">
            {t.title}
          </h2>
          <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-lg text-pretty">
            {t.lead}
          </p>

          <EnterpriseCta
            className="mt-9 justify-center"
            demoLabel={t.ctaPrimary}
            contactLabel={t.ctaSecondary}
            lead="demo"
          />
        </Reveal>
      </div>
    </section>
  );
}
