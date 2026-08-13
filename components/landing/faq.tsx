import { Reveal } from '@/components/reveal';
import type { Dictionary } from '@/lib/i18n';

/**
 * Accordeon en <details>/<summary> natif : ouverture au clavier, accessible
 * par defaut, et aucune dependance supplementaire.
 */
export function Faq({ dict }: { dict: Dictionary }) {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24 md:py-28">
      <Reveal className="text-center">
        <p className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
          {dict.faq.eyebrow}
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance md:text-4xl">
          {dict.faq.title}
        </h2>
      </Reveal>

      <div className="mt-12 divide-y border-y">
        {dict.faq.items.map((item) => (
          <details key={item.question} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
              {item.question}
              <svg
                className="text-muted-foreground shrink-0 transition-transform group-open:rotate-45"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </summary>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed text-pretty">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
