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

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || "http://127.0.0.1:8000";

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

async function generateNextStepsFromGemini(params: {
  userId: string;
  location: string;
  isFirstTimeVoter: boolean;
  language: string;
  simpleMode: boolean;
  checklistProgress: ChecklistProgress;
}): Promise<NextStepsResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${AGENT_SERVICE_URL}/next-steps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        userId: params.userId,
        location: params.location,
        isFirstTimeVoter: params.isFirstTimeVoter,
        language: params.language,
        simpleMode: params.simpleMode,
        checklistProgress: params.checklistProgress,
      }),
    });

    if (!response.ok) {
      return buildFallbackResponse(params.checklistProgress);
    }

    const data = (await response.json()) as { steps?: unknown; source?: unknown };
    if (!Array.isArray(data.steps)) {
      return buildFallbackResponse(params.checklistProgress);
    }

    const steps = data.steps
      .filter((step): step is string => typeof step === "string")
      .map((step) => step.trim())
      .filter(Boolean)
      .slice(0, 3);

    if (!steps.length) {
      return buildFallbackResponse(params.checklistProgress);
    }

    while (steps.length < 3) {
      steps.push(getRuleBasedSteps(params.checklistProgress)[steps.length]);
    }

    return {
      steps: steps.slice(0, 3),
      source: typeof data.source === "string" ? data.source : "agent-service",
    };
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
