import { describe, it, expect } from "vitest";
import { graphEventToModel, isRemoved } from "@/lib/mappers";
import type { GraphEvent } from "@/lib/graph/types";

const base: GraphEvent = {
  id: "AAA",
  subject: "Cannes Lions Deadline",
  isAllDay: true,
  isCancelled: false,
  start: { dateTime: "2026-06-12T00:00:00.0000000", timeZone: "UTC" },
  end: { dateTime: "2026-06-13T00:00:00.0000000", timeZone: "UTC" },
  location: { displayName: "Cannes" },
  bodyPreview: "Submit entries",
  lastModifiedDateTime: "2026-06-01T10:00:00Z",
};

describe("graphEventToModel", () => {
  it("maps fields and parses dates", () => {
    const m = graphEventToModel(base);
    expect(m.sourceEventId).toBe("AAA");
    expect(m.title).toBe("Cannes Lions Deadline");
    expect(m.isAllDay).toBe(true);
    expect(m.location).toBe("Cannes");
    expect(m.description).toBe("Submit entries");
    expect(m.status).toBe("active");
    expect(m.start.toISOString()).toBe("2026-06-12T00:00:00.000Z");
  });

  it("falls back to '(untitled)' when subject is missing", () => {
    const m = graphEventToModel({ ...base, subject: null });
    expect(m.title).toBe("(untitled)");
  });

  it("marks cancelled events", () => {
    const m = graphEventToModel({ ...base, isCancelled: true });
    expect(m.status).toBe("cancelled");
  });
});

describe("isRemoved", () => {
  it("detects @removed deltas", () => {
    expect(isRemoved({ ...base, "@removed": { reason: "deleted" } })).toBe(true);
    expect(isRemoved(base)).toBe(false);
  });
});
