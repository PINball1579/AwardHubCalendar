import cron from "node-cron";
import { getConfig } from "@/lib/config";
import { runSyncCycle } from "@/lib/sync/runCycle";
import { ensureSubscriptionWith } from "@/lib/sync/subscriptionLifecycle";
import { RealGateway } from "@/lib/graph/realGateway";
import { createGraphClient } from "@/lib/graph/client";
import { loadStoredSub, saveStoredSub } from "@/lib/sync/graphSubStore";

async function ensureSubscription(): Promise<void> {
  const cfg = getConfig();
  await ensureSubscriptionWith({
    gateway: new RealGateway(createGraphClient()),
    notificationUrl: `${cfg.publicBaseUrl}/api/graph/notifications`,
    clientState: cfg.graphNotificationClientState,
    loadStored: loadStoredSub,
    save: saveStoredSub,
  });
}

async function tick(label: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    console.log(`[worker] ${label} ok`);
  } catch (err) {
    console.error(`[worker] ${label} failed`, err);
  }
}

async function main(): Promise<void> {
  console.log("[worker] starting");
  await tick("ensureSubscription", ensureSubscription);
  await tick("initial sync", runSyncCycle);

  // Reconcile every 10 minutes as a safety net for missed notifications.
  cron.schedule("*/10 * * * *", () => void tick("sync", runSyncCycle));
  // Renew the Graph subscription hourly (it renews only when near expiry).
  cron.schedule("0 * * * *", () => void tick("ensureSubscription", ensureSubscription));
}

void main();
