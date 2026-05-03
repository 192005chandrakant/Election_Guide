import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/admin-firestore";

const DEFAULT_FACTS = [
  "Check your voter registration status on the NVSP (National Voter Services Portal) website.",
  "The Voter Helpline (1950) is the official way to find your assigned polling station and constituency details.",
  "Aadhaar, Voter ID, Passport, PAN Card, or Driving License are valid photo ID at polling stations.",
  "India is the world's largest democracy with over 900 million eligible voters.",
  "Check your constituency's candidate affidavits and details on the Election Commission of India (ECI) website.",
  "Advance voting is available for government employees, elderly citizens, and persons with disabilities.",
  "Postal voting is available for armed forces personnel and certain other categories.",
  "Electronic Voting Machines (EVMs) with VVPAT (voter-verified paper audit trails) ensure secure voting.",
];

export async function GET() {
  try {
    const db = getAdminFirestore();
    const ref = db.collection("platform_content").doc("dashboard_facts");
    const snap = await ref.get();

    if (!snap.exists) {
      await ref.set({
        facts: DEFAULT_FACTS,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return NextResponse.json({
        facts: DEFAULT_FACTS,
        source: "seeded",
      });
    }

    const data = snap.data();
    const facts = Array.isArray(data?.facts) ? data.facts.filter((f) => typeof f === "string") : [];

    return NextResponse.json({
      facts,
      source: "firestore",
    });
  } catch (error) {
    console.error("GET /api/platform/facts failed:", error);
    return NextResponse.json(
      {
        error: "Dashboard facts unavailable",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 503 }
    );
  }
}
