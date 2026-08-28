import { FileText, Globe, Mail } from 'lucide-react';

import { Reveal } from '@/components/reveal';
import type { Dictionary } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { pairGrid, Section, SectionHeading } from '../section';

const AVAILABLE_ICONS = [Globe, FileText, Mail];

/**
 * Integrations.
 *
 * LA SEPARATION EST LA SECTION
 *
 * Le brief listait site web, API, webhooks, CRM, outils de support, analytics
 * et integrations sur mesure. Un seul de ces sept elements est livre : le site
 * web (plus les documents et les alertes e-mail, ajoutes ici parce qu'ils le
 * sont vraiment). Il n'existe ni cle d'API publique, ni webhook sortant, ni
 * connecteur CRM — le seul webhook du depot est celui, entrant, du prestataire
 * de paiement.
 *
 * Afficher les sept sur la meme ligne aurait ete la promesse la plus facile a
 * demonter de toute la page : il suffit d'ouvrir la documentation. La colonne
 * de droite les garde donc visibles — ce sont de vraies demandes, et les
 * discuter est le but de la page — mais sous un titre qui ne promet rien.
 *
 * Le jour ou l'un d'eux existe, il traverse : de `onRequest` vers `available`,
 * avec une phrase decrivant ce qu'il fait.
 */
export function EnterpriseIntegrations({ dict }: { dict: Dictionary }) {
  const t = dict.enterprise.integrations;

  return (
    <Section tone="muted">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

      <div className={cn(pairGrid, 'mt-14')}>
        <Reveal>
          <div className="bg-card h-full rounded-2xl border p-6 md:p-7">
            <p className="text-brand text-xs font-semibold tracking-widest uppercase">
              {t.availableTitle}
            </p>

            <div className="mt-5 flex flex-col gap-4">
              {t.available.map((item, index) => {
                const Icon = AVAILABLE_ICONS[index] ?? Globe;

                return (
                  <div key={item.title} className="flex items-start gap-3.5">
                    <span className="bg-brand-soft text-brand flex size-9 shrink-0 items-center justify-center rounded-lg">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-muted-foreground mt-1 text-sm leading-relaxed text-pretty">
                        {item.body}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="bg-card h-full rounded-2xl border border-dashed p-6 md:p-7">
            <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
              {t.onRequestTitle}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {t.onRequest.map((item) => (
                <span
                  key={item}
                  className="bg-muted/60 text-muted-foreground rounded-lg border px-3 py-1.5 text-sm"
                >
                  {item}
                </span>
              ))}
            </div>

            <p className="text-muted-foreground mt-6 border-t pt-4 text-xs leading-relaxed text-pretty">
              {t.note}
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
