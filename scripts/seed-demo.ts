import { existsSync } from "node:fs";
import path from "node:path";

interface DemoEvent {
  sourceEventId: string;
  title: string;
  start: Date;
  end: Date;
  isAllDay: boolean;
  location: string;
  description?: string;
}

function allDay(dateIso: string, nextDayIso: string): { start: Date; end: Date } {
  return {
    start: new Date(`${dateIso}T00:00:00Z`),
    end: new Date(`${nextDayIso}T00:00:00Z`),
  };
}

const demoEvents: DemoEvent[] = [
  {
    sourceEventId: "demo-cannes-lions-2026-entry-deadline",
    title: "Cannes Lions 2026 — Entry Deadline",
    ...allDay("2026-06-12", "2026-06-13"),
    isAllDay: true,
    location: "Cannes, France",
    description: "Final deadline to submit award entries.",
  },
  {
    sourceEventId: "demo-dandad-awards-ceremony",
    title: "D&AD Awards Ceremony",
    start: new Date("2026-06-05T18:00:00Z"),
    end: new Date("2026-06-05T22:00:00Z"),
    isAllDay: false,
    location: "London",
    description: "Annual D&AD ceremony.",
  },
  {
    sourceEventId: "demo-webby-awards-submission-close",
    title: "Webby Awards — Submission Close",
    ...allDay("2026-06-08", "2026-06-09"),
    isAllDay: true,
    location: "Online",
  },
  {
    sourceEventId: "demo-the-one-show-final-deadline",
    title: "The One Show — Final Deadline",
    ...allDay("2026-06-18", "2026-06-19"),
    isAllDay: true,
    location: "New York",
  },
  {
    sourceEventId: "demo-clio-awards-final-deadline",
    title: "Clio Awards — Final Deadline",
    ...allDay("2026-06-22", "2026-06-23"),
    isAllDay: true,
    location: "Online",
  },
  {
    sourceEventId: "demo-effie-awards-gala",
    title: "Effie Awards Gala",
    start: new Date("2026-06-26T19:00:00Z"),
    end: new Date("2026-06-26T23:00:00Z"),
    isAllDay: false,
    location: "Singapore",
  },
  {
    sourceEventId: "demo-spikes-asia-early-entry",
    title: "Spikes Asia — Early Entry",
    ...allDay("2026-05-28", "2026-05-29"),
    isAllDay: true,
    location: "Online",
  },
  {
    sourceEventId: "demo-eurobest-call-for-entries",
    title: "Eurobest — Call for Entries",
    ...allDay("2026-07-02", "2026-07-03"),
    isAllDay: true,
    location: "Online",
  },
];

async function main(): Promise<void> {
  // tsx does not auto-load .env like Next.js does, so load it here for
  // standalone scripts (DATABASE_URL etc.) using Node's built-in loader.
  // This must happen before @/lib/db is imported, since that module reads
  // process.env.DATABASE_URL at import time.
  const envPath = path.resolve(process.cwd(), ".env");
  if (existsSync(envPath)) {
    process.loadEnvFile(envPath);
  }

  const { prisma } = await import("@/lib/db");

  await prisma.event.deleteMany({});

  const now = new Date();
  let count = 0;
  for (const evt of demoEvents) {
    await prisma.event.create({
      data: {
        sourceEventId: evt.sourceEventId,
        title: evt.title,
        start: evt.start,
        end: evt.end,
        isAllDay: evt.isAllDay,
        location: evt.location,
        description: evt.description ?? null,
        lastModified: now,
        status: "active",
      },
    });
    count += 1;
  }

  console.log(`Seeded ${count} demo events.`);
  await prisma.$disconnect();
}

main().catch((err: unknown) => {
  console.error("Failed to seed demo events:", err);
  process.exit(1);
});
