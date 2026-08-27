"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { bookAppointment } from "./actions";

type Slot = {
  start: string;
  end: string;
};

/** Session length in minutes. */
const SESSION_MINUTES = 30;
/** Bookable window: 08:00 – 20:00 local time. */
const DAY_START_MINUTES = 8 * 60;
const DAY_END_MINUTES = 20 * 60;

function buildSlots(): Slot[] {
  const slots: Slot[] = [];
  for (
    let start = DAY_START_MINUTES;
    start + SESSION_MINUTES <= DAY_END_MINUTES;
    start += SESSION_MINUTES
  ) {
    const startLabel = `${pad(Math.floor(start / 60))}:${pad(start % 60)}`;
    const end = start + SESSION_MINUTES;
    const endLabel = `${pad(Math.floor(end / 60))}:${pad(end % 60)}`;
    slots.push({ start: startLabel, end: endLabel });
  }
  return slots;
}

const SLOTS: Slot[] = buildSlots();

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Monday-based start of the week. */
function startOfWeek(today: Date): Date {
  const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const offset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - offset);
  return date;
}

/** Deterministic dummy "booked" marker until availability comes from Strapi. */
function isBooked(dateKey: string, start: string): boolean {
  const value = `${dateKey}|${start}`;
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 9973;
  }
  return hash % 3 === 0;
}

export function AppointmentCalendar({ productSlug }: { productSlug: string }) {
  const t = useTranslations("AppointmentPage");
  const locale = useLocale();

  const now = new Date();
  const todayKey = toDateKey(now);

  const weekStart = startOfWeek(now);
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return date;
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const weekdayFormatter = new Intl.DateTimeFormat(locale, {
    weekday: "short",
  });
  const dayFormatter = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const longDayFormatter = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  function slotAvailable(dateKey: string, start: string): boolean {
    if (dateKey < todayKey) return false;
    if (dateKey === todayKey) {
      const [hours, minutes] = start.split(":").map(Number);
      const end = new Date();
      end.setHours(hours, minutes + SESSION_MINUTES, 0, 0);
      if (end <= now) return false;
    }
    return !isBooked(dateKey, start);
  }

  function selectDay(date: Date) {
    setSelectedDate(toDateKey(date));
    setSelectedSlot(null);
  }

  function capitalize(value: string): string {
    return value.charAt(0).toLocaleUpperCase(locale) + value.slice(1);
  }

  const ready = Boolean(selectedDate && selectedSlot);

  const confirmDetails =
    selectedDate && selectedSlot
      ? `${capitalize(
          longDayFormatter.format(new Date(`${selectedDate}T12:00:00`))
        )} · ${selectedSlot.start} – ${selectedSlot.end}`
      : null;

  return (
    <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)_auto_auto] gap-4 sm:flex sm:flex-col">
      <div className="flex shrink-0 flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {t("weekLabel")}
        </span>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((date) => {
            const key = toDateKey(date);
            const past = key < todayKey;
            const active = key === selectedDate;
            return (
              <button
                key={key}
                type="button"
                disabled={past}
                onClick={() => selectDay(date)}
                aria-label={dayFormatter.format(date)}
                className={`flex flex-col items-center rounded-xl border px-1 py-2 text-xs font-medium transition-colors ${
                  past
                    ? "cursor-not-allowed border-black/[.05] text-zinc-300 dark:border-white/[.06] dark:text-zinc-600"
                    : active
                      ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                      : "border-black/[.08] text-zinc-600 hover:border-black/[.2] dark:border-white/[.145] dark:text-zinc-300 dark:hover:border-white/[.3]"
                }`}
              >
                <span className="text-[10px] uppercase tracking-wide opacity-70">
                  {weekdayFormatter.format(date)}
                </span>
                <span>{pad(date.getDate())}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate ? (
        <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2 sm:flex sm:flex-col">
          <div className="flex shrink-0 items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {t("slotsTitle")}
            </span>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-500 dark:bg-white/[.08] dark:text-zinc-400">
              {t("slotDuration")}
            </span>
          </div>
          <div className="styled-scrollbar slot-fix grid min-h-0 flex-1 grid-cols-3 gap-1.5 overflow-y-auto overscroll-contain pr-1 sm:max-h-none sm:flex-none sm:grid-cols-4 sm:overflow-visible sm:pr-0">
            {SLOTS.map((slot) => {
              const available = slotAvailable(selectedDate, slot.start);
              const active = selectedSlot?.start === slot.start;
              return (
                <button
                  key={slot.start}
                  type="button"
                  disabled={!available}
                  onClick={() => setSelectedSlot(slot)}
                  aria-label={
                    available ? `${slot.start} – ${slot.end}` : t("unavailable")
                  }
                  title={
                    available ? `${slot.start} – ${slot.end}` : t("unavailable")
                  }
                  className={`rounded-lg border px-0 py-2.5 text-sm font-medium tabular-nums transition-colors sm:px-1.5 sm:py-2 sm:text-xs ${
                    !available
                      ? "cursor-not-allowed border-black/[.05] text-zinc-300 line-through dark:border-white/[.06] dark:text-zinc-600"
                      : active
                        ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                        : "border-black/[.08] text-zinc-600 hover:border-black/[.2] dark:border-white/[.145] dark:text-zinc-300 dark:hover:border-white/[.3]"
                  }`}
                >
                  {slot.start}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <form action={bookAppointment} className="flex shrink-0 flex-col gap-3">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="productSlug" value={productSlug} />
        {selectedDate ? (
          <input type="hidden" name="date" value={selectedDate} />
        ) : null}
        {selectedSlot ? (
          <>
            <input type="hidden" name="startTime" value={selectedSlot.start} />
            <input type="hidden" name="endTime" value={selectedSlot.end} />
          </>
        ) : null}
        <button
          type="submit"
          disabled={!ready}
          className={`flex h-16 w-full flex-col items-center justify-center gap-1 rounded-2xl px-5 transition-all active:scale-[0.98] ${
            ready
              ? "bg-foreground text-background shadow-md hover:bg-[#383838] hover:shadow-lg dark:hover:bg-[#ccc]"
              : "border border-dashed border-black/[.15] bg-black/[.02] text-foreground/45 dark:border-white/[.2] dark:bg-white/[.04] dark:text-white/45"
          }`}
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            {ready ? (
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            ) : (
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            )}
            {t("confirm")}
          </span>
          <span className="text-xs tabular-nums opacity-75">
            {ready
              ? confirmDetails
              : selectedDate
                ? t("confirmHintTime")
                : t("confirmHint")}
          </span>
        </button>
      </form>
    </div>
  );
}
