import { describe, it, expect } from "vitest";
import { ensureSubscriptionWith } from "@/lib/sync/subscriptionLifecycle";
import { FakeGateway } from "@/lib/graph/fakeGateway";

describe("ensureSubscriptionWith", () => {
  it("creates a new subscription when none is stored", async () => {
    const gw = new FakeGateway();
    let saved: { subscriptionId: string; resource: string; expiresAt: string } | undefined;
    await ensureSubscriptionWith({
      gateway: gw,
      notificationUrl: "https://x/api/graph/notifications",
      clientState: "secret",
      loadStored: async () => null,
      save: async (s) => { saved = s; },
    });
    expect(saved?.subscriptionId).toMatch(/^sub-/);
  });

  it("renews when the stored subscription is near expiry", async () => {
    const gw = new FakeGateway();
    let saved: { subscriptionId: string; expiresAt: string } | undefined;
    const soon = new Date(Date.now() + 60_000).toISOString();
    await ensureSubscriptionWith({
      gateway: gw,
      notificationUrl: "https://x/api/graph/notifications",
      clientState: "secret",
      loadStored: async () => ({ subscriptionId: "sub-existing", resource: "events", expiresAt: soon }),
      save: async (s) => { saved = s; },
    });
    expect(saved?.subscriptionId).toBe("sub-existing");
    expect(new Date(saved!.expiresAt).getTime()).toBeGreaterThan(Date.now() + 3600_000);
  });

  it("does nothing when the stored subscription is comfortably valid", async () => {
    const gw = new FakeGateway();
    let saveCount = 0;
    const farFuture = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    await ensureSubscriptionWith({
      gateway: gw,
      notificationUrl: "https://x/api/graph/notifications",
      clientState: "secret",
      loadStored: async () => ({ subscriptionId: "sub-existing", resource: "events", expiresAt: farFuture }),
      save: async () => { saveCount++; },
    });
    expect(saveCount).toBe(0);
  });
});
