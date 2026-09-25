import { prisma } from "@/lib/db";

/**
 * Durability for the webhook: Graph retries only for a limited window, so an
 * accepted notification is written here *before* the endpoint returns 202. If
 * the process dies before the delta sync runs, the row is still pending and the
 * next cycle picks it up.
 */

export async function enqueueNotification(input: {
  subscriptionId?: string;
  changedIds: string[];
}): Promise<string> {
  const row = await prisma.notificationQueue.create({
    data: {
      subscriptionId: input.subscriptionId ?? null,
      changedIds: input.changedIds,
    },
    select: { id: true },
  });
  return row.id;
}

/** Ids of deliveries accepted but not yet covered by a completed sync. */
export async function pendingNotificationIds(limit = 500): Promise<string[]> {
  const rows = await prisma.notificationQueue.findMany({
    where: { processedAt: null },
    orderBy: { receivedAt: "asc" },
    take: limit,
    select: { id: true },
  });
  return rows.map((r) => r.id);
}

/** Marks deliveries processed once a delta cycle covering them has finished. */
export async function markNotificationsProcessed(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await prisma.notificationQueue.updateMany({
    where: { id: { in: ids } },
    data: { processedAt: new Date() },
  });
}
