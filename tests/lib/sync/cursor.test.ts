import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { getDeltaLink, saveDeltaLink } from "@/lib/sync/cursor";

describe("delta cursor", () => {
  beforeEach(async () => {
    await prisma.deltaCursor.deleteMany();
  });

  it("returns null when no cursor saved, then round-trips a saved value", async () => {
    expect(await getDeltaLink()).toBeNull();
    await saveDeltaLink("delta-token-1");
    expect(await getDeltaLink()).toBe("delta-token-1");
    await saveDeltaLink("delta-token-2");
    expect(await getDeltaLink()).toBe("delta-token-2");
  });
});
