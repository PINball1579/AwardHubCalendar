import { describe, it, expect } from "vitest";
import { propagateChange } from "@/lib/sync/propagate";
import { FakeGateway } from "@/lib/graph/fakeGateway";
import type { SubscriptionStore, SubRecord } from "@/lib/sync/subscriptionStore";
import type { EventModel } from "@/lib/graph/types";

class MemSubs implements SubscriptionStore {
  constructor(public records: SubRecord[]) {}
  async findBySourceEvent(id: string) {
    return this.records.filter((r) => r.sourceEventId === id && r.state !== "removed");
  }
  async setCopiedEvent(id: string, copiedEventId: string) {
    const r = this.records.find((x) => x.id === id)!;
    r.copiedEventId = copiedEventId;
  }
  async setState(id: string, state: SubRecord["state"]) {
    const r = this.records.find((x) => x.id === id)!;
    r.state = state;
  }
}

const model: EventModel = {
  sourceEventId: "SRC1",
  title: "Updated title",
  start: new Date("2026-06-14T00:00:00.000Z"),
  end: new Date("2026-06-15T00:00:00.000Z"),
  isAllDay: true,
  location: null,
  description: null,
  lastModified: new Date("2026-06-02T00:00:00.000Z"),
  status: "active",
};

describe("propagateChange", () => {
  it("updates existing copies when the source is active", async () => {
    const gw = new FakeGateway();
    const created = await gw.createUserEvent("user-1", {
      subject: "old", isAllDay: true,
      start: { dateTime: "2026-06-12T00:00:00.000", timeZone: "UTC" },
      end: { dateTime: "2026-06-13T00:00:00.000", timeZone: "UTC" },
    });
    const subs = new MemSubs([
      { id: "s1", userId: "user-1", userEmail: "u@x", sourceEventId: "SRC1", copiedEventId: created.id, state: "synced" },
    ]);
    await propagateChange(gw, subs, model);
    const stored = gw.userEvents.find((e) => e.id === created.id)!;
    expect(stored.payload.subject).toBe("Updated title");
    expect(stored.payload.start.dateTime).toBe("2026-06-14T00:00:00.000");
  });

  it("deletes copies and marks subs removed when source is cancelled", async () => {
    const gw = new FakeGateway();
    const created = await gw.createUserEvent("user-1", {
      subject: "old", isAllDay: true,
      start: { dateTime: "2026-06-12T00:00:00.000", timeZone: "UTC" },
      end: { dateTime: "2026-06-13T00:00:00.000", timeZone: "UTC" },
    });
    const subs = new MemSubs([
      { id: "s1", userId: "user-1", userEmail: "u@x", sourceEventId: "SRC1", copiedEventId: created.id, state: "synced" },
    ]);
    await propagateChange(gw, subs, { ...model, status: "cancelled" });
    expect(gw.userEvents.find((e) => e.id === created.id)).toBeUndefined();
    expect(subs.records[0].state).toBe("removed");
  });

  it("marks a sub failed when the gateway throws, without aborting others", async () => {
    const gw = new FakeGateway();
    const subs = new MemSubs([
      { id: "s1", userId: "user-1", userEmail: "u@x", sourceEventId: "SRC1", copiedEventId: "missing", state: "synced" },
      { id: "s2", userId: "user-2", userEmail: "v@x", sourceEventId: "SRC1", copiedEventId: null, state: "pending" },
    ]);
    await propagateChange(gw, subs, model);
    expect(subs.records[0].state).toBe("failed");
    expect(subs.records[1].state).toBe("synced");
    expect(subs.records[1].copiedEventId).toBeTruthy();
  });
});
