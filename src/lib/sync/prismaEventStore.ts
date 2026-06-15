import { prisma } from "@/lib/db";
import type { EventStore } from "@/lib/sync/eventStore";
import type { EventModel } from "@/lib/graph/types";

export class PrismaEventStore implements EventStore {
  async upsert(m: EventModel): Promise<void> {
    await prisma.event.upsert({
      where: { sourceEventId: m.sourceEventId },
      create: {
        sourceEventId: m.sourceEventId,
        title: m.title,
        start: m.start,
        end: m.end,
        isAllDay: m.isAllDay,
        location: m.location,
        description: m.description,
        lastModified: m.lastModified,
        status: m.status,
      },
      update: {
        title: m.title,
        start: m.start,
        end: m.end,
        isAllDay: m.isAllDay,
        location: m.location,
        description: m.description,
        lastModified: m.lastModified,
        status: m.status,
      },
    });
  }

  async markCancelled(sourceEventId: string): Promise<void> {
    await prisma.event.updateMany({
      where: { sourceEventId },
      data: { status: "cancelled" },
    });
  }
}
