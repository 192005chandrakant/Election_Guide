import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getServerFirestore } from "@/lib/server-firestore";
import {
  calculateReadinessScore,
  mergeUserProfile,
} from "@/lib/user-profile";

type NotificationMutationAction = "read" | "dismiss" | "read_all";

type NotificationState = {
  readIds: string[];
  dismissedIds: string[];
};

// Mock notification templates based on user state
const NOTIFICATION_TEMPLATES = [
  {
    id: "reg_deadline",
    type: "urgent",
    title: "Registration Deadline Approaching",
    body: "Only 5 days left to register to vote! Don't miss your chance.",
    action: { label: "Register Now", href: "/guide" },
    triggerCondition: "registration_incomplete",
  },
  {
    id: "checklist_nudge",
    type: "reminder",
    title: "You're Almost Ready!",
    body: "You've completed 3 out of 5 tasks. Just 2 more to go!",
    action: { label: "View Checklist", href: "/dashboard" },
    triggerCondition: "checklist_partial",
  },
  {
    id: "booth_reminder",
    type: "info",
    title: "Have You Found Your Polling Station?",
    body: "Knowing your polling location ahead of time saves stress on Election Day.",
    action: { label: "Find Polling Station", href: "/map" },
    triggerCondition: "booth_not_found",
  },
  {
    id: "election_tomorrow",
    type: "urgent",
    title: "Election Day is Tomorrow!",
    body: "Make sure you have your ID ready and know where to go. You're prepared!",
    action: { label: "View Plan", href: "/dashboard" },
    triggerCondition: "election_eve",
  },
  {
    id: "candidate_research",
    type: "suggestion",
    title: "Research Your Candidates",
    body: "Compare candidates on the issues that matter most to you.",
    action: { label: "Compare Now", href: "/candidates" },
    triggerCondition: "research_incomplete",
  },
  {
    id: "civic_fact",
    type: "info",
    title: "Did You Know?",
    body: "India has the world's largest democratic exercise with over 1 million polling stations.",
    action: null,
    triggerCondition: "always",
  },
];

function parseElectionDate(electionDate: string | null | undefined): Date | null {
  if (!electionDate) {
    return null;
  }

  const parsed = new Date(electionDate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeNotificationState(value: unknown): NotificationState {
  if (!value || typeof value !== "object") {
    return { readIds: [], dismissedIds: [] };
  }

  const data = value as { readIds?: unknown; dismissedIds?: unknown };
  return {
    readIds: Array.isArray(data.readIds)
      ? data.readIds.filter((id): id is string => typeof id === "string" && id.trim().length > 0)
      : [],
    dismissedIds: Array.isArray(data.dismissedIds)
      ? data.dismissedIds.filter((id): id is string => typeof id === "string" && id.trim().length > 0)
      : [],
  };
}

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
    const profile = mergeUserProfile(
      userId,
      userSnap.exists() ? userSnap.data() : null
    );
    const notificationState = normalizeNotificationState(
      userSnap.exists() ? userSnap.data()?.notificationState : null
    );

    const score = calculateReadinessScore(profile.checklistProgress);
    const now = new Date();
    const electionDay = parseElectionDate(profile.electionDate);
    const daysToElection = electionDay
      ? Math.ceil((electionDay.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const notifications = NOTIFICATION_TEMPLATES.filter((template) => {
      if (template.triggerCondition === "always") return true;
      if (
        template.triggerCondition === "registration_incomplete" &&
        !profile.checklistProgress.registered
      ) {
        return true;
      }
      if (
        template.triggerCondition === "booth_not_found" &&
        !profile.checklistProgress.polling_place
      ) {
        return true;
      }
      if (
        template.triggerCondition === "research_incomplete" &&
        !profile.checklistProgress.research
      ) {
        return true;
      }
      if (
        template.triggerCondition === "checklist_partial" &&
        score < 100
      ) {
        return true;
      }
      if (
        template.triggerCondition === "election_eve" &&
        daysToElection !== null &&
        daysToElection >= 0 &&
        daysToElection <= 1
      ) {
        return true;
      }
      return false;
    }).map((template) => ({
      ...template,
      body:
        template.id === "checklist_nudge"
          ? `You've completed ${score}% of your readiness checklist. Keep going!`
          : template.body,
      timestamp: new Date().toISOString(),
      read: notificationState.readIds.includes(template.id),
    }));

    if (score === 100) {
      notifications.unshift({
        id: "ready_champion",
        type: "info",
        title: "You Are Election-Ready",
        body: "All checklist steps are complete. You're ready to vote with confidence.",
        action: { label: "Review Plan", href: "/dashboard" },
        triggerCondition: "checklist_complete",
        timestamp: new Date().toISOString(),
        read: notificationState.readIds.includes("ready_champion"),
      });
    }

    if (daysToElection !== null && daysToElection > 1 && daysToElection <= 7) {
      notifications.unshift({
        id: "election_week",
        type: "urgent",
        title: `Election Day in ${daysToElection} day${daysToElection === 1 ? "" : "s"}`,
        body: "This is the final week. Double-check your ID, route, and schedule now.",
        action: { label: "Open Dashboard", href: "/dashboard" },
        triggerCondition: "election_week",
        timestamp: new Date().toISOString(),
        read: notificationState.readIds.includes("election_week"),
      });
    }

    const visibleNotifications = notifications.filter(
      (notification) => !notificationState.dismissedIds.includes(notification.id)
    );

    return NextResponse.json({
      notifications: visibleNotifications,
      count: visibleNotifications.length,
      unreadCount: visibleNotifications.filter((n) => !n.read).length,
      readinessScore: score,
    });
  } catch (error) {
    console.error("GET /api/notifications failed:", error);
    return NextResponse.json(
      {
        error: "Notifications service unavailable",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 503 }
    );
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const userId = typeof body.userId === "string" ? body.userId.trim() : "";
  const action = body.action as NotificationMutationAction;
  const notificationId =
    typeof body.notificationId === "string" ? body.notificationId.trim() : "";

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  if (!["read", "dismiss", "read_all"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  if ((action === "read" || action === "dismiss") && !notificationId) {
    return NextResponse.json({ error: "notificationId is required for this action" }, { status: 400 });
  }

  try {
    const db = getServerFirestore();
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    const notificationState = normalizeNotificationState(
      userSnap.exists() ? userSnap.data()?.notificationState : null
    );

    if (action === "read" && notificationId) {
      if (!notificationState.readIds.includes(notificationId)) {
        notificationState.readIds.push(notificationId);
      }
    }

    if (action === "dismiss" && notificationId) {
      if (!notificationState.dismissedIds.includes(notificationId)) {
        notificationState.dismissedIds.push(notificationId);
      }
    }

    if (action === "read_all") {
      NOTIFICATION_TEMPLATES.forEach((template) => {
        if (!notificationState.readIds.includes(template.id)) {
          notificationState.readIds.push(template.id);
        }
      });
      ["ready_champion", "election_week"].forEach((id) => {
        if (!notificationState.readIds.includes(id)) {
          notificationState.readIds.push(id);
        }
      });
    }

    await setDoc(
      userRef,
      {
        notificationState,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true, action, notificationState });
  } catch (error) {
    console.error("POST /api/notifications failed:", error);
    return NextResponse.json(
      {
        error: "Notifications update failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
