import type {
  CalendarEvent,
  CategoryColor,
  MilestoneType,
} from "@/lib/mock/types";

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Milestone → chip color (Open for entry=teal, Fee increase=tan,
 *  Final Deadline=pink, Winner Announcement=cyan). */
export const MILESTONE_COLOR: Record<MilestoneType, CategoryColor> = {
  "Open for entry": "teal",
  "Fee increase": "tan",
  "Final Deadline": "pink",
  "Winner Announcement": "cyan",
};

/** Ordered milestones for the calendar legend. */
export const MILESTONE_LEGEND: MilestoneType[] = [
  "Open for entry",
  "Fee increase",
  "Final Deadline",
  "Winner Announcement",
];

/** Build a 6-week (42-cell) grid of UTC dates covering the given month. */
export function buildMonthGrid(year: number, month0: number): Date[] {
  const first = new Date(Date.UTC(year, month0, 1));
  const startDay = first.getUTCDay();
  const gridStart = new Date(first);
  gridStart.setUTCDate(first.getUTCDate() - startDay);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setUTCDate(gridStart.getUTCDate() + i);
    return d;
  });
}

/** Format a UTC date as a YYYY-MM-DD key. */
export function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** The current month (local time), used as the default calendar view. */
export function currentMonth(): { year: number; month0: number } {
  const now = new Date();
  return { year: now.getFullYear(), month0: now.getMonth() };
}

/** Today's YYYY-MM-DD key in the user's local timezone. */
export function localTodayKey(): string {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${m}-${d}`;
}

/** Group calendar events by their YYYY-MM-DD date. */
export function groupEventsByDay(
  events: CalendarEvent[],
): Record<string, CalendarEvent[]> {
  const map: Record<string, CalendarEvent[]> = {};
  for (const e of events) {
    (map[e.date] ??= []).push(e);
  }
  return map;
}

export function monthLabel(year: number, month0: number): string {
  return new Date(Date.UTC(year, month0, 1)).toLocaleString("en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Tailwind classes for a category chip color. */
export const CHIP_COLOR_CLASS: Record<CalendarEvent["color"], string> = {
  cyan: "bg-chip-cyan text-white",
  pink: "bg-chip-pink text-white",
  teal: "bg-chip-teal text-white",
  tan: "bg-chip-tan text-white",
};
