import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { PrismaEventStore } from "@/lib/sync/prismaEventStore";
import type { EventModel } from "@/lib/graph/types";

const model: EventModel = {
  sourceEventId: "SRC1",
  title: "Deadline",
  start: new Date("2026-06-12T00:00:00.000Z"),
  end: new Date("2026-06-13T00:00:00.000Z"),
  isAllDay: true,
  location: null,
  description: null,
  lastModified: new Date("2026-06-01T00:00:00.000Z"),
  status: "active",
};

describe("PrismaEventStore", () => {
  beforeEach(async () => {
    await prisma.subscription.deleteMany();
    await prisma.event.deleteMany();
  });

  it("upserts a new event then updates it", async () => {
    const store = new PrismaEventStore();
    await store.upsert(model);
    await store.upsert({ ...model, title: "Deadline (updated)" });
    const row = await prisma.event.findUnique({ where: { sourceEventId: "SRC1" } });
    expect(row?.title).toBe("Deadline (updated)");
  });

  it("marks an event cancelled", async () => {
    const store = new PrismaEventStore();
    await store.upsert(model);
    await store.markCancelled("SRC1");
    const row = await prisma.event.findUnique({ where: { sourceEventId: "SRC1" } });
    expect(row?.status).toBe("cancelled");
  });
});
