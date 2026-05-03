import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/admin-firestore";

const DEFAULT_HOME_CONTENT = {
  heroTitle: "Empower your vote in Indian elections.",
  heroDescription:
    "CivicGuide is your AI-powered election guide for voting readiness, verified information, booth navigation, candidate comparisons, accessibility support, and an offline voter kit—all designed for Indian elections.",
  quickActions: [
    {
      title: "Check readiness",
      description: "See what is done, what is missing, and what to do next.",
      href: "/dashboard",
    },
    {
      title: "Find your polling station",
      description: "Search your assigned booth and get directions quickly.",
      href: "/map",
    },
    {
      title: "Compare candidates",
      description: "Side-by-side candidate and party comparison by issue.",
      href: "/candidates",
    },
    {
      title: "Open voter's kit",
      description: "Keep offline checklist, documents, and voting day plan ready.",
      href: "/kit",
    },
  ],
  onboardingSteps: [
    {
      step: "01",
      title: "Set your profile",
      description:
        "Enter your state, constituency, voter experience, language preference, and accessibility needs.",
    },
    {
      step: "02",
      title: "Check your readiness",
      description:
        "Track voter registration, ID verification, polling station location, candidate research, and voting day prep.",
    },
    {
      step: "03",
      title: "Get smart guidance",
      description:
        "AI assistant recommends the next best action based on your progress and election timeline.",
    },
    {
      step: "04",
      title: "Stay prepared offline",
      description:
        "Download voter kits, printable checklists, and essential information for use without internet.",
    },
  ],
  supportPillars: [
    {
      title: "Quick information access",
      body:
        "Go directly from homepage to voter registration, booth finder, and candidate research—all India-specific.",
    },
    {
      title: "Election timeline awareness",
      body:
        "Stay updated on registration deadlines, nomination periods, and election dates relevant to your state.",
    },
    {
      title: "Plain Hindi & English",
      body:
        "Complex voting rules explained simply in both languages with examples from Indian elections.",
    },
    {
      title: "Offline voter kit",
      body:
        "Download and print essential information to vote without internet—critical for rural India.",
    },
  ],
};

export async function GET() {
  try {
    const db = getAdminFirestore();
    const ref = db.collection("platform_content").doc("home");
    const snap = await ref.get();

    if (!snap.exists) {
      await ref.set({
        ...DEFAULT_HOME_CONTENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return NextResponse.json({
        content: DEFAULT_HOME_CONTENT,
        source: "seeded",
      });
    }

    const data = snap.data();

    return NextResponse.json({
      content: {
        heroTitle: typeof data?.heroTitle === "string" ? data.heroTitle : DEFAULT_HOME_CONTENT.heroTitle,
        heroDescription:
          typeof data?.heroDescription === "string"
            ? data.heroDescription
            : DEFAULT_HOME_CONTENT.heroDescription,
        quickActions: Array.isArray(data?.quickActions) ? data.quickActions : DEFAULT_HOME_CONTENT.quickActions,
        onboardingSteps: Array.isArray(data?.onboardingSteps) ? data.onboardingSteps : DEFAULT_HOME_CONTENT.onboardingSteps,
        supportPillars: Array.isArray(data?.supportPillars) ? data.supportPillars : DEFAULT_HOME_CONTENT.supportPillars,
      },
      source: "firestore",
    });
  } catch (error) {
    console.error("GET /api/platform/home failed:", error);
    return NextResponse.json(
      {
        error: "Home content unavailable",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 503 }
    );
  }
}
