import { prisma } from "@/lib/db";
import type { StoredSub } from "@/lib/sync/subscriptionLifecycle";

export async function loadStoredSub(): Promise<StoredSub | null> {
  const row = await prisma.graphSubscription.findFirst({ orderBy: { createdAt: "desc" } });
  if (!row) return null;
  return { subscriptionId: row.subscriptionId, resource: row.resource, expiresAt: row.expiresAt.toISOString() };
}

export async function saveStoredSub(sub: StoredSub): Promise<void> {
  await prisma.graphSubscription.upsert({
    where: { subscriptionId: sub.subscriptionId },
    create: { subscriptionId: sub.subscriptionId, resource: sub.resource, expiresAt: new Date(sub.expiresAt) },
    update: { expiresAt: new Date(sub.expiresAt) },
  });
}
