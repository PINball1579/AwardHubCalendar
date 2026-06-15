import { prisma } from "@/lib/db";

export interface EventDto {
  sourceEventId: string;
  title: string;
  start: string;
  end: string;
  isAllDay: boolean;
  location: string | null;
  description: string | null;
}

export async function listActiveEvents(): Promise<EventDto[]> {
  const rows = await prisma.event.findMany({
    where: { status: "active" },
    orderBy: { start: "asc" },
  });
  return rows.map((r) => ({
    sourceEventId: r.sourceEventId,
    title: r.title,
    start: r.start.toISOString(),
    end: r.end.toISOString(),
    isAllDay: r.isAllDay,
    location: r.location,
    description: r.description,
  }));
}
