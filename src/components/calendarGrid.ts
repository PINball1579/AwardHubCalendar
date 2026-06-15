import type { EventDto } from "@/lib/api/events";

/** Build a 6-week (42-cell) grid of UTC dates covering the given month. */
export function buildMonthGrid(year: number, month0: number): Date[] {
  const first = new Date(Date.UTC(year, month0, 1));
  const startDay = first.getUTCDay(); // 0 = Sunday
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

/** Group events by the YYYY-MM-DD of their start timestamp. */
export function groupEventsByDay(events: EventDto[]): Record<string, EventDto[]> {
  const map: Record<string, EventDto[]> = {};
  for (const e of events) {
    const key = e.start.slice(0, 10);
    (map[key] ??= []).push(e);
  }
  return map;
}
