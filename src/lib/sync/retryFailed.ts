import type { CalendarGateway } from "@/lib/graph/gateway";
import type { SubscriptionStore } from "@/lib/sync/subscriptionStore";
import type { EventModel } from "@/lib/graph/types";
import { propagateChange } from "@/lib/sync/propagate";

export interface RetryDeps {
  gateway: CalendarGateway;
  subs: SubscriptionStore;
  /** Distinct sourceEventIds that currently have at least one failed subscription. */
  listFailedSourceEventIds: () => Promise<string[]>;
  /** Load the current local model for a source event, or null if it no longer exists. */
  loadEventModel: (sourceEventId: string) => Promise<EventModel | null>;
}

/**
 * Re-attempt propagation for every source event that has failed subscriptions.
 * Re-running propagateChange retries each non-removed sub for that event
 * (update if a copy exists, create otherwise); success flips failed -> synced.
 * A source event that no longer exists is skipped (its subs stay failed).
 */
export async function retryFailedWith(deps: RetryDeps): Promise<void> {
  const ids = await deps.listFailedSourceEventIds();
  for (const sourceEventId of ids) {
    const model = await deps.loadEventModel(sourceEventId);
    if (!model) continue;
    await propagateChange(deps.gateway, deps.subs, model);
  }
}

// Production entrypoint wiring real implementations.
export async function retryFailed(): Promise<void> {
  const { prisma } = await import("@/lib/db");
  const { RealGateway } = await import("@/lib/graph/realGateway");
  const { createGraphClient } = await import("@/lib/graph/client");
  const { PrismaSubscriptionStore } = await import("@/lib/sync/prismaSubscriptionStore");

  await retryFailedWith({
    gateway: new RealGateway(createGraphClient()),
    subs: new PrismaSubscriptionStore(),
    listFailedSourceEventIds: async () => {
      const rows = await prisma.subscription.findMany({
        where: { state: "failed" },
        distinct: ["sourceEventId"],
        select: { sourceEventId: true },
      });
      return rows.map((r) => r.sourceEventId);
    },
    loadEventModel: async (sourceEventId) => {
      const e = await prisma.event.findUnique({ where: { sourceEventId } });
      if (!e) return null;
      return {
        sourceEventId: e.sourceEventId,
        title: e.title,
        start: e.start,
        end: e.end,
        isAllDay: e.isAllDay,
        location: e.location,
        description: e.description,
        lastModified: e.lastModified,
        status: e.status === "cancelled" ? "cancelled" : "active",
      };
    },
  });
}
