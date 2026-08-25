"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { bookAppointment } from "./actions";

type Slot = {
  start: string;
  end: string;
};

const SLOTS: Slot[] = [
  { start: "08:00", end: "10:00" },
  { start: "10:00", end: "12:00" },
  { start: "12:00", end: "14:00" },
  { start: "14:00", end: "16:00" },
  { start: "16:00", end: "18:00" },
  { start: "18:00", end: "20:00" },
];

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

export function AppointmentCalendar({ purchaseId }: { purchaseId: number }) {
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

  function slotAvailable(dateKey: string, start: string): boolean {
    if (dateKey < todayKey) return false;
    if (dateKey === todayKey) {
      const [hours, minutes] = start.split(":").map(Number);
      const end = new Date();
      end.setHours(hours + 2, minutes, 0, 0);
      if (end <= now) return false;
    }
    return !isBooked(dateKey, start);
  }

  function selectDay(date: Date) {
    setSelectedDate(toDateKey(date));
    setSelectedSlot(null);
  }

  const selectedTime =
    selectedDate && selectedSlot
      ? t("selected", {
          date: dayFormatter.format(new Date(`${selectedDate}T12:00:00`)),
          start: selectedSlot.start,
          end: selectedSlot.end,
        })
      : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
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
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {t("slotsTitle")}
          </span>
          <div className="grid grid-cols-2 gap-2">
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
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                    !available
                      ? "cursor-not-allowed border-black/[.05] text-zinc-300 line-through dark:border-white/[.06] dark:text-zinc-600"
                      : active
                        ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                        : "border-black/[.08] text-zinc-600 hover:border-black/[.2] dark:border-white/[.145] dark:text-zinc-300 dark:hover:border-white/[.3]"
                  }`}
                >
                  {slot.start} – {slot.end}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <form action={bookAppointment} className="flex flex-col gap-3">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="purchaseId" value={purchaseId} />
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
          disabled={!selectedDate || !selectedSlot}
          className="flex h-12 w-full items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-[#ccc]"
        >
          {t("confirm")}
        </button>
      </form>

      {selectedTime ? (
        <p className="text-center text-xs leading-5 text-zinc-500 dark:text-zinc-400">
          {selectedTime}
        </p>
      ) : null}
    </div>
  );
}
