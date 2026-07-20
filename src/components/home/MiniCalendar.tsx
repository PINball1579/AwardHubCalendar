"use client";

import { useEffect, useState } from "react";
import {
  buildMonthGrid,
  currentMonth,
  dayKey,
  groupEventsByDay,
  localTodayKey,
  monthLabel,
  CHIP_COLOR_CLASS,
} from "@/lib/calendar/grid";
import { MOCK_CALENDAR_EVENTS } from "@/lib/mock/calendarEvents";

const WEEKDAY_INITIALS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function MiniCalendar() {
  // Default to the current month (today). Resolved after mount so the SSG
  // HTML and the first client render match (no hydration mismatch).
  const [view, setView] = useState<{ year: number; month0: number } | null>(
    null,
  );
  const [todayKey, setTodayKey] = useState<string | null>(null);

  useEffect(() => {
    setView(currentMonth());
    setTodayKey(localTodayKey());
  }, []);

  const year = view?.year ?? currentMonth().year;
  const month0 = view?.month0 ?? currentMonth().month0;
  const grid = buildMonthGrid(year, month0);
  const byDay = groupEventsByDay(MOCK_CALENDAR_EVENTS);

  const shift = (delta: number) => {
    const d = new Date(Date.UTC(year, month0 + delta, 1));
    setView({ year: d.getUTCFullYear(), month0: d.getUTCMonth() });
  };

  // placeholder before mount keeps SSR and first client render identical
  if (!view) {
    return (
      <div className="rounded-lg border border-cave-golddim/70 bg-ink-900/60 p-4">
        <div className="mb-3 h-8" />
        <div className="h-[406px] rounded border border-cave-golddim/70" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-cave-golddim/70 bg-ink-900/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium leading-normal text-white text-[20px] sm:text-[24px]">
          Awards Calendar
        </h3>
        <div className="flex items-center gap-3 text-muted">
          <button onClick={() => shift(-1)} aria-label="Previous month" className="hover:text-cave-gold">
            ‹
          </button>
          <span className="w-24 text-center font-medium text-white text-[14px] sm:text-[16px]">
            {monthLabel(year, month0)}
          </span>
          <button onClick={() => shift(1)} aria-label="Next month" className="hover:text-cave-gold">
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 overflow-hidden rounded border border-cave-golddim/70 text-left">
        {WEEKDAY_INITIALS.map((w) => (
          <div
            key={w}
            className="border-b border-r border-cave-golddim/70 px-1.5 py-1.5 font-medium leading-normal text-white text-[12px] sm:text-[14px]"
          >
            {w}
          </div>
        ))}
        {grid.map((d) => {
          const key = dayKey(d);
          const dayEvents = byDay[key] ?? [];
          const inMonth = d.getUTCMonth() === month0;
          return (
            <div
              key={key}
              className="min-h-[58px] border-b border-r border-cave-golddim/70 p-1 text-left"
            >
              {/* gold circle marks today */}
              <div
                className={`inline-flex h-6 w-6 items-center justify-center font-medium leading-normal text-[12px] sm:text-[14px] ${
                  key === todayKey
                    ? "rounded-full bg-cave-gold text-ink-950"
                    : inMonth
                      ? "text-white"
                      : "text-cave-golddim"
                }`}
              >
                {String(d.getUTCDate()).padStart(2, "0")}
              </div>
              {dayEvents.map((e) => (
                <div
                  key={e.id}
                  className={`mt-0.5 truncate rounded-sm px-1 py-0.5 text-center font-normal leading-normal text-[11px] sm:text-[12px] ${CHIP_COLOR_CLASS[e.color]}`}
                >
                  {e.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
