import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

type CandidateAnalysisRequest = {
  candidateNames: string[];
  issues: string[];
  location: string;
};

type CandidateAnalysisResponse = {
  analysis: string;
  source: string;
};

function buildPrompt(params: CandidateAnalysisRequest) {
  return `You are a neutral Indian election research assistant for the CivicGuide platform.

Location: ${params.location}
Candidates or Parties: ${params.candidateNames.join(", ")}
Issues to compare: ${params.issues.join(", ")}

Requirements:
- Be completely non-partisan and objective.
- Avoid endorsements, speculation, and personal opinions.
- Use Indian election terminology: constituency, Lok Sabha, State Assembly, ECI, manifesto.
- Structure clearly with markdown headings and bullet points.
- Help voters compare candidates on real issues that matter to them.
- Return ONLY valid JSON with this exact shape:
{
  "analysis": "markdown-formatted analysis",
  "summary": "one-sentence neutral summary",
  "source": "gemini",
  "confidence": "high|medium|low",
  "disclaimer": "short verification note referencing ECI"
}`;
}

function parseGeminiJson(rawText: string): CandidateAnalysisResponse | null {
  const cleaned = rawText.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();

  try {
    const parsed = JSON.parse(cleaned) as { analysis?: unknown; source?: unknown };
    if (typeof parsed.analysis !== "string" || !parsed.analysis.trim()) {
      return null;
    }

    return {
      analysis: parsed.analysis,
      source: typeof parsed.source === "string" ? parsed.source : "gemini",
    };
  } catch {
    return null;
  }
}

async function generateCandidateAnalysis(params: CandidateAnalysisRequest): Promise<CandidateAnalysisResponse> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: buildPrompt(params),
            },
          ],
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: "Generate the candidate comparison now.",
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.25,
          topP: 0.9,
          topK: 32,
          maxOutputTokens: 900,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API failed with status ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("") || "";
    const parsed = parseGeminiJson(text);

    if (!parsed) {
      throw new Error("Gemini returned invalid candidate analysis payload");
    }

    return parsed;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Candidate analysis failed");
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
      {
        error: "Candidate analysis service unavailable",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 503 }
    );
  }
}
