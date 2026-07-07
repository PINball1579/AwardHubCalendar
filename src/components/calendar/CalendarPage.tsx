"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  buildMonthGrid,
  dayKey,
  groupEventsByDay,
  localTodayKey,
  monthLabel,
  CHIP_COLOR_CLASS,
  WEEKDAYS,
} from "@/lib/calendar/grid";
import { MOCK_CALENDAR_EVENTS, DEMO_DEFAULT_MONTH } from "@/lib/mock/calendarEvents";
import type { CalendarEvent, CategoryColor } from "@/lib/mock/types";

interface EventDto {
  sourceEventId: string;
  title: string;
  start: string;
  location: string | null;
}

const CHIP_CYCLE: CategoryColor[] = ["cyan", "pink", "teal", "tan"];

function mapLiveEvents(rows: EventDto[]): CalendarEvent[] {
  return rows.map((r, i) => ({
    id: r.sourceEventId,
    title: r.title,
    date: r.start.slice(0, 10),
    category: "Live",
    color: CHIP_CYCLE[i % CHIP_CYCLE.length],
  }));
}

export function CalendarPage() {
  const { data: session } = useSession();
  const [live, setLive] = useState<CalendarEvent[] | null>(null);
  const [addableIds, setAddableIds] = useState<Set<string>>(new Set());
  const [year, setYear] = useState(DEMO_DEFAULT_MONTH.year);
  const [month0, setMonth0] = useState(DEMO_DEFAULT_MONTH.month0);
  const [selected, setSelected] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  // set after mount so the server and client render the same HTML
  const [todayKey, setTodayKey] = useState<string | null>(null);

  useEffect(() => {
    setTodayKey(localTodayKey());
  }, []);

  useEffect(() => {
    if (!session) return;
    fetch("/api/events")
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped = mapLiveEvents(res.data as EventDto[]);
          setLive(mapped);
          setAddableIds(new Set(mapped.map((e) => e.id)));
          const now = new Date();
          setYear(now.getUTCFullYear());
          setMonth0(now.getUTCMonth());
        }
      })
      .catch(() => undefined);
  }, [session]);

  const events = live ?? MOCK_CALENDAR_EVENTS;
  const byDay = useMemo(() => groupEventsByDay(events), [events]);
  const grid = buildMonthGrid(year, month0);
  const selectedEvents = selected ? byDay[selected] ?? [] : [];

  const monthTabs = Array.from({ length: 4 }, (_, i) => {
    const d = new Date(Date.UTC(year, month0 + i, 1));
    return { year: d.getUTCFullYear(), month0: d.getUTCMonth() };
  });

  const shift = (delta: number) => {
    const d = new Date(Date.UTC(year, month0 + delta, 1));
    setYear(d.getUTCFullYear());
    setMonth0(d.getUTCMonth());
    setSelected(null);
  };

  async function addToCalendar(sourceEventId: string) {
    setAdding(sourceEventId);
    setMessage(null);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceEventId }),
      });
      const json = await res.json();
      setMessage(json.success ? "Added to your calendar." : `Error: ${json.error}`);
    } catch {
      setMessage("Network error adding event.");
    } finally {
      setAdding(null);
    }
  }

  return (
    <div className="cave-container py-10">
      <h1 className="font-medium uppercase leading-normal text-white text-[34px] sm:text-[60px]">
        Awards Calendar
      </h1>
      <p className="mt-3 max-w-6xl font-medium leading-normal text-white text-[16px] sm:text-[24px]">
        Track international prestige, entry deadlines, and eligibility windows
        with our real-time synchronization engine.
      </p>

      {/* filter + month tabs */}
      <div className="mt-7 flex flex-wrap items-center gap-3">
        {/* Figma: square black button with gold border */}
        <span className="inline-flex items-center gap-2 rounded-[4px] border border-cave-gold bg-black px-4 py-2 font-medium uppercase leading-normal text-white text-[12px] sm:text-[13px]">
          All Category
          <span aria-hidden="true" className="text-cave-gold">
            ⌄
          </span>
        </span>
        <div className="flex items-center gap-1 text-sm">
          <button onClick={() => shift(-1)} aria-label="Previous month" className="px-2 text-muted hover:text-cave-gold">
            ‹
          </button>
          {monthTabs.map((t) => {
            const active = t.year === year && t.month0 === month0;
            return (
              <button
                key={`${t.year}-${t.month0}`}
                onClick={() => {
                  setYear(t.year);
                  setMonth0(t.month0);
                  setSelected(null);
                }}
                className={`px-3 py-1 font-normal uppercase leading-normal text-[12px] sm:text-[14px] transition-colors ${
                  active ? "text-white" : "text-muted hover:text-zinc-200"
                }`}
              >
                {monthLabel(t.year, t.month0)}
              </button>
            );
          })}
          <button onClick={() => shift(4)} aria-label="Next months" className="px-2 text-muted hover:text-cave-gold">
            ›
          </button>
        </div>
      </div>

      {!session && (
        <p className="mt-4 text-xs text-muted-dim">
          Showing sample deadlines. Sign in to view live events from the awards
          mailbox and add them to your Outlook calendar.
        </p>
      )}

      {/* month grid (horizontal scroll on small screens) */}
      <div className="mt-5 -mx-6 overflow-x-auto px-6 sm:mx-0 sm:px-0">
        {/* Figma: gold grid lines, square corners, cells taller than wide */}
        <div className="grid min-w-[680px] grid-cols-7 border-l border-t border-cave-golddim">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="border-b border-r border-cave-golddim px-3 py-2 font-medium uppercase leading-normal text-white text-[13px] sm:text-[14px]"
            >
              {w}
            </div>
          ))}
          {grid.map((d) => {
            const key = dayKey(d);
            const dayEvents = byDay[key] ?? [];
            const inMonth = d.getUTCMonth() === month0;
            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={`min-h-[120px] border-b border-r border-cave-golddim p-2 text-left align-top transition-colors hover:bg-ink-900/60 sm:min-h-[140px] ${
                  selected === key ? "ring-1 ring-inset ring-cave-gold/60" : ""
                }`}
              >
                {/* gold circle marks today */}
                <div
                  className={`inline-flex h-7 w-7 items-center justify-center font-medium leading-normal text-[13px] sm:text-[14px] ${
                    key === todayKey
                      ? "rounded-full bg-cave-gold text-ink-950"
                      : inMonth
                        ? "text-white"
                        : "text-cave-golddim"
                  }`}
                >
                  {String(d.getUTCDate()).padStart(2, "0")}
                </div>
                <div className="mt-1 space-y-1">
                  {dayEvents.map((e) => (
                    <div
                      key={e.id}
                      className={`truncate rounded-sm px-1.5 py-1 text-center font-normal leading-normal text-[12px] ${CHIP_COLOR_CLASS[e.color]}`}
                    >
                      {e.title}
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* day detail */}
      {selected && (
        <div className="mt-6 rounded-md border border-ink-800 bg-ink-900 p-5">
          <h3 className="font-medium leading-normal text-white text-[18px]">{selected}</h3>
          {selectedEvents.length === 0 && (
            <p className="mt-2 text-sm text-muted">No events.</p>
          )}
          <ul className="mt-3 space-y-3">
            {selectedEvents.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between border-b border-ink-800 pb-3"
              >
                <span className="text-sm text-zinc-100">{e.title}</span>
                {addableIds.has(e.id) && (
                  <button
                    disabled={adding === e.id}
                    onClick={() => addToCalendar(e.id)}
                    className="gradient-pill text-xs disabled:opacity-50"
                  >
                    {adding === e.id ? "Adding…" : "Add to my calendar"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {message && <p className="mt-4 text-sm text-cave-gold">{message}</p>}
    </div>
  );
}
