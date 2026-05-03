import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/admin-firestore";
import { MOCK_BALLOT } from "@/app/ballot/data";

export async function GET() {
  try {
    const db = getAdminFirestore();
    const ref = db.collection("platform_content").doc("ballot");
    const snap = await ref.get();

    if (!snap.exists) {
      await ref.set({
        ballot: MOCK_BALLOT,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return NextResponse.json({
        ballot: MOCK_BALLOT,
        source: "seeded",
      });
    }

    const data = snap.data();
    const ballot = data?.ballot;

    if (!ballot || typeof ballot !== "object") {
      return NextResponse.json(
        {
          error: "Ballot content is missing or malformed",
          source: "firestore",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ballot,
      source: "firestore",
    });
  } catch (error) {
    console.error("GET /api/platform/ballot failed:", error);
    return NextResponse.json(
      {
        error: "Ballot content unavailable",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 503 }
    );
  }
}
