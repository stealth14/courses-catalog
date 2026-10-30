"use client";

import { useEffect, useId, useMemo, useState } from "react";

export type TimelineEvent = {
  id: string;
  date: string; // ISO date: YYYY-MM-DD
  title: string;
  subtitle?: string;
  description: string;
  details?: string;
  category?: string;
  magnitude?: number | null; // null/undefined = unknown, NOT zero
  color?: string;
};

export type TimelineConfig = {
  title: string;
  description?: string;
  events: TimelineEvent[];
  categoryColors?: Record<string, string>;
  magnitudeLabel?: string;
  minDotSize?: number;
  maxDotSize?: number;
  scaling?: 'area' | 'diameter';
  sort?: 'chronological' | 'input';
};

type Props = { config: TimelineConfig };

const CARD_WIDTH = 232;
const SLOT_WIDTH = 264;
const DEFAULT_COLOR = '#64748b';

/**
 * Category pill tinted with the event's own colour. The tint is derived from
 * the data colour while the label keeps the theme foreground, so custom
 * category colours stay readable in both light and dark mode.
 */
function CategoryChip({
  label,
  color,
  className = '',
}: {
  label: string;
  color: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-700 dark:text-zinc-200 ${className}`}
      style={{ backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)` }}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

export default function Timeline({ config }: Props) {
  const [selected, setSelected] = useState<TimelineEvent | null>(null);
  const modalTitleId = useId();

  const events = useMemo(() => {
    const items = [...(config.events ?? [])];
    if (config.sort !== 'input') items.sort((a, b) => a.date.localeCompare(b.date));
    return items;
  }, [config.events, config.sort]);

  const colorFor = (event: TimelineEvent) =>
    event.color ?? config.categoryColors?.[event.category ?? ''] ?? DEFAULT_COLOR;

  const magnitudeText = (event: TimelineEvent) =>
    event.magnitude == null
      ? 'Unknown magnitude'
      : `${config.magnitudeLabel ?? 'Magnitude'}: ${event.magnitude}`;

  const maxMagnitude = Math.max(0, ...events.map(e => typeof e.magnitude === 'number' && Number.isFinite(e.magnitude) ? Math.max(0, e.magnitude) : 0));
  const minSize = Math.max(8, config.minDotSize ?? 14);
  const maxSize = Math.max(minSize, config.maxDotSize ?? 68);
  const sizeFor = (magnitude?: number | null) => {
    if (magnitude == null || !Number.isFinite(magnitude)) return minSize;
    const ratio = maxMagnitude > 0 ? Math.max(0, magnitude) / maxMagnitude : 0;
    return config.scaling === 'diameter'
      ? minSize + ratio * (maxSize - minSize)
      : Math.sqrt(minSize ** 2 + ratio * (maxSize ** 2 - minSize ** 2));
  };

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected]);

  return (
    <section
      className="rounded-2xl border border-black/[.08] bg-white p-4 font-sans text-zinc-900 sm:p-6 dark:border-white/[.145] dark:bg-[#111] dark:text-zinc-50"
      aria-label={config.title}
    >
      <header className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight text-black sm:text-2xl dark:text-zinc-50">
          {config.title}
        </h2>
        {config.description && (
          <p className="mt-2 max-w-[780px] text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {config.description}
          </p>
        )}
      </header>

      <div
        className="styled-scrollbar overflow-x-auto overscroll-x-contain rounded-lg pb-4 pt-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        role="region"
        aria-label="Scrollable event timeline"
        tabIndex={0}
      >
        {events.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No events to display.</p>
        ) : (
          <div
            className="relative flex min-h-[415px] items-start"
            style={{ width: events.length * SLOT_WIDTH }}
          >
            <div
              className="absolute left-0 right-0 top-[326px] z-0 h-[2px] bg-linear-to-r from-black/[.12] via-black/[.2] to-black/[.32] dark:from-white/[.12] dark:via-white/[.24] dark:to-white/[.42]"
              aria-hidden="true"
            />
            {events.map(event => {
              const color = colorFor(event);
              const size = sizeFor(event.magnitude);
              return (
                <article
                  key={event.id}
                  className="relative flex shrink-0 flex-col items-center"
                  style={{ width: SLOT_WIDTH }}
                >
                  <div
                    className="flex h-[262px] flex-col rounded-xl border border-t-4 border-black/[.08] bg-zinc-50 p-4 shadow-sm dark:border-white/[.145] dark:bg-[#191b21] dark:shadow-none"
                    style={{ width: CARD_WIDTH, borderTopColor: color }}
                  >
                    <CategoryChip
                      label={event.category ?? 'Event'}
                      color={color}
                      className="self-start"
                    />
                    <h3
                      className="mt-2 line-clamp-2 text-[17px] font-semibold leading-tight text-black dark:text-zinc-50"
                      title={event.title}
                    >
                      {event.title}
                    </h3>
                    {event.subtitle && (
                      <p
                        className="mt-1 truncate text-xs text-zinc-600 dark:text-zinc-300"
                        title={event.subtitle}
                      >
                        {event.subtitle}
                      </p>
                    )}
                    <p className="mt-1 line-clamp-4 text-[13px] leading-5 text-zinc-600 dark:text-zinc-400">
                      {event.description}
                    </p>
                    <button
                      type="button"
                      className="mt-auto cursor-pointer self-start rounded-sm py-1.5 text-[13px] font-semibold text-primary-deep transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground dark:text-primary-soft"
                      onClick={() => setSelected(event)}
                      aria-label={`Read details for ${event.title}`}
                    >
                      View details →
                    </button>
                  </div>
                  <div
                    className="h-16 w-[2px] bg-black/[.16] dark:bg-white/[.22]"
                    aria-hidden="true"
                  />
                  <button
                    type="button"
                    className="absolute left-1/2 top-[327px] z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-2 border-black/[.15] ring-[5px] ring-white transition-[filter] hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:border-white/[.25] dark:ring-[#111]"
                    style={{ width: size, height: size, backgroundColor: color }}
                    onClick={() => setSelected(event)}
                    aria-label={`Open ${event.title}, ${event.date}`}
                    title={`${event.title}${event.magnitude == null ? ' · Magnitude unknown' : ` · ${config.magnitudeLabel ?? 'Magnitude'}: ${event.magnitude}`}`}
                  />
                  <time
                    className="mt-[37px] text-xs font-semibold text-zinc-800 dark:text-zinc-200"
                    dateTime={event.date}
                  >
                    {event.date}
                  </time>
                  <span className="mt-1.5 text-center text-[11px] text-zinc-500 dark:text-zinc-400">
                    {magnitudeText(event)}
                  </span>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[1000] grid place-items-center bg-zinc-950/55 p-4 dark:bg-black/70"
          onMouseDown={e => { if (e.target === e.currentTarget) setSelected(null); }}
        >
          <div
            className="relative max-h-[85vh] w-[min(100%,580px)] overflow-auto rounded-2xl border border-black/[.08] bg-white p-6 shadow-2xl sm:p-7 dark:border-white/[.145] dark:bg-[#111]"
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalTitleId}
          >
            <button
              type="button"
              className="absolute right-3 top-1.5 cursor-pointer rounded-full px-1.5 text-3xl leading-none text-zinc-500 transition-colors hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground dark:text-zinc-400 dark:hover:text-zinc-100"
              onClick={() => setSelected(null)}
              aria-label="Close details"
            >
              ×
            </button>
            <CategoryChip
              label={`${selected.category ?? 'Event'} · ${selected.date}`}
              color={colorFor(selected)}
            />
            <h2
              id={modalTitleId}
              className="mr-8 mt-3 text-2xl font-semibold tracking-tight text-black dark:text-zinc-50"
            >
              {selected.title}
            </h2>
            {selected.subtitle && (
              <h3 className="mt-1 text-sm font-medium text-zinc-600 dark:text-zinc-300">
                {selected.subtitle}
              </h3>
            )}
            <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-zinc-600 dark:text-zinc-400">
              {selected.description}
            </p>
            {selected.details && (
              <p className="mt-4 whitespace-pre-wrap border-t border-black/[.08] pt-4 text-[15px] leading-7 text-zinc-600 dark:border-white/[.145] dark:text-zinc-400">
                {selected.details}
              </p>
            )}
            <p className="mt-4 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              {selected.magnitude == null
                ? 'Magnitude: unknown'
                : `${config.magnitudeLabel ?? 'Magnitude'}: ${selected.magnitude}`}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
