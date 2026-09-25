import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { buildAuthOptions } from "@/lib/auth";
import {
  addToMyCalendar,
  AddInProgressError,
  SourceEventNotFoundError,
} from "@/lib/api/addToCalendar";
import { RealGateway } from "@/lib/graph/realGateway";
import { createGraphClient } from "@/lib/graph/client";
import { FakeGateway } from "@/lib/graph/fakeGateway";
import { isDemoMode } from "@/lib/demoMode";
import { clientKey, rateLimit } from "@/lib/api/rateLimit";

const bodySchema = z.object({ sourceEventId: z.string().min(1).max(500) });

/** Each user may add at most this many events per window. */
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

export async function POST(request: Request) {
  const session = await getServerSession(buildAuthOptions());
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ success: false, error: "Unauthorized", data: null }, { status: 401 });
  }

  // Keyed on the authenticated user, falling back to network identity.
  const limit = rateLimit(
    `subscriptions:${session.user.id ?? clientKey(request)}`,
    RATE_LIMIT,
    RATE_WINDOW_MS,
  );
  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests", data: null },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid request body", data: null }, { status: 400 });
  }

  try {
    // In local demo mode, skip the real Microsoft Graph integration entirely
    // and use an in-memory fake gateway so no Azure setup is required.
    const gateway = isDemoMode()
      ? new FakeGateway()
      : new RealGateway(createGraphClient());
    const result = await addToMyCalendar(gateway, {
      userId: session.user.id,
      userEmail: session.user.email,
      sourceEventId: parsed.data.sourceEventId,
    });
    return NextResponse.json({ success: true, error: null, data: result });
  } catch (err: unknown) {
    // Only this one condition is safe to describe; everything else (Graph
    // faults, Prisma errors) is logged server-side and reported generically so
    // internal details never reach the client.
    if (err instanceof SourceEventNotFoundError) {
      return NextResponse.json(
        { success: false, error: "Event not found", data: null },
        { status: 404 },
      );
    }
    if (err instanceof AddInProgressError) {
      return NextResponse.json(
        { success: false, error: "Already being added, try again", data: null },
        { status: 409, headers: { "Retry-After": "2" } },
      );
    }
    console.error("[subscriptions] add to calendar failed", {
      userId: session.user.id,
      sourceEventId: parsed.data.sourceEventId,
      err,
    });
    return NextResponse.json(
      { success: false, error: "Internal server error", data: null },
      { status: 500 },
    );
  }
}
