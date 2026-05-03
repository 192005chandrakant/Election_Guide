import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/admin-firestore";

const ALLOWED_EVENTS = new Set([
  "guide_viewed",
  "guide_progress_seen",
  "checklist_toggled",
  "score_shared",
  "level_progress_viewed",
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventName = typeof body?.eventName === "string" ? body.eventName : "";

    if (!ALLOWED_EVENTS.has(eventName)) {
      return NextResponse.json({ error: "Invalid eventName" }, { status: 400 });
    }

    const userId = typeof body?.userId === "string" ? body.userId : undefined;
    const page = typeof body?.page === "string" ? body.page : "unknown";
    const metadata = body?.metadata && typeof body.metadata === "object" ? body.metadata : {};

    const db = getAdminFirestore();
    await db.collection("analytics_events").add({
      eventName,
      userId: userId ?? null,
      page,
      metadata,
      clientTimestamp:
        typeof body?.timestamp === "string" ? new Date(body.timestamp) : new Date(),
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/analytics failed:", error);
    return NextResponse.json(
      {
        error: "Analytics service unavailable",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 503 }
    );
  }
}
