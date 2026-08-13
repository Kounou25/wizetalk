import type { Dictionary } from '@/lib/i18n';

/**
 * Maquette statique du tableau de bord.
 *
 * Le heros montre ce que voit le visiteur ; celle-ci montre ce que voit le
 * client. Les deux moities du produit sont ainsi visibles sans inscription.
 */
export function DashboardPreview({ dict }: { dict: Dictionary }) {
  const t = dict.solution.dashboard;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="overflow-hidden rounded-2xl border shadow-2xl">
        <div className="bg-muted/60 flex items-center gap-2 border-b px-4 py-3">
          <span className="size-2.5 rounded-full bg-red-400/70" />
          <span className="size-2.5 rounded-full bg-amber-400/70" />
          <span className="size-2.5 rounded-full bg-emerald-400/70" />
          <div className="bg-background text-muted-foreground ml-3 flex-1 truncate rounded-md border px-3 py-1 text-xs">
            app.wizetalk.com/dashboard
          </div>
        </div>

        <div className="bg-background p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-semibold">{t.botName}</p>
              <p className="text-muted-foreground text-sm">monentreprise.com</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600">
              <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
              {t.status}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            {t.stats.map((stat) => (
              <div key={stat.label} className="bg-muted/50 rounded-xl border p-4">
                <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>

          <p className="text-muted-foreground mt-7 text-xs font-medium tracking-wide uppercase">
            {t.recentTitle}
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {t.recent.map((question) => (
              <li
                key={question}
                className="flex items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-sm"
              >
                <span className="truncate">{question}</span>
                <span className="text-muted-foreground shrink-0 text-xs">{t.answered}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-muted-foreground mt-4 text-center text-sm">{t.caption}</p>
    </div>
  );
}
