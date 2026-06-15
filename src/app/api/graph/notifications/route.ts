import { NextResponse } from "next/server";
import { getConfig } from "@/lib/config";
import { parseNotification } from "@/lib/api/notifications";
import { runSyncCycle } from "@/lib/sync/runCycle";
import { triggerSync } from "@/lib/sync/syncRunner";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const validationToken = url.searchParams.get("validationToken");
  if (validationToken) {
    return new NextResponse(validationToken, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  const cfg = getConfig();
  const body = await request.json().catch(() => ({}));
  const parsed = parseNotification(body, cfg.graphNotificationClientState);
  if (!parsed.valid) {
    return NextResponse.json({ success: false, error: "Invalid notification", data: null }, { status: 202 });
  }

  // A notification only signals "something changed". Trigger the delta sync
  // WITHOUT awaiting it so we respond within Graph's webhook timeout; the
  // runner coalesces concurrent notifications into a single in-flight cycle.
  triggerSync(runSyncCycle);
  return new NextResponse(null, { status: 202 });
}
