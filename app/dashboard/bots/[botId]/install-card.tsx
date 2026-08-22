import { EmbedTabs } from '@/components/embed-tabs';
import type { Dictionary } from '@/lib/i18n';

export function InstallCard({ botId, dict }: { botId: string; dict: Dictionary }) {
  const t = dict.dashboard.install;

  return (
    <section className="bg-background rounded-xl p-6 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
      <h2 className="font-semibold">{t.title}</h2>
      <p className="text-muted-foreground mt-1 text-sm">{t.lead}</p>

      <div className="mt-5">
        <EmbedTabs
          botId={botId}
          copyLabel={t.copy}
          copiedLabel={t.copied}
        />
      </div>
    </section>
  );
}
