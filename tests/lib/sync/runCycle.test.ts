import { describe, it, expect } from "vitest";
import { runSyncCycleWith } from "@/lib/sync/runCycle";
import { FakeGateway } from "@/lib/graph/fakeGateway";
import type { EventStore } from "@/lib/sync/eventStore";
import type { SubscriptionStore, SubRecord } from "@/lib/sync/subscriptionStore";
import type { EventModel, GraphEvent } from "@/lib/graph/types";

class MemEventStore implements EventStore {
  models = new Map<string, EventModel>();
  async upsert(m: EventModel) { this.models.set(m.sourceEventId, { ...m }); }
  async markCancelled(id: string) {
    const m = this.models.get(id); if (m) m.status = "cancelled";
  }
}
class MemSubs implements SubscriptionStore {
  constructor(public records: SubRecord[]) {}
  async findBySourceEvent(id: string) { return this.records.filter((r) => r.sourceEventId === id && r.state !== "removed"); }
  async setCopiedEvent(id: string, c: string) { this.records.find((r) => r.id === id)!.copiedEventId = c; }
  async setState(id: string, s: SubRecord["state"]) { this.records.find((r) => r.id === id)!.state = s; }
}

function ev(id: string): GraphEvent {
  return {
    id, subject: `New ${id}`, isAllDay: true, isCancelled: false,
    start: { dateTime: "2026-06-20T00:00:00.0000000", timeZone: "UTC" },
    end: { dateTime: "2026-06-21T00:00:00.0000000", timeZone: "UTC" },
    location: null, bodyPreview: null, lastModifiedDateTime: "2026-06-02T00:00:00Z",
  };
}

describe("runSyncCycleWith", () => {
  it("reconciles changed events and propagates them to subscribers", async () => {
    const gw = new FakeGateway();
    gw.deltaQueue.push([ev("SRC1")]);
    const eventStore = new MemEventStore();
    const subs = new MemSubs([
      { id: "s1", userId: "u1", userEmail: "u@x", sourceEventId: "SRC1", copiedEventId: null, state: "pending" },
    ]);
    let savedDelta = "";
    await runSyncCycleWith({
      gateway: gw,
      eventStore,
      subs,
      getDeltaLink: async () => null,
      saveDeltaLink: async (d) => { savedDelta = d; },
    });
    expect(subs.records[0].state).toBe("synced");
    expect(subs.records[0].copiedEventId).toBeTruthy();
    expect(gw.userEvents[0].payload.subject).toBe("New SRC1");
    expect(savedDelta).toMatch(/^delta-/);
  });

  it("on a removed event, cancels locally and deletes user copies", async () => {
    const gw = new FakeGateway();
    const created = await gw.createUserEvent("u1", {
      subject: "old", isAllDay: true,
      start: { dateTime: "2026-06-20T00:00:00.000", timeZone: "UTC" },
      end: { dateTime: "2026-06-21T00:00:00.000", timeZone: "UTC" },
    });
    gw.deltaQueue.push([{ ...ev("SRC1"), "@removed": { reason: "deleted" } }]);
    const eventStore = new MemEventStore();
    await eventStore.upsert({ sourceEventId: "SRC1", title: "x", start: new Date(), end: new Date(), isAllDay: true, location: null, description: null, lastModified: new Date(), status: "active" });
    const subs = new MemSubs([
      { id: "s1", userId: "u1", userEmail: "u@x", sourceEventId: "SRC1", copiedEventId: created.id, state: "synced" },
    ]);
    await runSyncCycleWith({
      gateway: gw, eventStore, subs,
      getDeltaLink: async () => null,
      saveDeltaLink: async () => {},
    });
    expect(eventStore.models.get("SRC1")!.status).toBe("cancelled");
    expect(gw.userEvents.find((e) => e.id === created.id)).toBeUndefined();
    expect(subs.records[0].state).toBe("removed");
  });
});
