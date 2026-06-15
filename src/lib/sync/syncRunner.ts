type Runner = () => Promise<void>;

let running = false;
let rerunRequested = false;

/**
 * Run `run` with single-flight coalescing: only one execution happens at a
 * time. If called while a run is in progress, a single additional run is
 * scheduled after the current one finishes (further calls during that window
 * collapse into that same one re-run). Resolves when no more runs are pending.
 */
export async function runCoalesced(run: Runner): Promise<void> {
  if (running) {
    rerunRequested = true;
    return;
  }
  running = true;
  try {
    do {
      rerunRequested = false;
      await run();
    } while (rerunRequested);
  } finally {
    running = false;
  }
}

/**
 * Fire-and-forget trigger for use in request handlers: kicks off a coalesced
 * run without awaiting it, logging any failure. Returns immediately.
 */
export function triggerSync(run: Runner): void {
  void runCoalesced(run).catch((err) => {
    console.error("[sync] background sync cycle failed", err);
  });
}
