import type { CalendarGateway } from "@/lib/graph/gateway";
import type { EventStore } from "@/lib/sync/eventStore";
import type { SubscriptionStore } from "@/lib/sync/subscriptionStore";
import { propagateChange } from "@/lib/sync/propagate";
import { graphEventToModel } from "@/lib/mappers";

export interface SyncDeps {
  gateway: CalendarGateway;
  eventStore: EventStore;
  subs: SubscriptionStore;
  getDeltaLink: () => Promise<string | null>;
  saveDeltaLink: (deltaLink: string) => Promise<void>;
}

export async function runSyncCycleWith(deps: SyncDeps): Promise<void> {
  const previous = await deps.getDeltaLink();
  const { events, deltaLink } = await deps.gateway.getCalendarDelta(previous);

  for (const e of events) {
    const model = graphEventToModel(e);
    if (e["@removed"]) {
      await deps.eventStore.markCancelled(model.sourceEventId);
      await propagateChange(deps.gateway, deps.subs, { ...model, status: "cancelled" });
    } else {
      await deps.eventStore.upsert(model);
      await propagateChange(deps.gateway, deps.subs, model);
    }
  }

  await deps.saveDeltaLink(deltaLink);
}

// Production entrypoint wiring the real implementations.
export async function runSyncCycle(): Promise<void> {
  const { RealGateway } = await import("@/lib/graph/realGateway");
  const { createGraphClient } = await import("@/lib/graph/client");
  const { PrismaEventStore } = await import("@/lib/sync/prismaEventStore");
  const { PrismaSubscriptionStore } = await import("@/lib/sync/prismaSubscriptionStore");
  const { getDeltaLink, saveDeltaLink } = await import("@/lib/sync/cursor");

  await runSyncCycleWith({
    gateway: new RealGateway(createGraphClient()),
    eventStore: new PrismaEventStore(),
    subs: new PrismaSubscriptionStore(),
    getDeltaLink,
    saveDeltaLink,
  });
}
