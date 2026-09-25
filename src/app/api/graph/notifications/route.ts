import { NextResponse } from "next/server";
import { getConfig } from "@/lib/config";
import {
  parseNotification,
  MAX_NOTIFICATION_BYTES,
} from "@/lib/api/notifications";
import { clientKey, rateLimit } from "@/lib/api/rateLimit";
import { enqueueNotification } from "@/lib/sync/notificationQueue";
import { loadStoredSub } from "@/lib/sync/graphSubStore";
import { runSyncCycle } from "@/lib/sync/runCycle";
import { triggerSync } from "@/lib/sync/syncRunner";

/** Graph's validation handshake echoes a short token; anything longer is not ours. */
const MAX_VALIDATION_TOKEN = 2048;

// One subscription on one mailbox: Graph batches up to 100 changes into a
// single delivery, so this is far above normal traffic while still capping a
// burst from any one source. Anything shed here is recovered by the worker's
// periodic delta sweep and by Graph's own retries.
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

function accepted() {
  // Always 202 with no body: the endpoint must not tell an unauthenticated
  // caller whether their payload was recognised.
  return new NextResponse(null, { status: 202 });
}

export async function POST(request: Request) {
  const limit = rateLimit(`graph-webhook:${clientKey(request)}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limit.allowed) {
    return new NextResponse(null, {
      status: 429,
      headers: { "Retry-After": String(limit.retryAfter) },
    });
  }

  // Subscription validation handshake.
  const url = new URL(request.url);
  const validationToken = url.searchParams.get("validationToken");
  if (validationToken !== null) {
    if (validationToken.length > MAX_VALIDATION_TOKEN) {
      return new NextResponse(null, { status: 400 });
    }
    return new NextResponse(validationToken, {
      status: 200,
      // text/plain + nosniff (set globally) so an echoed token can never be
      // interpreted as markup by a browser.
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // Reject oversized deliveries before reading them into memory.
  const declared = Number(request.headers.get("content-length") ?? "");
  if (Number.isFinite(declared) && declared > MAX_NOTIFICATION_BYTES) {
    return new NextResponse(null, { status: 413 });
  }

  const raw = await request.text().catch(() => null);
  if (raw === null || raw.length === 0 || raw.length > MAX_NOTIFICATION_BYTES) {
    return accepted();
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return accepted();
  }

  const cfg = getConfig();
  const stored = await loadStoredSub().catch(() => null);

  const parsed = parseNotification(body, {
    clientState: cfg.graphNotificationClientState,
    subscriptionIds: stored ? [stored.subscriptionId] : undefined,
    tenantId: cfg.azure.tenantId,
    resource: stored?.resource,
  });

  if (!parsed.valid) {
    // Logged, not returned: the caller learns nothing about why it failed.
    console.warn("[graph-webhook] rejected notification:", parsed.reason);
    return accepted();
  }

  // Persist before acknowledging so a crash cannot silently drop the change.
  await enqueueNotification({
    subscriptionId: stored?.subscriptionId,
    changedIds: parsed.changedIds,
  });

  // A notification only signals "something changed". Trigger the delta sync
  // WITHOUT awaiting it so we respond within Graph's webhook timeout; the
  // runner coalesces concurrent notifications into a single in-flight cycle.
  triggerSync(runSyncCycle);
  return accepted();
}
