import { describe, it, expect } from "vitest";
import {
  parseNotification,
  MAX_NOTIFICATION_ITEMS,
} from "@/lib/api/notifications";

const item = (over: Record<string, unknown> = {}) => ({
  clientState: "secret",
  subscriptionId: "sub-1",
  tenantId: "tenant-1",
  resource: "users/awards/events",
  changeType: "updated",
  resourceData: { id: "EV1" },
  ...over,
});

const expected = {
  clientState: "secret",
  subscriptionIds: ["sub-1"],
  tenantId: "tenant-1",
  resource: "users/awards/events",
};

describe("notification validation — malformed input", () => {
  // The pentest crashed this endpoint by POSTing a bare `null`.
  it.each([
    ["null", null],
    ["undefined", undefined],
    ["a string", "hello"],
    ["a number", 42],
    ["an array", [{ clientState: "secret" }]],
    ["an empty object", {}],
    ["value: null", { value: null }],
    ["value: a string", { value: "nope" }],
    ["value: empty array", { value: [] }],
  ])("rejects %s without throwing", (_label, body) => {
    const result = parseNotification(body, "secret");
    expect(result.valid).toBe(false);
    expect(result.changedIds).toEqual([]);
  });

  it("rejects more items than the batch cap", () => {
    const value = Array.from({ length: MAX_NOTIFICATION_ITEMS + 1 }, () => item());
    expect(parseNotification({ value }, expected).valid).toBe(false);
  });

  it("accepts a batch exactly at the cap", () => {
    const value = Array.from({ length: MAX_NOTIFICATION_ITEMS }, (_, i) =>
      item({ resourceData: { id: `EV${i}` } }),
    );
    expect(parseNotification({ value }, expected).valid).toBe(true);
  });
});

describe("notification validation — authenticity", () => {
  it("accepts a well-formed delivery", () => {
    const result = parseNotification({ value: [item()] }, expected);
    expect(result.valid).toBe(true);
    expect(result.changedIds).toEqual(["EV1"]);
  });

  it("rejects a wrong clientState", () => {
    const r = parseNotification({ value: [item({ clientState: "wrong" })] }, expected);
    expect(r.valid).toBe(false);
    expect(r.reason).toMatch(/clientState/);
  });

  it("rejects a missing clientState", () => {
    const r = parseNotification({ value: [item({ clientState: undefined })] }, expected);
    expect(r.valid).toBe(false);
  });

  it("rejects an unknown subscription id", () => {
    const r = parseNotification({ value: [item({ subscriptionId: "attacker" })] }, expected);
    expect(r.valid).toBe(false);
    expect(r.reason).toMatch(/subscriptionId/);
  });

  it("rejects a foreign tenant", () => {
    const r = parseNotification({ value: [item({ tenantId: "other-tenant" })] }, expected);
    expect(r.valid).toBe(false);
    expect(r.reason).toMatch(/tenant/);
  });

  it("rejects a resource outside the watched mailbox", () => {
    const r = parseNotification({ value: [item({ resource: "users/ceo/messages" })] }, expected);
    expect(r.valid).toBe(false);
    expect(r.reason).toMatch(/resource/);
  });

  it("rejects the whole batch if any item fails", () => {
    const r = parseNotification(
      { value: [item(), item({ clientState: "wrong" })] },
      expected,
    );
    expect(r.valid).toBe(false);
    expect(r.changedIds).toEqual([]);
  });

  it("de-duplicates repeated resource ids", () => {
    const r = parseNotification(
      { value: [item(), item(), item({ resourceData: { id: "EV2" } })] },
      expected,
    );
    expect(r.changedIds).toEqual(["EV1", "EV2"]);
  });

  it("still supports the plain-string clientState form", () => {
    const r = parseNotification({ value: [item()] }, "secret");
    expect(r.valid).toBe(true);
  });
});
