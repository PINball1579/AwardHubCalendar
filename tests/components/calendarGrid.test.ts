import { describe, it, expect } from "vitest";
import { buildMonthGrid, groupEventsByDay } from "@/components/calendarGrid";
import type { EventDto } from "@/lib/api/events";

describe("buildMonthGrid", () => {
  it("returns 42 cells (6 weeks) for June 2026", () => {
    const grid = buildMonthGrid(2026, 5); // month is 0-based: 5 = June
    expect(grid).toHaveLength(42);
    // June 1 2026 is a Monday; first cell is Sunday May 31.
    expect(grid[0].toISOString().slice(0, 10)).toBe("2026-05-31");
  });
});

describe("groupEventsByDay", () => {
  it("buckets events by YYYY-MM-DD of their start", () => {
    const events: EventDto[] = [
      { sourceEventId: "A", title: "x", start: "2026-06-12T00:00:00.000Z", end: "2026-06-13T00:00:00.000Z", isAllDay: true, location: null, description: null },
      { sourceEventId: "B", title: "y", start: "2026-06-12T00:00:00.000Z", end: "2026-06-12T00:00:00.000Z", isAllDay: true, location: null, description: null },
    ];
    const map = groupEventsByDay(events);
    expect(map["2026-06-12"].map((e) => e.sourceEventId)).toEqual(["A", "B"]);
  });
});
