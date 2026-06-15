import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { buildAuthOptions } from "@/lib/auth";
import { addToMyCalendar } from "@/lib/api/addToCalendar";
import { RealGateway } from "@/lib/graph/realGateway";
import { createGraphClient } from "@/lib/graph/client";

const bodySchema = z.object({ sourceEventId: z.string().min(1) });

export async function POST(request: Request) {
  const session = await getServerSession(buildAuthOptions());
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ success: false, error: "Unauthorized", data: null }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid request body", data: null }, { status: 400 });
  }

  try {
    const gateway = new RealGateway(createGraphClient());
    const result = await addToMyCalendar(gateway, {
      userId: session.user.id,
      userEmail: session.user.email,
      sourceEventId: parsed.data.sourceEventId,
    });
    return NextResponse.json({ success: true, error: null, data: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = /not found/i.test(message) ? 404 : 500;
    return NextResponse.json({ success: false, error: message, data: null }, { status });
  }
}
