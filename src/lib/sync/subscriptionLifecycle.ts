import type { CalendarGateway } from "@/lib/graph/gateway";

export interface StoredSub {
  subscriptionId: string;
  resource: string;
  expiresAt: string;
}

export interface EnsureDeps {
  gateway: CalendarGateway;
  notificationUrl: string;
  clientState: string;
  loadStored: () => Promise<StoredSub | null>;
  save: (sub: StoredSub) => Promise<void>;
}

const RENEW_THRESHOLD_MS = 12 * 60 * 60 * 1000; // renew if <12h left

export async function ensureSubscriptionWith(deps: EnsureDeps): Promise<void> {
  const stored = await deps.loadStored();

  if (!stored) {
    const created = await deps.gateway.createSubscription(deps.notificationUrl, deps.clientState);
    await deps.save({ subscriptionId: created.id, resource: created.resource, expiresAt: created.expiresAt });
    return;
  }

  const msLeft = new Date(stored.expiresAt).getTime() - Date.now();
  if (msLeft < RENEW_THRESHOLD_MS) {
    const renewed = await deps.gateway.renewSubscription(stored.subscriptionId);
    await deps.save({ ...stored, expiresAt: renewed.expiresAt });
  }
}
