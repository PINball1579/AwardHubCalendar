import { describe, it, expect, beforeEach } from "vitest";
import { clientKey, rateLimit, resetRateLimits } from "@/lib/api/rateLimit";

beforeEach(() => resetRateLimits());

describe("rateLimit", () => {
  it("allows up to the limit then blocks", () => {
    const t = 1_000;
    for (let i = 0; i < 5; i++) {
      expect(rateLimit("k", 5, 60_000, t).allowed).toBe(true);
    }
    const blocked = rateLimit("k", 5, 60_000, t);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  // The pentest sent 40 rapid requests and all succeeded.
  it("throttles a 40-request burst", () => {
    const t = 1_000;
    const results = Array.from({ length: 40 }, () => rateLimit("burst", 10, 60_000, t));
    expect(results.filter((r) => r.allowed)).toHaveLength(10);
    expect(results.filter((r) => !r.allowed)).toHaveLength(30);
  });

  it("keeps separate budgets per key", () => {
    const t = 1_000;
    expect(rateLimit("a", 1, 60_000, t).allowed).toBe(true);
    expect(rateLimit("a", 1, 60_000, t).allowed).toBe(false);
    expect(rateLimit("b", 1, 60_000, t).allowed).toBe(true);
  });

  it("recovers after the window elapses", () => {
    expect(rateLimit("k", 1, 1_000, 0).allowed).toBe(true);
    expect(rateLimit("k", 1, 1_000, 500).allowed).toBe(false);
    expect(rateLimit("k", 1, 1_000, 1_001).allowed).toBe(true);
  });

  it("reports remaining budget", () => {
    expect(rateLimit("k", 3, 60_000, 0).remaining).toBe(2);
    expect(rateLimit("k", 3, 60_000, 0).remaining).toBe(1);
  });
});

describe("clientKey", () => {
  const req = (headers: Record<string, string>) =>
    new Request("https://example.test/", { headers });

  it("uses the left-most forwarded address", () => {
    expect(clientKey(req({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" }))).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip then to a constant", () => {
    expect(clientKey(req({ "x-real-ip": "9.9.9.9" }))).toBe("9.9.9.9");
    expect(clientKey(req({}))).toBe("unknown");
  });
});
