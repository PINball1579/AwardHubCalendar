import { describe, it, expect } from "vitest";
import { parseNotification } from "@/lib/api/notifications";

describe("parseNotification", () => {
  it("extracts changed source event ids for matching clientState", () => {
    const body = {
      value: [
        { clientState: "secret", resourceData: { id: "EV1" }, changeType: "updated" },
        { clientState: "secret", resourceData: { id: "EV2" }, changeType: "deleted" },
      ],
    };
    const result = parseNotification(body, "secret");
    expect(result.valid).toBe(true);
    expect(result.changedIds).toEqual(["EV1", "EV2"]);
  });

  it("rejects notifications with a wrong clientState", () => {
    const body = { value: [{ clientState: "wrong", resourceData: { id: "EV1" }, changeType: "updated" }] };
    const result = parseNotification(body, "secret");
    expect(result.valid).toBe(false);
    expect(result.changedIds).toEqual([]);
  });

  it("rejects an empty notification", () => {
    const result = parseNotification({ value: [] }, "secret");
    expect(result.valid).toBe(false);
    expect(result.changedIds).toEqual([]);
  });
});
