import { describe, it, expect } from "vitest";
import { authCallbacks } from "@/lib/auth";

describe("auth callbacks", () => {
  it("copies oid and email from the profile into the token", async () => {
    const token = await authCallbacks.jwt({
      token: {},
      profile: { oid: "obj-123", email: "user@publicisgroupe.com" },
      account: { provider: "azure-ad" },
    } as never);
    expect((token as { oid?: string }).oid).toBe("obj-123");
  });

  it("exposes oid and email on the session user", async () => {
    const session = await authCallbacks.session({
      session: { user: {} },
      token: { oid: "obj-123", email: "user@publicisgroupe.com" },
    } as never);
    expect((session.user as { id?: string }).id).toBe("obj-123");
  });
});
