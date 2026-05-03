import { NextRequest, NextResponse } from "next/server";

type ChecklistProgress = {
  registered: boolean;
  polling_place: boolean;
  id_ready: boolean;
  research: boolean;
  plan: boolean;
};

type NextStepsResponse = {
  steps: string[];
  source: string;
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const DEFAULT_CHECKLIST: ChecklistProgress = {
  registered: true,
  polling_place: false,
  id_ready: false,
  research: false,
  plan: false,
};

function normalizeChecklist(progress?: Partial<Record<string, unknown>>): ChecklistProgress {
  return {
    registered:
      typeof progress?.registered === "boolean"
        ? progress.registered
        : DEFAULT_CHECKLIST.registered,
    polling_place:
      typeof progress?.polling_place === "boolean"
        ? progress.polling_place
        : DEFAULT_CHECKLIST.polling_place,
    id_ready:
      typeof progress?.id_ready === "boolean"
        ? progress.id_ready
        : DEFAULT_CHECKLIST.id_ready,
    research:
      typeof progress?.research === "boolean"
        ? progress.research
        : DEFAULT_CHECKLIST.research,
    plan: typeof progress?.plan === "boolean" ? progress.plan : DEFAULT_CHECKLIST.plan,
  };
}

function getRuleBasedSteps(checklistProgress: ChecklistProgress): string[] {
  const steps: string[] = [];

  if (!checklistProgress.registered) {
    steps.push("Confirm your voter registration status and complete registration before the deadline.");
  }
  if (!checklistProgress.polling_place) {
    steps.push("Find your polling place now and save directions for Election Day.");
  }
  if (!checklistProgress.id_ready) {
    steps.push("Check the ID requirements and ensure you have your Aadhaar or Voter ID ready.");
  }
  if (!checklistProgress.research) {
    steps.push("Compare candidates on your top issues so your choices are clear.");
  }
  if (!checklistProgress.plan) {
    steps.push("Create a voting plan with date, time, transport, and reminders.");
  }

  if (!steps.length) {
    return [
      "You are fully prepared. Reconfirm your booth location one day before voting.",
      "Bring your required ID and any supporting documents.",
      "Invite one friend or family member to vote with you.",
    ];
  }

  return steps.slice(0, 3);
}

function buildFallbackResponse(checklistProgress: ChecklistProgress): NextStepsResponse {
  return {
    steps: getRuleBasedSteps(checklistProgress),
    source: "fallback",
  };
}

function buildPrompt(params: {
  userId: string;
  location: string;
  isFirstTimeVoter: boolean;
  language: string;
  simpleMode: boolean;
  checklistProgress: ChecklistProgress;
}) {
  const pendingItems = Object.entries(params.checklistProgress)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  const styleHint = params.simpleMode
    ? "Use very simple words and short sentences suitable for a teenager."
    : "Use plain, concise, professional language.";

  return `You are a non-partisan election readiness coach.

User context:
- User ID: ${params.userId}
- Location: ${params.location}
- First-time voter: ${params.isFirstTimeVoter}
- Language code: ${params.language}
- Pending checklist items: ${pendingItems.length ? pendingItems.join(", ") : "none"}

Requirements:
- ${styleHint}
- Generate exactly 3 short next-action steps.
- Focus on practical actions for the next 7 days.
- Keep each step under 20 words.
- Return ONLY valid JSON with this exact shape:
{
  "steps": ["step 1", "step 2", "step 3"]
}`;
}

function parseGeminiJson(rawText: string): string[] | null {
  const cleaned = rawText.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();

  try {
    const parsed = JSON.parse(cleaned) as { steps?: unknown };
    if (!Array.isArray(parsed.steps)) return null;

    const steps = parsed.steps
      .filter((step): step is string => typeof step === "string")
      .map((step) => step.trim())
      .filter(Boolean)
      .slice(0, 3);

    return steps.length ? steps : null;
  } catch {
    return null;
  }
}

async function generateNextStepsFromGemini(params: {
  userId: string;
  location: string;
  isFirstTimeVoter: boolean;
  language: string;
  simpleMode: boolean;
  checklistProgress: ChecklistProgress;
}): Promise<NextStepsResponse> {
  if (!GEMINI_API_KEY) {
    return buildFallbackResponse(params.checklistProgress);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

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
                text: "Generate the three next steps now.",
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.35,
          topP: 0.9,
          topK: 32,
          maxOutputTokens: 400,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      return buildFallbackResponse(params.checklistProgress);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("") || "";
    const steps = parseGeminiJson(text);

    if (!steps) {
      return buildFallbackResponse(params.checklistProgress);
    }

    return { steps, source: "gemini" };
  } catch {
    return buildFallbackResponse(params.checklistProgress);
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

  const checklistProgress = normalizeChecklist(body.checklistProgress as Partial<Record<string, unknown>>);

  return NextResponse.json(
    await generateNextStepsFromGemini({
      userId: typeof body.userId === "string" ? body.userId : "anonymous",
      location: typeof body.location === "string" ? body.location : "Unknown",
      isFirstTimeVoter:
        typeof body.isFirstTimeVoter === "boolean" ? body.isFirstTimeVoter : false,
      language: typeof body.language === "string" ? body.language : "en",
      simpleMode: typeof body.simpleMode === "boolean" ? body.simpleMode : false,
      checklistProgress,
    })
  );
}
