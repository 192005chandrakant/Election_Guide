import { NextRequest, NextResponse } from "next/server";

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || "http://127.0.0.1:8000";

type CandidateAnalysisRequest = {
  candidateNames: string[];
  issues: string[];
  location: string;
};

type CandidateAnalysisResponse = {
  analysis: string;
  source: string;
};

function buildFallbackAnalysis(params: CandidateAnalysisRequest): CandidateAnalysisResponse {
  return {
    analysis:
      `Gemini was unavailable, so compare ${params.candidateNames.join(", ")} using official manifestos, affidavits, and ECI disclosures. ` +
      `Focus on ${params.issues.join(", ") || "your priority issues"} and verify every factual claim before deciding.`,
    source: "fallback",
  };
}

async function generateCandidateAnalysis(params: CandidateAnalysisRequest): Promise<CandidateAnalysisResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(`${AGENT_SERVICE_URL}/analyze-candidates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        candidateNames: params.candidateNames,
        issues: params.issues,
        location: params.location,
      }),
    });

    if (!response.ok) {
      return buildFallbackAnalysis(params);
    }

    const data = (await response.json()) as { analysis?: unknown; source?: unknown };
    if (typeof data.analysis !== "string" || !data.analysis.trim()) {
      return buildFallbackAnalysis(params);
    }

    return {
      analysis: data.analysis,
      source: typeof data.source === "string" ? data.source : "agent-service",
    };
  } catch {
    return buildFallbackAnalysis(params);
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const candidateNames = Array.isArray(body.candidateNames)
    ? body.candidateNames.filter((name): name is string => typeof name === "string" && name.trim().length > 0)
    : [];

  const issues = Array.isArray(body.issues)
    ? body.issues.filter((issue): issue is string => typeof issue === "string" && issue.trim().length > 0)
    : [];

  const location = typeof body.location === "string" && body.location.trim().length > 0 ? body.location : "Unknown";

  if (candidateNames.length < 2) {
    return NextResponse.json({ error: "Please provide at least two candidate names." }, { status: 400 });
  }

  try {
    return NextResponse.json(
      await generateCandidateAnalysis({
        candidateNames,
        issues,
        location,
      })
    );
  } catch (error) {
    return NextResponse.json(
      buildFallbackAnalysis({
        candidateNames,
        issues,
        location,
      })
    );
  }
}
