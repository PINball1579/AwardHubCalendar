import { describe, it, expect } from "vitest";
import { decideAccess } from "@/lib/auth";

const GROUP = "11111111-2222-3333-4444-555555555555";
const OTHER = "99999999-8888-7777-6666-555555555555";

describe("decideAccess", () => {
  it("allows everyone when no group is configured", () => {
    expect(decideAccess({ oid: "u1" }, undefined)).toEqual({ allowed: true });
    expect(decideAccess(undefined, undefined)).toEqual({ allowed: true });
  });

  it("allows a member of the configured group", () => {
    expect(decideAccess({ oid: "u1", groups: [OTHER, GROUP] }, GROUP)).toEqual({
      allowed: true,
    });
  });

  it("denies a signed-in user who is not a member", () => {
    expect(decideAccess({ oid: "u1", groups: [OTHER] }, GROUP)).toEqual({
      allowed: false,
      reason: "not-a-member",
    });
  });

  it("denies when the group list is empty", () => {
    expect(decideAccess({ oid: "u1", groups: [] }, GROUP)).toEqual({
      allowed: false,
      reason: "not-a-member",
    });
  });

  // Fails closed: a misconfigured app registration must not grant access.
  it("denies when the groups claim is absent entirely", () => {
    expect(decideAccess({ oid: "u1" }, GROUP)).toEqual({
      allowed: false,
      reason: "claim-missing",
    });
  });

  it("denies when there is no profile at all", () => {
    expect(decideAccess(undefined, GROUP)).toEqual({
      allowed: false,
      reason: "claim-missing",
    });
  });

  it("distinguishes a claim overage from a plain missing claim", () => {
    const profile = {
      oid: "u1",
      _claim_names: { groups: "src1" },
      _claim_sources: { src1: { endpoint: "https://graph.microsoft.com/..." } },
    };
    expect(decideAccess(profile, GROUP)).toEqual({
      allowed: false,
      reason: "claim-overage",
    });
  });
});
