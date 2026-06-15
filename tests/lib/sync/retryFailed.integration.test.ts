import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { retryFailedWith } from "@/lib/sync/retryFailed";
import { PrismaSubscriptionStore } from "@/lib/sync/prismaSubscriptionStore";
import { FakeGateway } from "@/lib/graph/fakeGateway";
import type { EventModel } from "@/lib/graph/types";

describe("retryFailedWith (integration with prisma store)", () => {
  beforeEach(async () => {
    await prisma.subscription.deleteMany();
    await prisma.event.deleteMany();
    await prisma.event.create({ data: { sourceEventId: "SRC1", title: "x", start: new Date("2026-06-12T00:00:00Z"), end: new Date("2026-06-13T00:00:00Z"), isAllDay: true, lastModified: new Date(), status: "active" } });
    await prisma.subscription.create({ data: { userId: "u1", userEmail: "u@x", sourceEventId: "SRC1", state: "failed", copiedEventId: null } });
  });

  it("flips a failed prisma subscription to synced after a successful retry", async () => {
    const gw = new FakeGateway();
    const store = new PrismaSubscriptionStore();
    await retryFailedWith({
      gateway: gw,
      subs: store,
      listFailedSourceEventIds: async () => {
        const rows = await prisma.subscription.findMany({ where: { state: "failed" }, distinct: ["sourceEventId"], select: { sourceEventId: true } });
        return rows.map((r) => r.sourceEventId);
      },
      loadEventModel: async (id): Promise<EventModel | null> => {
        const e = await prisma.event.findUnique({ where: { sourceEventId: id } });
        if (!e) return null;
        return { sourceEventId: e.sourceEventId, title: e.title, start: e.start, end: e.end, isAllDay: e.isAllDay, location: e.location, description: e.description, lastModified: e.lastModified, status: e.status === "cancelled" ? "cancelled" : "active" };
      },
    });
    const row = await prisma.subscription.findFirst({ where: { userId: "u1", sourceEventId: "SRC1" } });
    expect(row?.state).toBe("synced");
    expect(row?.copiedEventId).toBeTruthy();
    expect(gw.userEvents).toHaveLength(1);
  });
});
