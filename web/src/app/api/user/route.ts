import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/admin-firestore";
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
    const db = getAdminFirestore();
    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();

    const profile = mergeUserProfile(userId, userSnap.exists ? userSnap.data() : null);
    return NextResponse.json(profile);
  } catch (error) {
    console.error("GET /api/user failed:", error);
    return NextResponse.json(mergeUserProfile(userId, null), { status: 200 });
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

    const db = getAdminFirestore();
    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();
    const existingProfile = mergeUserProfile(
      userId,
      userSnap.exists ? userSnap.data() : null
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

    await userRef.set(
      {
        ...nextProfile,
        ...(userSnap.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      profile: nextProfile,
      persisted: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("PUT /api/user failed:", error);
    const fallbackProfile = mergeUserProfile(userId, {
      ...updates,
      checklistProgress: updates.checklistProgress
        ? normalizeChecklistProgress(updates.checklistProgress)
        : undefined,
    });

    return NextResponse.json({
      success: true,
      profile: fallbackProfile,
      persisted: false,
      warning: "Profile updated locally because Firestore was unavailable",
    });
  }
}
