import { describe, it, expect } from "vitest";
import { retryFailedWith } from "@/lib/sync/retryFailed";
import { FakeGateway } from "@/lib/graph/fakeGateway";
import type { SubscriptionStore, SubRecord } from "@/lib/sync/subscriptionStore";
import type { EventModel } from "@/lib/graph/types";

class MemSubs implements SubscriptionStore {
  constructor(public records: SubRecord[]) {}
  async findBySourceEvent(id: string) { return this.records.filter((r) => r.sourceEventId === id && r.state !== "removed"); }
  async setCopiedEvent(id: string, c: string) { this.records.find((r) => r.id === id)!.copiedEventId = c; }
  async setState(id: string, s: SubRecord["state"]) { this.records.find((r) => r.id === id)!.state = s; }
}

const model = (id: string): EventModel => ({
  sourceEventId: id, title: "x",
  start: new Date("2026-06-12T00:00:00.000Z"), end: new Date("2026-06-13T00:00:00.000Z"),
  isAllDay: true, location: null, description: null,
  lastModified: new Date("2026-06-01T00:00:00.000Z"), status: "active",
});

describe("retryFailedWith", () => {
  it("retries failed subs by re-propagating their source event, flipping them to synced", async () => {
    const gw = new FakeGateway();
    const subs = new MemSubs([
      { id: "s1", userId: "u1", userEmail: "u@x", sourceEventId: "SRC1", copiedEventId: null, state: "failed" },
    ]);
    await retryFailedWith({
      gateway: gw,
      subs,
      listFailedSourceEventIds: async () => ["SRC1"],
      loadEventModel: async (id) => model(id),
    });
    expect(subs.records[0].state).toBe("synced");
    expect(subs.records[0].copiedEventId).toBeTruthy();
    expect(gw.userEvents).toHaveLength(1);
  });

  it("skips source events that no longer exist", async () => {
    const gw = new FakeGateway();
    const subs = new MemSubs([
      { id: "s1", userId: "u1", userEmail: "u@x", sourceEventId: "GONE", copiedEventId: null, state: "failed" },
    ]);
    await retryFailedWith({
      gateway: gw,
      subs,
      listFailedSourceEventIds: async () => ["GONE"],
      loadEventModel: async () => null,
    });
    // No event to propagate -> sub remains failed, no calendar writes.
    expect(subs.records[0].state).toBe("failed");
    expect(gw.userEvents).toHaveLength(0);
  });
});
