import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { loadStoredSub, saveStoredSub } from "@/lib/sync/graphSubStore";

describe("graphSubStore", () => {
  beforeEach(async () => {
    await prisma.graphSubscription.deleteMany();
  });

  it("returns null when empty, then round-trips a saved subscription", async () => {
    expect(await loadStoredSub()).toBeNull();
    const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    await saveStoredSub({ subscriptionId: "sub-1", resource: "events", expiresAt });
    const loaded = await loadStoredSub();
    expect(loaded?.subscriptionId).toBe("sub-1");
    expect(loaded?.resource).toBe("events");
    // updating the same subscription id changes expiry, not creates a new row
    const later = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString();
    await saveStoredSub({ subscriptionId: "sub-1", resource: "events", expiresAt: later });
    expect(await prisma.graphSubscription.count()).toBe(1);
  });
});
