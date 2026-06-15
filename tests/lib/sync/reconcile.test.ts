import { describe, it, expect } from "vitest";
import { reconcileDelta } from "@/lib/sync/reconcile";
import { FakeGateway } from "@/lib/graph/fakeGateway";
import type { EventStore } from "@/lib/sync/eventStore";
import type { EventModel } from "@/lib/graph/types";
import type { GraphEvent } from "@/lib/graph/types";

class MemStore implements EventStore {
  upserts: EventModel[] = [];
  cancels: string[] = [];
  async upsert(m: EventModel) { this.upserts.push(m); }
  async markCancelled(id: string) { this.cancels.push(id); }
}

function ev(id: string, removed = false): GraphEvent {
  const base: GraphEvent = {
    id,
    subject: `Event ${id}`,
    isAllDay: true,
    isCancelled: false,
    start: { dateTime: "2026-06-12T00:00:00.0000000", timeZone: "UTC" },
    end: { dateTime: "2026-06-13T00:00:00.0000000", timeZone: "UTC" },
    location: null,
    bodyPreview: null,
    lastModifiedDateTime: "2026-06-01T00:00:00Z",
  };
  return removed ? { ...base, "@removed": { reason: "deleted" } } : base;
}

describe("reconcileDelta", () => {
  it("upserts active events and returns the new deltaLink", async () => {
    const gw = new FakeGateway();
    gw.deltaQueue.push([ev("A"), ev("B")]);
    const store = new MemStore();
    const result = await reconcileDelta(gw, store, null);
    expect(store.upserts.map((m) => m.sourceEventId)).toEqual(["A", "B"]);
    expect(result.deltaLink).toMatch(/^delta-/);
    expect(result.changed).toEqual(["A", "B"]);
  });

  it("marks @removed events as cancelled", async () => {
    const gw = new FakeGateway();
    gw.deltaQueue.push([ev("A", true)]);
    const store = new MemStore();
    const result = await reconcileDelta(gw, store, "delta-prev");
    expect(store.cancels).toEqual(["A"]);
    expect(result.changed).toEqual(["A"]);
  });
});
