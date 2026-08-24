'use client';

import { useRef } from 'react';

import { cn } from '@/lib/utils';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

/**
 * Selecteur a segments — une valeur parmi trois ou quatre, toutes visibles.
 *
 * Semantique de groupe de boutons radio plutot que de simples boutons : c'est
 * un choix exclusif, pas une serie d'actions. Le focus est roulant (un seul
 * segment dans l'ordre de tabulation, les fleches circulent a l'interieur),
 * comme l'attend un groupe radio.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Ce que le groupe permet de choisir. */
  label: string;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  const move = (offset: number) => {
    const index = options.findIndex((option) => option.value === value);
    const next = options[(index + offset + options.length) % options.length];
    if (!next) return;

    onChange(next.value);
    // Le focus suit la selection : sans cela, les fleches deplacent la valeur
    // mais laissent le repere visuel sur l'ancien segment.
    rootRef.current
      ?.querySelectorAll<HTMLElement>('[role="radio"]')
      [options.indexOf(next)]?.focus();
  };

  return (
    <div
      ref={rootRef}
      role="radiogroup"
      aria-label={label}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          event.preventDefault();
          move(1);
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          event.preventDefault();
          move(-1);
        }
      }}
      className={cn(
        'bg-surface-subtle border-border inline-flex items-center gap-0.5 rounded-lg border p-0.5',
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              'focus-ring cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              selected
                ? 'bg-surface text-foreground border-border border shadow-[var(--elevation-flat)]'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
