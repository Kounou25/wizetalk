import Link from 'next/link';
import { ExternalLink, Mail, Plus } from 'lucide-react';

import { getDictionary } from '@/lib/i18n';
import { getRequestLocale } from '@/lib/i18n/server';
import { SUPPORT_EMAIL } from '@/lib/public-url';
import { Button } from '@/components/ui/button';
import { PageHeader, Panel, PanelHeader } from '@/components/dashboard/panel';

export default async function HelpPage() {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);
  const t = dict.dashboard.help;

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <PageHeader title={t.title} description={t.lead} />

      <Panel>
        <PanelHeader title={t.startTitle} />
        {/* Les memes trois etapes que la page de presentation : le client
            retrouve mot pour mot ce qu'on lui a promis avant l'inscription. */}
        <ol className="divide-border divide-y">
          {dict.install.steps.map((step) => (
            <li key={step.title} className="flex gap-3 px-4 py-3">
              <span className="bg-surface-subtle text-foreground border-border flex size-6 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] font-semibold tabular-nums">
                {step.step}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">{step.title}</p>
                <p className="text-muted-foreground mt-0.5 text-sm text-pretty">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Panel>

      <Panel>
        <PanelHeader title={t.faqTitle} />
        {/* Accordeon <details>/<summary> natif : ouverture au clavier et
            annonce correcte par les lecteurs d'ecran, sans une ligne de JS. */}
        <div className="divide-border divide-y">
          {dict.faq.items.map((item) => (
            <details key={item.question} className="group">
              <summary className="focus-ring hover:bg-surface-subtle flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-sm font-medium transition-colors">
                {item.question}
                <svg
                  className="text-muted-foreground shrink-0 transition-transform group-open:rotate-45"
                  width="16"
                  height="16"
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
              <p className="text-muted-foreground px-4 pb-3.5 text-sm leading-relaxed text-pretty">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelHeader title={t.contactTitle} description={t.contactLead} divided={false} />
        <div className="flex flex-wrap items-center gap-2 px-4 pt-1 pb-4">
          <Button asChild className="bg-brand hover:bg-brand/90 text-brand-foreground">
            {/* L'adresse est affichee en clair dans le libelle : un client dont
                le poste n'ouvre pas mailto: doit pouvoir la recopier. */}
            <a href={`mailto:${SUPPORT_EMAIL}`}>
              <Mail />
              {t.contactCta}  {SUPPORT_EMAIL}
            </a>
          </Button>

          <Button asChild variant="outline">
            <Link href="/dashboard/bots/new">
              <Plus />
              {t.newBotCta}
            </Link>
          </Button>

          <Button asChild variant="ghost">
            <a href={`/${locale}`} target="_blank" rel="noreferrer">
              {t.siteCta}
              <ExternalLink />
            </a>
          </Button>
        </div>
      </Panel>
    </div>
  );
}
