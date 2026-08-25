'use client';

import { useId, useMemo, useState } from 'react';
import { Table2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Segmented } from '@/components/ui/segmented';
import { Panel, PanelHeader } from '@/components/dashboard/panel';

/* Geometrie en unites du viewBox. La hauteur inclut la bande des libelles
   d'axe : un conteneur trop court les couperait. */
const WIDTH = 720;
const PLOT_HEIGHT = 170;
const AXIS_BAND = 26;
const HEIGHT = PLOT_HEIGHT + AXIS_BAND;
const PADDING = { top: 10, right: 44, bottom: AXIS_BAND, left: 36 };

export interface TrendSeries<T extends string> {
  key: T;
  label: string;
  /** Role de couleur du graphique, defini dans globals.css. */
  color: string;
}

type Range = '7' | '30' | '90';

/**
 * Courbe multi-series du back-office.
 *
 * Generique la ou ActivityChart ne l'est pas : celle du tableau de bord tire
 * ses libelles du dictionnaire client, ce qui la lie a deux series precises.
 * Celle-ci recoit ses series en parametre et sert donc a tout — activite,
 * croissance, sante des reponses — sans etre recopiee trois fois.
 *
 * Le back-office ne s'adresse qu'a l'equipe : les textes sont en francais, sans
 * passer par l'internationalisation.
 */
export function TrendChart<T extends string>({
  title,
  description,
  points,
  series,
  className,
}: {
  title: string;
  description?: string;
  /** Serie complete. La periode affichee se decoupe dedans. */
  points: (Record<T, number> & { date: string })[];
  series: TrendSeries<T>[];
  className?: string;
}) {
  const [range, setRange] = useState<Range>('30');
  const [hovered, setHovered] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const tableId = useId();
  const areaId = `trend${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const data = useMemo(() => points.slice(-Number(range)), [points, range]);

  const { max, positions, paths, area, totals } = useMemo(() => {
    const peak = data.reduce(
      (best, point) => Math.max(best, ...series.map((s) => point[s.key])),
      0,
    );

    /* Maximum arrondi sur le PAS, pas sur le sommet : partir du sommet
       donnerait des graduations a virgule, soit une demi-conversation. */
    const maxValue = (() => {
      if (peak <= 4) return 4;
      const rough = peak / 4;
      const magnitude = 10 ** Math.floor(Math.log10(rough));
      const step = [1, 2, 5, 10]
        .map((s) => s * magnitude)
        .find((candidate) => rough <= candidate);
      return Math.max(1, Math.round(step ?? 10 * magnitude)) * 4;
    })();

    const innerWidth = WIDTH - PADDING.left - PADDING.right;
    const innerHeight = PLOT_HEIGHT - PADDING.top;
    const step = data.length > 1 ? innerWidth / (data.length - 1) : 0;

    const x = (index: number) => PADDING.left + index * step;
    const y = (value: number) =>
      PADDING.top + innerHeight - (value / maxValue) * innerHeight;

    const built = Object.fromEntries(
      series.map((s) => [
        s.key,
        data
          .map((point, index) => `${index === 0 ? 'M' : 'L'}${x(index)},${y(point[s.key])}`)
          .join(' '),
      ]),
    ) as Record<T, string>;

    const first = series[0];

    return {
      max: maxValue,
      positions: { x, y, step },
      paths: built,
      /* Aire degradee sous la seule premiere serie : deux aires superposees se
         melangeraient et rendraient les deux illisibles. */
      area:
        first && data.length > 1
          ? `${built[first.key]} L${x(data.length - 1)},${PLOT_HEIGHT} L${x(0)},${PLOT_HEIGHT} Z`
          : '',
      totals: Object.fromEntries(
        series.map((s) => [s.key, data.reduce((sum, point) => sum + point[s.key], 0)]),
      ) as Record<T, number>,
    };
  }, [data, series]);

  const active = hovered !== null ? data[hovered] : undefined;
  const ticks = Array.from({ length: 5 }, (_, i) => (max / 4) * i);
  const dayTickEvery = Math.max(1, Math.ceil(data.length / 6));

  const formatDay = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });

  return (
    <Panel className={cn('viz-root flex flex-col', className)}>
      <PanelHeader
        title={title}
        description={description}
        action={
          <Segmented
            label="Période affichée"
            value={range}
            onChange={(next) => {
              setRange(next);
              // Le repere de survol designe un index : il ne veut plus rien
              // dire une fois la periode changee.
              setHovered(null);
            }}
            options={[
              { value: '7', label: '7 j' },
              { value: '30', label: '30 j' },
              { value: '90', label: '90 j' },
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
            setHovered(Math.min(data.length - 1, Math.max(0, index)));
          }}
        >
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full"
            role="img"
            aria-label={`${title} — ${data.length} jours`}
          >
            <defs>
              <linearGradient id={areaId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={series[0]?.color} stopOpacity={0.18} />
                <stop offset="100%" stopColor={series[0]?.color} stopOpacity={0} />
              </linearGradient>
            </defs>

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

            {data.map((point, index) =>
              index % dayTickEvery === 0 || index === data.length - 1 ? (
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

            {series.map((s) => (
              <path
                key={s.key}
                d={paths[s.key]}
                fill="none"
                stroke={s.color}
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {hovered !== null &&
              active &&
              series.map((s) => (
                <circle
                  key={s.key}
                  cx={positions.x(hovered)}
                  cy={positions.y(active[s.key])}
                  r={4}
                  fill={s.color}
                  stroke="var(--surface)"
                  strokeWidth={2}
                />
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
              {series.map((s) => (
                <p key={s.key} className="mt-1.5 flex items-center gap-1.5">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: s.color }}
                    aria-hidden
                  />
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="ml-auto font-semibold tabular-nums">{active[s.key]}</span>
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Legende toujours presente des deux series : l'identite ne doit
            jamais reposer sur la couleur seule. */}
        <div className="border-border mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
          <ul className="flex flex-wrap items-center gap-4">
            {series.map((s) => (
              <li key={s.key} className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: s.color }}
                  aria-hidden
                />
                {s.label}
                <span className="text-foreground font-semibold tabular-nums">
                  {totals[s.key].toLocaleString('fr-FR')}
                </span>
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
            {showTable ? 'Masquer le tableau' : 'Voir le tableau'}
          </button>
        </div>

        {/* Jumeau tabulaire : aucune valeur n'est accessible au seul survol. */}
        {showTable && (
          <div id={tableId} className="mt-3 max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="text-muted-foreground bg-surface sticky top-0 text-left text-xs">
                <tr>
                  <th scope="col" className="py-1.5 font-medium">Jour</th>
                  {series.map((s) => (
                    <th key={s.key} scope="col" className="py-1.5 text-right font-medium">
                      {s.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...data].reverse().map((point) => (
                  <tr key={point.date} className="border-border border-t">
                    <td className="py-1.5">{formatDay(point.date)}</td>
                    {series.map((s) => (
                      <td key={s.key} className="py-1.5 text-right tabular-nums">
                        {point[s.key]}
                      </td>
                    ))}
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
