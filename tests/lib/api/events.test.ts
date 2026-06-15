import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { listActiveEvents } from "@/lib/api/events";

describe("listActiveEvents", () => {
  beforeEach(async () => {
    await prisma.subscription.deleteMany();
    await prisma.event.deleteMany();
    await prisma.event.createMany({
      data: [
        { sourceEventId: "A", title: "Active", start: new Date("2026-06-12"), end: new Date("2026-06-13"), isAllDay: true, lastModified: new Date(), status: "active" },
        { sourceEventId: "B", title: "Cancelled", start: new Date("2026-06-14"), end: new Date("2026-06-15"), isAllDay: true, lastModified: new Date(), status: "cancelled" },
      ],
    });
  });

  it("returns only active events", async () => {
    const events = await listActiveEvents();
    expect(events.map((e) => e.sourceEventId)).toEqual(["A"]);
  });
});
