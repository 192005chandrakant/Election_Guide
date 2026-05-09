import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/admin-firestore";
import { mergeUserProfile, type StoredUserProfile } from "@/lib/user-profile";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "demo";

  try {
    const db = getAdminFirestore();
    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();
    const profile = mergeUserProfile(
      userId,
      userSnap.exists
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
      score: 45,
      items: {
        registered: false,
        polling_place: false,
        id_ready: false,
        research: false,
        plan: false,
      },
      location: "Unknown",
      isFirstTimeVoter: true,
      source: "fallback",
      warning: "Readiness profile fallback used because Firestore was unavailable",
    });
  }
}
