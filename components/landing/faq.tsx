import { Reveal } from '@/components/reveal';

/**
 * Accordeon en <details>/<summary> natif : ouverture au clavier, accessible
 * par defaut, aucune dependance.
 *
 * Il recoit ce qu'il affiche plutot que le dictionnaire entier  les deux
 * pages ont leur propre liste de questions sous des cles differentes.
 */
export function Faq({
  id = 'faq',
  eyebrow,
  title,
  items,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  items: { question: string; answer: string }[];
}) {
  return (
    <section id={id} className="mx-auto max-w-3xl scroll-mt-20 px-6 py-24 md:py-28">
      <Reveal className="text-center">
        <p className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance md:text-4xl">
          {title}
        </h2>
      </Reveal>

      <div className="mt-12 divide-y border-y">
        {items.map((item) => (
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
