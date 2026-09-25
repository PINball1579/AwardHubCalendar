/**
 * Fixed-window rate limiter.
 *
 * In-process only: it protects a single instance from a burst and is not a
 * substitute for an edge WAF / API-gateway limit, which is what stops a
 * distributed flood before it reaches the app. Run both — see SECURITY.md.
 */

interface Window {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Seconds until the current window resets. */
  retryAfter: number;
}

const buckets = new Map<string, Window>();
/** Stop unbounded growth if keys are attacker-controlled. */
const MAX_TRACKED_KEYS = 10_000;

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): RateLimitResult {
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    if (buckets.size >= MAX_TRACKED_KEYS) sweep(now);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfter: 0 };
  }

  existing.count += 1;
  const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
  if (existing.count > limit) {
    return { allowed: false, remaining: 0, retryAfter };
  }
  return { allowed: true, remaining: limit - existing.count, retryAfter };
}

/** Drop expired windows; called when the map grows past its cap. */
function sweep(now: number): void {
  for (const [key, window] of buckets) {
    if (now >= window.resetAt) buckets.delete(key);
  }
  // Still full of live windows — clear outright rather than leak memory.
  if (buckets.size >= MAX_TRACKED_KEYS) buckets.clear();
}

/** Test helper. */
export function resetRateLimits(): void {
  buckets.clear();
}

/**
 * Best-effort client identity for limiting. Trusts the left-most X-Forwarded-For
 * entry, which is only meaningful behind a proxy that overwrites the header.
 */
export function clientKey(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
