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

/** The source event is unknown or no longer active. Safe to report to the caller. */
export class SourceEventNotFoundError extends Error {
  constructor(sourceEventId: string) {
    super(`Source event not found: ${sourceEventId}`);
    this.name = "SourceEventNotFoundError";
  }
}

/** Another request for the same user+event is mid-flight. Caller should retry. */
export class AddInProgressError extends Error {
  constructor(sourceEventId: string) {
    super(`Add already in progress: ${sourceEventId}`);
    this.name = "AddInProgressError";
  }
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: unknown }).code === "P2002"
  );
}

/**
 * Copies an award deadline into the user's own calendar.
 *
 * Creating the Outlook event is not something we can roll back, so the database
 * row is claimed *first*: the unique index on (userId, sourceEventId) makes the
 * claim atomic, and only the request that wins it calls Graph. A concurrent
 * duplicate either returns the already-synced copy or is told to retry — it
 * never creates a second event in the user's calendar.
 */
export async function addToMyCalendar(
  gateway: CalendarGateway,
  req: AddRequest,
): Promise<AddResult> {
  const where = {
    userId_sourceEventId: { userId: req.userId, sourceEventId: req.sourceEventId },
  };

  const event = await prisma.event.findUnique({
    where: { sourceEventId: req.sourceEventId },
  });
  if (!event || event.status !== "active") {
    throw new SourceEventNotFoundError(req.sourceEventId);
  }

  // Already done — nothing to create.
  const existing = await prisma.subscription.findUnique({ where });
  if (existing?.copiedEventId && existing.state === "synced") {
    return { state: "synced", copiedEventId: existing.copiedEventId };
  }

  if (!(await claim(req))) {
    // Lost the race. If the winner has finished, return its result.
    const settled = await prisma.subscription.findUnique({ where });
    if (settled?.copiedEventId && settled.state === "synced") {
      return { state: "synced", copiedEventId: settled.copiedEventId };
    }
    throw new AddInProgressError(req.sourceEventId);
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

  let created: { id: string };
  try {
    created = await gateway.createUserEvent(req.userId, modelToGraphPayload(model));
  } catch (err: unknown) {
    // Release the claim so a later attempt can retry.
    await prisma.subscription
      .update({
        where,
        data: {
          state: "failed",
          lastError: err instanceof Error ? err.message : "Unknown error",
        },
      })
      .catch(() => undefined);
    throw err;
  }

  await prisma.subscription.update({
    where,
    data: { copiedEventId: created.id, state: "synced", lastError: null },
  });

  return { state: "synced", copiedEventId: created.id };
}

/**
 * Takes exclusive ownership of the create step. Returns false when another
 * request already holds it.
 */
async function claim(req: AddRequest): Promise<boolean> {
  try {
    await prisma.subscription.create({
      data: {
        userId: req.userId,
        userEmail: req.userEmail,
        sourceEventId: req.sourceEventId,
        state: "pending",
      },
    });
    return true;
  } catch (err: unknown) {
    if (!isUniqueViolation(err)) throw err;
    // A row exists. Re-claim it only from a terminal non-synced state; a row
    // sitting in "pending" belongs to an in-flight request.
    const { count } = await prisma.subscription.updateMany({
      where: {
        userId: req.userId,
        sourceEventId: req.sourceEventId,
        state: { in: ["failed", "removed"] },
      },
      data: { state: "pending", userEmail: req.userEmail, lastError: null },
    });
    return count === 1;
  }
}
