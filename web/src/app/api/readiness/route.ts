import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { getServerFirestore } from "@/lib/server-firestore";
import { mergeUserProfile, type StoredUserProfile } from "@/lib/user-profile";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "demo";

  try {
    const db = getServerFirestore();
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    const profile = mergeUserProfile(
      userId,
      userSnap.exists()
        ? (userSnap.data() as Partial<Record<keyof StoredUserProfile, unknown>>)
        : null
    );

    return NextResponse.json({
      score: typeof profile.readinessScore === "number" ? profile.readinessScore : 45,
      items: profile.checklistProgress || {
        registered: false,
        polling_place: false,
        id_ready: false,
        research: false,
        plan: false,
      },
      location: profile.location || "Unknown",
      isFirstTimeVoter: profile.isFirstTimeVoter !== false,
      source: "firestore",
    });
  } catch (error) {
    console.error("GET /api/readiness failed:", error);
    return NextResponse.json({
      error: "Readiness service unavailable",
      details: error instanceof Error ? error.message : String(error),
      source: "firestore",
    }, { status: 503 });
  }
}
