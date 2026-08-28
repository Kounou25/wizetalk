'use client';

import { useId, useMemo, useState } from 'react';
import { Table2 } from 'lucide-react';

import type { Dictionary, Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Segmented } from '@/components/ui/segmented';
import { Panel, PanelHeader } from './panel';

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
const PLOT_HEIGHT = 170;
const AXIS_BAND = 26;
const HEIGHT = PLOT_HEIGHT + AXIS_BAND;
const PADDING = { top: 10, right: 44, bottom: AXIS_BAND, left: 32 };

type SeriesKey = 'conversations' | 'messages';
type Range = '7' | '30' | '90';

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
  className,
}: {
  /** Serie complete (90 jours). La periode affichee est choisie ici. */
  data: ActivityPoint[];
  locale: Locale;
  dict: Dictionary;
  className?: string;
}) {
  const t = dict.dashboard.chart;
  const formatDay = makeFormatDay(locale);
  const labels: Record<SeriesKey, string> = {
    conversations: t.conversations,
    messages: t.messages,
  };

  const [range, setRange] = useState<Range>('30');
  const [hovered, setHovered] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const tableId = useId();
  /* Le degrade est reference par url(#...) : on retire les caracteres que
     useId ajoute autour du compteur, qui n'ont pas leur place dans un
     identifiant de fragment. */
  const areaId = `activity-area${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  /* La periode se decoupe cote client : les 90 jours sont deja charges, un
     aller-retour serveur par changement de periode serait du gaspillage. */
  const points = useMemo(() => data.slice(-Number(range)), [data, range]);

  const { max, positions, paths, area, total } = useMemo(() => {
    const peak = points.reduce(
      (best, point) => Math.max(best, point.conversations, point.messages),
      0,
    );
    const maxValue = niceMax(peak);

    const innerWidth = WIDTH - PADDING.left - PADDING.right;
    const innerHeight = PLOT_HEIGHT - PADDING.top;
    const step = points.length > 1 ? innerWidth / (points.length - 1) : 0;

    const x = (index: number) => PADDING.left + index * step;
    const y = (value: number) =>
      PADDING.top + innerHeight - (value / maxValue) * innerHeight;

    const build = (key: SeriesKey) =>
      points
        .map((point, index) => `${index === 0 ? 'M' : 'L'}${x(index)},${y(point[key])}`)
        .join(' ');

    const line = build('conversations');

    return {
      max: maxValue,
      positions: { x, y, step },
      paths: { conversations: line, messages: build('messages') },
      /* Aire degradee sous la seule serie principale : deux aires superposees
         se melangeraient et rendraient les deux illisibles. */
      area:
        points.length > 1
          ? `${line} L${x(points.length - 1)},${PLOT_HEIGHT} L${x(0)},${PLOT_HEIGHT} Z`
          : '',
      total: points.reduce((sum, point) => sum + point.conversations, 0),
    };
  }, [points]);

  const active = hovered !== null ? points[hovered] : undefined;
  const last = points[points.length - 1];

  /* Étiquettes de fin de série : on écarte celles qui se chevauchent plutôt
     que d'étiqueter chaque point, illisible sur 90 jours. */
  const endLabels = last
    ? (() => {
        const raw = SERIES.map((series) => ({
          ...series,
          value: last[series.key],
          y: positions.y(last[series.key]),
        })).sort((a, b) => a.y - b.y);
        const [first, second] = raw;
        if (first && second && second.y - first.y < 13) {
          return [first, { ...second, y: first.y + 13 }];
        }
        return raw;
      })()
    : [];

  const ticks = Array.from({ length: 5 }, (_, i) => (max / 4) * i);
  const dayTickEvery = Math.max(1, Math.ceil(points.length / 6));

  return (
    <Panel className={cn('viz-root flex flex-col', className)}>
      <PanelHeader
        title={t.title}
        description={total === 0 ? t.empty : `${total} ${total > 1 ? t.totalMany : t.totalOne}`}
        action={
          <Segmented
            label={t.rangeLabel}
            value={range}
            onChange={(next) => {
              setRange(next);
              // Le repere de survol designe un index : il ne veut plus rien
              // dire une fois la periode changee.
              setHovered(null);
            }}
            options={[
              { value: '7', label: t.range7 },
              { value: '30', label: t.range30 },
              { value: '90', label: t.range90 },
            ]}
          />
        }
      />

      <div className="flex flex-1 flex-col p-4">
        <div
          className="relative"
          onMouseLeave={() => setHovered(null)}
          onMouseMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const ratio = (event.clientX - rect.left) / rect.width;
            const index = Math.round((ratio * WIDTH - PADDING.left) / (positions.step || 1));
            setHovered(Math.min(points.length - 1, Math.max(0, index)));
          }}
        >
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full"
            role="img"
            aria-label={`${t.aria}  ${points.length}`}
          >
            <defs>
              <linearGradient id={areaId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--series-1)" stopOpacity={0.18} />
                <stop offset="100%" stopColor="var(--series-1)" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Grille en traits pleins d'un cran sur le fond  jamais pointillée. */}
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
                  y={positions.y(tick) + 3.5}
                  textAnchor="end"
                  className="fill-[var(--muted-foreground)] text-[10px] tabular-nums"
                >
                  {tick}
                </text>
              </g>
            ))}

            {points.map((point, index) =>
              index % dayTickEvery === 0 || index === points.length - 1 ? (
                <text
                  key={point.date}
                  x={positions.x(index)}
                  y={PLOT_HEIGHT + 16}
                  textAnchor="middle"
                  className="fill-[var(--muted-foreground)] text-[10px]"
                >
                  {formatDay(point.date)}
                </text>
              ) : null,
            )}

            {area && <path d={area} fill={`url(#${areaId})`} />}

            {hovered !== null && (
              <line
                x1={positions.x(hovered)}
                x2={positions.x(hovered)}
                y1={PADDING.top}
                y2={PLOT_HEIGHT}
                stroke="var(--border-strong)"
                strokeWidth={1}
              />
            )}

            {SERIES.map((series) => (
              <path
                key={series.key}
                d={paths[series.key]}
                fill="none"
                stroke={series.color}
                strokeWidth={1.75}
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
                  r={4}
                  fill={series.color}
                  stroke="var(--surface)"
                  strokeWidth={2}
                />
              ))}

            {/* Étiquettes de fin : la valeur du jour le plus récent, sélective. */}
            {last &&
              endLabels.map((label) => (
                <text
                  key={label.key}
                  x={WIDTH - PADDING.right + 8}
                  y={label.y + 3.5}
                  className="fill-[var(--muted-foreground)] text-[10px] font-semibold tabular-nums"
                >
                  {label.value}
                </text>
              ))}
          </svg>

          {hovered !== null && active && (
            <div
              className="overlay pointer-events-none absolute top-0 z-10 min-w-40 p-2.5 text-xs"
              style={{
                left: `${(positions.x(hovered) / WIDTH) * 100}%`,
                transform:
                  positions.x(hovered) > WIDTH / 2
                    ? 'translateX(calc(-100% - 12px))'
                    : 'translateX(12px)',
              }}
            >
              <p className="font-semibold">{formatDay(active.date)}</p>
              {SERIES.map((series) => (
                <p key={series.key} className="mt-1.5 flex items-center gap-1.5">
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

        {/* Légende toujours présente dès deux séries : l'identité ne doit
            jamais reposer sur la couleur seule. */}
        <div className="border-border mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
          <ul className="flex items-center gap-4">
            {SERIES.map((series) => (
              <li
                key={series.key}
                className="text-muted-foreground flex items-center gap-1.5 text-xs"
              >
                <span
                  className="size-2 rounded-full"
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
            className="focus-ring text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1.5 rounded-md text-xs font-medium transition-colors"
          >
            <Table2 className="size-3.5" aria-hidden />
            {showTable ? t.hideTable : t.showTable}
          </button>
        </div>

        {/* Jumeau tabulaire : aucune valeur n'est accessible uniquement au survol. */}
        {showTable && (
          <div id={tableId} className="mt-3 max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="text-muted-foreground bg-surface sticky top-0 text-left text-xs">
                <tr>
                  <th scope="col" className="py-1.5 font-medium">
                    {t.day}
                  </th>
                  <th scope="col" className="py-1.5 text-right font-medium">
                    {t.conversations}
                  </th>
                  <th scope="col" className="py-1.5 text-right font-medium">
                    {t.messages}
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...points].reverse().map((point) => (
                  <tr key={point.date} className="border-border border-t">
                    <td className="py-1.5">{formatDay(point.date)}</td>
                    <td className="py-1.5 text-right tabular-nums">{point.conversations}</td>
                    <td className="py-1.5 text-right tabular-nums">{point.messages}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Panel>
  );
}
