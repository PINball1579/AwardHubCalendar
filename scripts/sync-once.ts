import { existsSync } from "node:fs";
import path from "node:path";

/**
 * One-shot sync: run a single delta cycle that pulls the awards@ calendar from
 * Microsoft Graph into the website cache and propagates any changes to users'
 * calendar copies. Useful for demos/manual runs WITHOUT a public webhook URL
 * (the background worker does this automatically every 10 minutes in production).
 *
 * Requires real Graph credentials in .env (AZURE_TENANT_ID / AZURE_CLIENT_ID /
 * AZURE_CLIENT_SECRET with admin-consented Calendars.ReadWrite) and AWARDS_MAILBOX
 * pointed at a real mailbox.
 */
async function main(): Promise<void> {
  // tsx does not auto-load .env; load it before importing modules that read
  // process.env at import time.
  const envPath = path.resolve(process.cwd(), ".env");
  if (existsSync(envPath)) {
    process.loadEnvFile(envPath);
  }

  const { runSyncCycle } = await import("@/lib/sync/runCycle");
  const { prisma } = await import("@/lib/db");

  console.log(
    "Running one sync cycle (awards@ calendar -> website cache -> user copies)...",
  );
  await runSyncCycle();
  const count = await prisma.event.count({ where: { status: "active" } });
  console.log(`Sync complete. ${count} active event(s) in the website cache.`);
  await prisma.$disconnect();
}

main().catch((err: unknown) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
