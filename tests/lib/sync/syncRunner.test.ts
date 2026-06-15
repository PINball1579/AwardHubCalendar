import { describe, it, expect } from "vitest";
import { runCoalesced } from "@/lib/sync/syncRunner";

// A controllable async run: each call waits on a manually-resolved promise.
function makeRun() {
  let calls = 0;
  const resolvers: Array<() => void> = [];
  const run = () => {
    calls++;
    return new Promise<void>((resolve) => resolvers.push(resolve));
  };
  const finishOne = () => resolvers.shift()!();
  return { run, get calls() { return calls; }, finishOne, pending: () => resolvers.length };
}

describe("runCoalesced", () => {
  it("runs immediately when idle", async () => {
    const h = makeRun();
    const p = runCoalesced(h.run);
    expect(h.calls).toBe(1);
    h.finishOne();
    await p;
  });

  it("coalesces concurrent triggers into a single extra run", async () => {
    const h = makeRun();
    const p1 = runCoalesced(h.run); // starts run #1
    expect(h.calls).toBe(1);
    // While #1 is in flight, three more triggers arrive — they must NOT start parallel runs.
    const p2 = runCoalesced(h.run);
    const p3 = runCoalesced(h.run);
    const p4 = runCoalesced(h.run);
    expect(h.calls).toBe(1); // still only the first run started
    h.finishOne();           // finish run #1 -> one coalesced re-run should start
    await Promise.resolve();  // let the loop schedule the rerun
    await Promise.resolve();
    expect(h.calls).toBe(2); // exactly one extra run, not three
    h.finishOne();           // finish run #2
    await Promise.all([p1, p2, p3, p4]);
    expect(h.calls).toBe(2);
  });

  it("can run again after fully settling", async () => {
    const h = makeRun();
    const p1 = runCoalesced(h.run);
    h.finishOne();
    await p1;
    const p2 = runCoalesced(h.run);
    expect(h.calls).toBe(2);
    h.finishOne();
    await p2;
  });
});
