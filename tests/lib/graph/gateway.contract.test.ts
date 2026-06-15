import { describe, it, expect } from "vitest";
import type { CalendarGateway } from "@/lib/graph/gateway";
import { FakeGateway } from "@/lib/graph/fakeGateway";

describe("CalendarGateway contract (fake)", () => {
  it("creates and deletes a user event", async () => {
    const gw: CalendarGateway = new FakeGateway();
    const created = await gw.createUserEvent("user-1", {
      subject: "X",
      isAllDay: true,
      start: { dateTime: "2026-06-12T00:00:00.000", timeZone: "UTC" },
      end: { dateTime: "2026-06-13T00:00:00.000", timeZone: "UTC" },
    });
    expect(created.id).toBeTruthy();
    await expect(gw.deleteUserEvent("user-1", created.id)).resolves.toBeUndefined();
  });
});
