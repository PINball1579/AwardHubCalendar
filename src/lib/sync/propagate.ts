import type { CalendarGateway } from "@/lib/graph/gateway";
import type { SubscriptionStore } from "@/lib/sync/subscriptionStore";
import type { EventModel } from "@/lib/graph/types";
import { modelToGraphPayload } from "@/lib/mappers";

/**
 * Push a source-event change to every user copy.
 * - active source: create missing copies, update existing ones.
 * - cancelled source: delete copies and mark subs removed.
 * Per-user failures are recorded and never abort the loop.
 */
export async function propagateChange(
  gateway: CalendarGateway,
  subs: SubscriptionStore,
  model: EventModel,
): Promise<void> {
  const records = await subs.findBySourceEvent(model.sourceEventId);
  const payload = modelToGraphPayload(model);

  for (const rec of records) {
    try {
      if (model.status === "cancelled") {
        if (rec.copiedEventId) {
          await gateway.deleteUserEvent(rec.userId, rec.copiedEventId);
        }
        await subs.setState(rec.id, "removed");
        continue;
      }

      if (rec.copiedEventId) {
        await gateway.updateUserEvent(rec.userId, rec.copiedEventId, payload);
      } else {
        const created = await gateway.createUserEvent(rec.userId, payload);
        await subs.setCopiedEvent(rec.id, created.id);
      }
      await subs.setState(rec.id, "synced");
    } catch (err: unknown) {
      await subs.setState(rec.id, "failed", err instanceof Error ? err.message : String(err));
    }
  }
}
