import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { addToMyCalendar } from "@/lib/api/addToCalendar";
import { FakeGateway } from "@/lib/graph/fakeGateway";

beforeEach(async () => {
  await prisma.subscription.deleteMany();
  await prisma.event.deleteMany();
  await prisma.event.create({
    data: { sourceEventId: "A", title: "Deadline", start: new Date("2026-06-12T00:00:00Z"), end: new Date("2026-06-13T00:00:00Z"), isAllDay: true, lastModified: new Date(), status: "active" },
  });
});

describe("addToMyCalendar", () => {
  it("creates a copy and records a synced subscription", async () => {
    const gw = new FakeGateway();
    const result = await addToMyCalendar(gw, { userId: "u1", userEmail: "u@x", sourceEventId: "A" });
    expect(result.state).toBe("synced");
    expect(gw.userEvents).toHaveLength(1);
    const sub = await prisma.subscription.findFirst({ where: { userId: "u1", sourceEventId: "A" } });
    expect(sub?.copiedEventId).toBe(gw.userEvents[0].id);
  });

  it("is idempotent — adding twice does not create a second copy", async () => {
    const gw = new FakeGateway();
    await addToMyCalendar(gw, { userId: "u1", userEmail: "u@x", sourceEventId: "A" });
    await addToMyCalendar(gw, { userId: "u1", userEmail: "u@x", sourceEventId: "A" });
    expect(gw.userEvents).toHaveLength(1);
    const count = await prisma.subscription.count({ where: { userId: "u1", sourceEventId: "A" } });
    expect(count).toBe(1);
  });

  it("rejects unknown or cancelled source events", async () => {
    const gw = new FakeGateway();
    await expect(
      addToMyCalendar(gw, { userId: "u1", userEmail: "u@x", sourceEventId: "missing" }),
    ).rejects.toThrow(/not found/i);
  });
});
