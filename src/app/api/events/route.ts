import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { buildAuthOptions } from "@/lib/auth";
import { listActiveEvents } from "@/lib/api/events";

export async function GET() {
  const session = await getServerSession(buildAuthOptions());
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized", data: null },
      { status: 401 }
    );
  }
  const data = await listActiveEvents();
  return NextResponse.json({ success: true, error: null, data });
}
