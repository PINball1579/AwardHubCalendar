import { prisma } from "@/lib/db";

const KEY = "awards-calendar";

export async function getDeltaLink(): Promise<string | null> {
  const row = await prisma.deltaCursor.findUnique({ where: { key: KEY } });
  return row?.deltaLink ?? null;
}

export async function saveDeltaLink(deltaLink: string): Promise<void> {
  await prisma.deltaCursor.upsert({
    where: { key: KEY },
    create: { key: KEY, deltaLink },
    update: { deltaLink },
  });
}
