import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import {
  addToMyCalendar,
  AddInProgressError,
  SourceEventNotFoundError,
} from "@/lib/api/addToCalendar";
import { FakeGateway } from "@/lib/graph/fakeGateway";

beforeEach(async () => {
  await prisma.subscription.deleteMany();
  await prisma.event.deleteMany();
  await prisma.event.create({
    data: {
      sourceEventId: "CONC1",
      title: "Deadline",
      start: new Date("2026-06-12T00:00:00Z"),
      end: new Date("2026-06-13T00:00:00Z"),
      isAllDay: true,
      lastModified: new Date(),
      status: "active",
    },
  });
});

/** Gateway whose create is held open until released, to force overlap. */
class SlowGateway extends FakeGateway {
  private gate: Promise<void>;
  private open!: () => void;
  constructor() {
    super();
    this.gate = new Promise((resolve) => {
      this.open = resolve;
    });
  }
  release() {
    this.open();
  }
  async createUserEvent(userId: string, payload: Parameters<FakeGateway["createUserEvent"]>[1]) {
    await this.gate;
    return super.createUserEvent(userId, payload);
  }
}

const req = { userId: "u1", userEmail: "u@x", sourceEventId: "CONC1" };

describe("addToMyCalendar — concurrent adds", () => {
  it("creates exactly one Outlook event when two requests race", async () => {
    const gw = new SlowGateway();
    const first = addToMyCalendar(gw, req);
    // Let the first request take the claim before the second arrives.
    await new Promise((r) => setTimeout(r, 50));
    const second = addToMyCalendar(gw, req).catch((e) => e);

    gw.release();
    const [a, b] = await Promise.all([first, second]);

    expect(a.state).toBe("synced");
    // The loser either sees the finished copy or is told to retry — never a
    // second calendar event.
    if (b instanceof Error) {
      expect(b).toBeInstanceOf(AddInProgressError);
    } else {
      expect(b.copiedEventId).toBe(a.copiedEventId);
    }

    expect(gw.userEvents).toHaveLength(1);
    expect(await prisma.subscription.count({ where: { userId: "u1", sourceEventId: "CONC1" } })).toBe(1);
  });

  it("creates one event when many requests arrive at once", async () => {
    const gw = new FakeGateway();
    const results = await Promise.allSettled(
      Array.from({ length: 8 }, () => addToMyCalendar(gw, req)),
    );
    expect(gw.userEvents).toHaveLength(1);
    expect(results.some((r) => r.status === "fulfilled")).toBe(true);
    for (const r of results) {
      if (r.status === "rejected") expect(r.reason).toBeInstanceOf(AddInProgressError);
    }
  });

  it("leaves the row retryable when Graph fails, then succeeds", async () => {
    const failing = new FakeGateway();
    failing.createUserEvent = async () => {
      throw new Error("Graph 503 boom");
    };
    await expect(addToMyCalendar(failing, req)).rejects.toThrow(/boom/);

    const failed = await prisma.subscription.findFirst({ where: { userId: "u1", sourceEventId: "CONC1" } });
    expect(failed?.state).toBe("failed");

    const gw = new FakeGateway();
    const retry = await addToMyCalendar(gw, req);
    expect(retry.state).toBe("synced");
    expect(gw.userEvents).toHaveLength(1);
  });

  it("throws a typed error for unknown source events", async () => {
    await expect(
      addToMyCalendar(new FakeGateway(), { ...req, sourceEventId: "nope" }),
    ).rejects.toBeInstanceOf(SourceEventNotFoundError);
  });
});
