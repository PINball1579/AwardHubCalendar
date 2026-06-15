import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { PrismaSubscriptionStore } from "@/lib/sync/prismaSubscriptionStore";
import { PrismaEventStore } from "@/lib/sync/prismaEventStore";
import type { EventModel } from "@/lib/graph/types";

const model: EventModel = {
  sourceEventId: "SRC1", title: "x",
  start: new Date("2026-06-12T00:00:00.000Z"),
  end: new Date("2026-06-13T00:00:00.000Z"),
  isAllDay: true, location: null, description: null,
  lastModified: new Date("2026-06-01T00:00:00.000Z"), status: "active",
};

describe("PrismaSubscriptionStore", () => {
  beforeEach(async () => {
    await prisma.subscription.deleteMany();
    await prisma.event.deleteMany();
    await new PrismaEventStore().upsert(model);
  });

  it("finds subs by source event and updates state + copied id", async () => {
    await prisma.subscription.create({
      data: { userId: "u1", userEmail: "u@x", sourceEventId: "SRC1", state: "pending" },
    });
    const store = new PrismaSubscriptionStore();
    const found = await store.findBySourceEvent("SRC1");
    expect(found).toHaveLength(1);
    await store.setCopiedEvent(found[0].id, "copy-1");
    await store.setState(found[0].id, "synced");
    const row = await prisma.subscription.findUnique({ where: { id: found[0].id } });
    expect(row?.copiedEventId).toBe("copy-1");
    expect(row?.state).toBe("synced");
  });

  it("excludes removed subscriptions from findBySourceEvent", async () => {
    await prisma.subscription.create({
      data: { userId: "u2", userEmail: "v@x", sourceEventId: "SRC1", state: "removed" },
    });
    const store = new PrismaSubscriptionStore();
    const found = await store.findBySourceEvent("SRC1");
    expect(found).toHaveLength(0);
  });
});
