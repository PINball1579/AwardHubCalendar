import { prisma } from "@/lib/db";
import type { CalendarGateway } from "@/lib/graph/gateway";
import { modelToGraphPayload } from "@/lib/mappers";
import type { EventModel } from "@/lib/graph/types";

export interface AddRequest {
  userId: string;
  userEmail: string;
  sourceEventId: string;
}

export interface AddResult {
  state: "synced";
  copiedEventId: string;
}

export async function addToMyCalendar(
  gateway: CalendarGateway,
  req: AddRequest,
): Promise<AddResult> {
  const event = await prisma.event.findUnique({ where: { sourceEventId: req.sourceEventId } });
  if (!event || event.status !== "active") {
    throw new Error(`Source event not found: ${req.sourceEventId}`);
  }

  const existing = await prisma.subscription.findUnique({
    where: { userId_sourceEventId: { userId: req.userId, sourceEventId: req.sourceEventId } },
  });
  if (existing?.copiedEventId && existing.state === "synced") {
    return { state: "synced", copiedEventId: existing.copiedEventId };
  }

  const model: EventModel = {
    sourceEventId: event.sourceEventId,
    title: event.title,
    start: event.start,
    end: event.end,
    isAllDay: event.isAllDay,
    location: event.location,
    description: event.description,
    lastModified: event.lastModified,
    status: "active",
  };

  const created = await gateway.createUserEvent(req.userId, modelToGraphPayload(model));

  await prisma.subscription.upsert({
    where: { userId_sourceEventId: { userId: req.userId, sourceEventId: req.sourceEventId } },
    create: {
      userId: req.userId,
      userEmail: req.userEmail,
      sourceEventId: req.sourceEventId,
      copiedEventId: created.id,
      state: "synced",
    },
    update: { copiedEventId: created.id, state: "synced", lastError: null },
  });

  return { state: "synced", copiedEventId: created.id };
}
