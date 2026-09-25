import { timingSafeEqual } from "node:crypto";
import { z } from "zod";

/** Largest webhook body we will read. Graph batches are far smaller than this. */
export const MAX_NOTIFICATION_BYTES = 64 * 1024;
/** Largest number of change notifications accepted in one delivery. */
export const MAX_NOTIFICATION_ITEMS = 100;

const itemSchema = z
  .object({
    subscriptionId: z.string().min(1).max(200).optional(),
    clientState: z.string().max(512).optional(),
    changeType: z.string().min(1).max(50).optional(),
    resource: z.string().max(1000).optional(),
    tenantId: z.string().max(100).optional(),
    resourceData: z
      .object({ id: z.string().min(1).max(500).optional() })
      .loose()
      .optional(),
  })
  .loose();

const bodySchema = z.object({
  value: z.array(itemSchema).min(1).max(MAX_NOTIFICATION_ITEMS),
});

export interface ExpectedNotification {
  clientState: string;
  /** Subscription ids we created. Empty/undefined skips the check. */
  subscriptionIds?: string[];
  /** Entra tenant the subscription belongs to. */
  tenantId?: string;
  /** Resource path the subscription watches, e.g. "users/{id}/events". */
  resource?: string;
}

export interface ParsedNotification {
  valid: boolean;
  changedIds: string[];
  /** Why the delivery was rejected. Logged server-side, never returned to the caller. */
  reason?: string;
}

const REJECTED = (reason: string): ParsedNotification => ({
  valid: false,
  changedIds: [],
  reason,
});

/** Constant-time comparison that tolerates differing lengths. */
function secretsMatch(received: string | undefined, expected: string): boolean {
  if (typeof received !== "string") return false;
  const a = Buffer.from(received, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Validates a Microsoft Graph change-notification delivery.
 *
 * The endpoint is public, so nothing here trusts the payload: the body shape is
 * schema-checked (including item count), clientState is compared in constant
 * time, and — when the caller supplies them — the subscription id, tenant and
 * resource must match the subscription we actually created. Any unknown or
 * malformed input is rejected rather than thrown.
 */
export function parseNotification(
  body: unknown,
  expected: string | ExpectedNotification,
): ParsedNotification {
  const exp: ExpectedNotification =
    typeof expected === "string" ? { clientState: expected } : expected;

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return REJECTED("malformed body");

  const items = parsed.data.value;

  for (const item of items) {
    if (!secretsMatch(item.clientState, exp.clientState)) {
      return REJECTED("clientState mismatch");
    }
    if (exp.subscriptionIds?.length) {
      if (!item.subscriptionId || !exp.subscriptionIds.includes(item.subscriptionId)) {
        return REJECTED("unknown subscriptionId");
      }
    }
    if (exp.tenantId && item.tenantId && item.tenantId !== exp.tenantId) {
      return REJECTED("tenant mismatch");
    }
    if (exp.resource && item.resource && !item.resource.startsWith(exp.resource)) {
      return REJECTED("resource mismatch");
    }
  }

  const changedIds = [
    ...new Set(
      items
        .map((i) => i.resourceData?.id)
        .filter((id): id is string => typeof id === "string" && id.length > 0),
    ),
  ];

  return { valid: true, changedIds };
}
