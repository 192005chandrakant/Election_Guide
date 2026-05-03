import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/admin-firestore";

type CandidateShowcase = {
  id: number;
  name: string;
  party: string;
  experience: string;
  image: string;
  gradient: string;
  stances: Record<string, { position: string; support: boolean }>;
};

const DEFAULT_CANDIDATES: CandidateShowcase[] = [
  {
    id: 1,
    name: "Rajesh Sharma",
    party: "Bharatiya Janata Party",
    experience: "MP, 10 yrs",
    image: "RS",
    gradient: "from-orange-500 via-orange-600 to-yellow-600",
    stances: {
      agriculture: { position: "Expand PM-KISAN subsidies by 20%", support: true },
      employment: { position: "Direct focus on 'Make in India' manufacturing", support: true },
      education: { position: "Implement National Education Policy fully", support: true },
      infrastructure: { position: "Speed up National Highway expansion", support: true },
    },
  },
  {
    id: 2,
    name: "Priya Desai",
    party: "Indian National Congress",
    experience: "Social Activist, 12 yrs",
    image: "PD",
    gradient: "from-blue-600 to-cyan-400",
    stances: {
      agriculture: { position: "Guarantee MSP legal status", support: true },
      employment: { position: "MNREGA wage hike and urban job guarantee", support: true },
      education: { position: "Scholarships for marginalized students", support: true },
      infrastructure: { position: "Focus on rural roads and digital connect", support: true },
    },
  },
  {
    id: 3,
    name: "Aarav Patel",
    party: "Aam Aadmi Party",
    experience: "Civil Servant, 8 yrs",
    image: "AP",
    gradient: "from-green-500 to-emerald-400",
    stances: {
      agriculture: { position: "Modernize irrigation systems", support: true },
      employment: { position: "Skill development centers in every block", support: true },
      education: { position: "Focus on government school quality", support: true },
      infrastructure: { position: "Expansion of metro networks in cities", support: true },
    },
  },
];

export async function GET() {
  try {
    const db = getAdminFirestore();
    const ref = db.collection("platform_content").doc("candidate_showcase");
    const snap = await ref.get();

    if (!snap.exists) {
      await ref.set({
        candidates: DEFAULT_CANDIDATES,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return NextResponse.json({
        candidates: DEFAULT_CANDIDATES,
        source: "seeded",
      });
    }

    const data = snap.data();
    const candidates = Array.isArray(data?.candidates) ? data.candidates : [];

    return NextResponse.json({
      candidates,
      source: "firestore",
    });
  } catch (error) {
    console.error("GET /api/platform/candidates failed:", error);
    return NextResponse.json(
      {
        error: "Candidate showcase data unavailable",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 503 }
    );
  }
}
