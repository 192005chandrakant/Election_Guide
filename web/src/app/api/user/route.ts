import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getServerFirestore } from "@/lib/server-firestore";
import {
  calculateReadinessScore,
  mergeUserProfile,
  normalizeChecklistProgress,
} from "@/lib/user-profile";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    const db = getServerFirestore();
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    const profile = mergeUserProfile(userId, userSnap.exists() ? userSnap.data() : null);
    return NextResponse.json(profile);
  } catch (error) {
    console.error("GET /api/user failed:", error);
    return NextResponse.json(
      {
        error: "User profile service unavailable",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 503 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...updates } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const db = getServerFirestore();
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    const existingProfile = mergeUserProfile(
      userId,
      userSnap.exists() ? userSnap.data() : null
    );

    const checklistProgress = updates.checklistProgress
      ? normalizeChecklistProgress(updates.checklistProgress)
      : existingProfile.checklistProgress;

    const nextProfile = mergeUserProfile(userId, {
      ...existingProfile,
      ...updates,
      checklistProgress,
      readinessScore: calculateReadinessScore(checklistProgress),
      engagementPoints:
        typeof updates.engagementPoints === "number"
          ? updates.engagementPoints
          : existingProfile.engagementPoints,
      streakDays:
        typeof updates.streakDays === "number"
          ? updates.streakDays
          : existingProfile.streakDays,
    });

    await setDoc(
      userRef,
      {
        ...nextProfile,
        ...(userSnap.exists() ? {} : { createdAt: serverTimestamp() }),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      profile: nextProfile,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("PUT /api/user failed:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
