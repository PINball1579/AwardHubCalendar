import type { CalendarGateway } from "@/lib/graph/gateway";
import type { EventStore } from "@/lib/sync/eventStore";
import { graphEventToModel, isRemoved } from "@/lib/mappers";

export interface ReconcileResult {
  deltaLink: string;
  changed: string[]; // sourceEventIds touched this run
}

export async function reconcileDelta(
  gateway: CalendarGateway,
  store: EventStore,
  previousDeltaLink: string | null,
): Promise<ReconcileResult> {
  const { events, deltaLink } = await gateway.getCalendarDelta(previousDeltaLink);
  const changed: string[] = [];
  for (const e of events) {
    if (isRemoved(e)) {
      await store.markCancelled(e.id);
    } else {
      await store.upsert(graphEventToModel(e));
    }
    changed.push(e.id);
  }
  return { deltaLink, changed };
}
