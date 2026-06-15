import type { EventModel } from "@/lib/graph/types";

export interface EventStore {
  upsert(model: EventModel): Promise<void>;
  markCancelled(sourceEventId: string): Promise<void>;
}
