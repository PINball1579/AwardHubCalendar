import { describe, it, expect } from "vitest";
import { modelToGraphPayload } from "@/lib/mappers";
import type { EventModel } from "@/lib/graph/types";

const model: EventModel = {
  sourceEventId: "AAA",
  title: "Cannes Lions Deadline",
  start: new Date("2026-06-12T00:00:00.000Z"),
  end: new Date("2026-06-13T00:00:00.000Z"),
  isAllDay: true,
  location: "Cannes",
  description: "Submit entries",
  lastModified: new Date("2026-06-01T10:00:00.000Z"),
  status: "active",
};

describe("modelToGraphPayload", () => {
  it("builds a Graph event create/update body", () => {
    const body = modelToGraphPayload(model);
    expect(body.subject).toBe("Cannes Lions Deadline");
    expect(body.isAllDay).toBe(true);
    expect(body.start).toEqual({ dateTime: "2026-06-12T00:00:00.000", timeZone: "UTC" });
    expect(body.end).toEqual({ dateTime: "2026-06-13T00:00:00.000", timeZone: "UTC" });
    expect(body.location).toEqual({ displayName: "Cannes" });
    expect(body.body).toEqual({ contentType: "text", content: "Submit entries" });
  });

  it("omits location and body when absent", () => {
    const body = modelToGraphPayload({ ...model, location: null, description: null });
    expect(body.location).toBeUndefined();
    expect(body.body).toBeUndefined();
  });
});
