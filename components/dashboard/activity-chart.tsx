'use client';

import { useId, useMemo, useState } from 'react';
import { Table2 } from 'lucide-react';
import type { Dictionary, Locale } from '@/lib/i18n';

export interface ActivityPoint {
  /** Jour au format ISO (AAAA-MM-JJ). */
  date: string;
  conversations: number;
  messages: number;
}

/* Geometrie en unites du viewBox. La hauteur inclut la bande des libelles
   d'axe : un conteneur trop court les couperait et ferait apparaitre une
   barre de defilement dans la carte. */
const WIDTH = 720;
const PLOT_HEIGHT = 180;
const AXIS_BAND = 28;
const HEIGHT = PLOT_HEIGHT + AXIS_BAND;
const PADDING = { top: 12, right: 56, bottom: AXIS_BAND, left: 36 };

type SeriesKey = 'conversations' | 'messages';

const SERIES: { key: SeriesKey; color: string }[] = [
  { key: 'conversations', color: 'var(--series-1)' },
  { key: 'messages', color: 'var(--series-2)' },
];

/**
 * Maximum de l'axe, choisi de sorte que les quatre graduations tombent sur des
 * entiers. On arrondit le PAS, pas le maximum : partir du maximum donnerait par
 * exemple 50/4 = 12,5, soit une demi-conversation en graduation.
 */
function niceMax(peak: number): number {
  if (peak <= 4) return 4;

  const rough = peak / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 5, 10]
    .map((s) => s * magnitude)
    .find((candidate) => rough <= candidate);

  return Math.max(1, Math.round(step ?? 10 * magnitude)) * 4;
}

function makeFormatDay(locale: Locale) {
  const tag = locale === 'fr' ? 'fr-FR' : 'en-US';
  return (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString(tag, {
      day: 'numeric',
      month: 'short',
    });
}

export function ActivityChart({
  data,
  locale,
  dict,
}: {
  data: ActivityPoint[];
  locale: Locale;
  dict: Dictionary;
}) {
  const t = dict.dashboard.chart;
  const formatDay = makeFormatDay(locale);
  const labels: Record<SeriesKey, string> = {
    conversations: t.conversations,
    messages: t.messages,
  };
  const [hovered, setHovered] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const tableId = useId();

  const { max, positions, paths, total } = useMemo(() => {
    const peak = data.reduce(
      (best, point) => Math.max(best, point.conversations, point.messages),
      0,
    );
    const maxValue = niceMax(peak);

    const innerWidth = WIDTH - PADDING.left - PADDING.right;
    const innerHeight = PLOT_HEIGHT - PADDING.top;
    const step = data.length > 1 ? innerWidth / (data.length - 1) : 0;

    const x = (index: number) => PADDING.left + index * step;
    const y = (value: number) =>
      PADDING.top + innerHeight - (value / maxValue) * innerHeight;

    const build = (key: SeriesKey) =>
      data.map((point, index) => `${index === 0 ? 'M' : 'L'}${x(index)},${y(point[key])}`).join(' ');

    return {
      max: maxValue,
      positions: { x, y, step },
      paths: { conversations: build('conversations'), messages: build('messages') },
      total: data.reduce((sum, point) => sum + point.conversations, 0),
    };
  }, [data]);

  const active = hovered !== null ? data[hovered] : undefined;
  const last = data[data.length - 1];

  /* Étiquettes de fin de série : on écarte celles qui se chevauchent plutôt
     que d'étiqueter chaque point, illisible sur 30 jours. */
  const endLabels = last
    ? (() => {
        const raw = SERIES.map((series) => ({
          ...series,
          value: last[series.key],
          y: positions.y(last[series.key]),
        })).sort((a, b) => a.y - b.y);
        const [first, second] = raw;
        if (first && second && second.y - first.y < 14) {
          return [first, { ...second, y: first.y + 14 }];
        }
        return raw;
      })()
    : [];

  const ticks = Array.from({ length: 5 }, (_, i) => (max / 4) * i);
  const dayTickEvery = Math.max(1, Math.ceil(data.length / 6));

  return (
    <section className="viz-root bg-background rounded-xl p-6 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{t.title}</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {total === 0
              ? t.empty
              : `${total} ${total > 1 ? t.totalMany : t.totalOne}`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Légende toujours présente dès deux séries : l'identité ne doit
              jamais reposer sur la couleur seule. */}
          <ul className="flex items-center gap-4">
            {SERIES.map((series) => (
              <li key={series.key} className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: series.color }}
                  aria-hidden
                />
                {labels[series.key]}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setShowTable((current) => !current)}
            aria-expanded={showTable}
            aria-controls={tableId}
            className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1.5 text-xs"
          >
            <Table2 className="size-3.5" aria-hidden />
            {showTable ? t.hideTable : t.showTable}
          </button>
        </div>
      </div>

      <div
        className="relative mt-6"
        onMouseLeave={() => setHovered(null)}
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const ratio = (event.clientX - rect.left) / rect.width;
          const index = Math.round(
            ((ratio * WIDTH - PADDING.left) / (positions.step || 1)),
          );
          setHovered(Math.min(data.length - 1, Math.max(0, index)));
        }}
      >
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full"
          role="img"
          aria-label={`${t.aria} — ${data.length}`}
        >
          {/* Grille en traits pleins d'un cran sur le fond — jamais pointillée. */}
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={PADDING.left}
                x2={WIDTH - PADDING.right}
                y1={positions.y(tick)}
                y2={positions.y(tick)}
                stroke="var(--border)"
                strokeWidth={1}
              />
              <text
                x={PADDING.left - 8}
                y={positions.y(tick) + 4}
                textAnchor="end"
                className="fill-[var(--muted-foreground)] text-[11px] tabular-nums"
              >
                {tick}
              </text>
            </g>
          ))}

          {data.map((point, index) =>
            index % dayTickEvery === 0 || index === data.length - 1 ? (
              <text
                key={point.date}
                x={positions.x(index)}
                y={PLOT_HEIGHT + 18}
                textAnchor="middle"
                className="fill-[var(--muted-foreground)] text-[11px]"
              >
                {formatDay(point.date)}
              </text>
            ) : null,
          )}

          {hovered !== null && (
            <line
              x1={positions.x(hovered)}
              x2={positions.x(hovered)}
              y1={PADDING.top}
              y2={PLOT_HEIGHT}
              stroke="var(--muted-foreground)"
              strokeWidth={1}
              opacity={0.4}
            />
          )}

          {SERIES.map((series) => (
            <path
              key={series.key}
              d={paths[series.key]}
              fill="none"
              stroke={series.color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Repère au survol : anneau de 2px couleur surface pour rester
              lisible quand les deux séries se croisent. */}
          {hovered !== null &&
            active &&
            SERIES.map((series) => (
              <circle
                key={series.key}
                cx={positions.x(hovered)}
                cy={positions.y(active[series.key])}
                r={4.5}
                fill={series.color}
                stroke="var(--background)"
                strokeWidth={2}
              />
            ))}

          {/* Étiquettes de fin : la valeur du jour le plus récent, sélective. */}
          {last &&
            endLabels.map((label) => (
              <text
                key={label.key}
                x={WIDTH - PADDING.right + 10}
                y={label.y + 4}
                className="fill-[var(--muted-foreground)] text-[11px] font-semibold"
              >
                {label.value}
              </text>
            ))}
        </svg>

        {hovered !== null && active && (
          <div
            className="bg-popover pointer-events-none absolute top-0 z-10 min-w-36 rounded-lg px-3 py-2 text-xs shadow-lg ring-1 ring-black/10"
            style={{
              left: `${(positions.x(hovered) / WIDTH) * 100}%`,
              transform:
                positions.x(hovered) > WIDTH / 2
                  ? 'translateX(calc(-100% - 12px))'
                  : 'translateX(12px)',
            }}
          >
            <p className="font-medium">{formatDay(active.date)}</p>
            {SERIES.map((series) => (
              <p key={series.key} className="mt-1 flex items-center gap-1.5">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: series.color }}
                  aria-hidden
                />
                <span className="text-muted-foreground">{labels[series.key]}</span>
                <span className="ml-auto font-semibold tabular-nums">
                  {active[series.key]}
                </span>
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Jumeau tabulaire : aucune valeur n'est accessible uniquement au survol. */}
      {showTable && (
        <div id={tableId} className="mt-6 max-h-64 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground sticky top-0 bg-[var(--background)] text-left text-xs">
              <tr>
                <th scope="col" className="py-2 font-medium">{t.day}</th>
                <th scope="col" className="py-2 text-right font-medium">{t.conversations}</th>
                <th scope="col" className="py-2 text-right font-medium">{t.messages}</th>
              </tr>
            </thead>
            <tbody>
              {[...data].reverse().map((point) => (
                <tr key={point.date} className="border-t">
                  <td className="py-1.5">{formatDay(point.date)}</td>
                  <td className="py-1.5 text-right tabular-nums">{point.conversations}</td>
                  <td className="py-1.5 text-right tabular-nums">{point.messages}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
