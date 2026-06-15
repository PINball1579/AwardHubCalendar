import { prisma } from "@/lib/db";
import type { SubscriptionStore, SubRecord } from "@/lib/sync/subscriptionStore";

export class PrismaSubscriptionStore implements SubscriptionStore {
  async findBySourceEvent(sourceEventId: string): Promise<SubRecord[]> {
    const rows = await prisma.subscription.findMany({
      where: { sourceEventId, state: { not: "removed" } },
    });
    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      userEmail: r.userEmail,
      sourceEventId: r.sourceEventId,
      copiedEventId: r.copiedEventId,
      state: r.state as SubRecord["state"],
    }));
  }

  async setCopiedEvent(id: string, copiedEventId: string): Promise<void> {
    await prisma.subscription.update({ where: { id }, data: { copiedEventId } });
  }

  async setState(id: string, state: SubRecord["state"], error?: string): Promise<void> {
    await prisma.subscription.update({
      where: { id },
      data: { state, lastError: error ?? null },
    });
  }
}
