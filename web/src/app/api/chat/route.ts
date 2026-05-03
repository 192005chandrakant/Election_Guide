import { NextRequest, NextResponse } from "next/server";
import { CIVIC_AGENTS, getCivicAgent } from "@/lib/civic-agents";

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || "http://127.0.0.1:8000";

type ChatRequestBody = {
  query?: string;
  userId?: string;
  location?: string;
  isFirstTimeVoter?: boolean;
  language?: string;
  simpleMode?: boolean;
  agentMode?: string;
};

type StructuredChatResponse = {
  agent: {
    id: string;
    title: string;
    description: string;
    icon: string;
    promptFocus: string;
  };
  answer: string;
  summary: string;
  keyPoints: string[];
  nextSteps: string[];
  followUpQuestions: string[];
  actionSuggestions: Array<{ label: string; query: string }>;
  trust: {
    source: string;
    confidence: "high" | "medium" | "low";
    note: string;
  };
  disclaimer: string;
  speechText: string;
};

function isStructuredChatResponse(value: unknown): value is Omit<StructuredChatResponse, "agent"> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as Record<string, unknown>;
  return (
    typeof data.answer === "string" &&
    typeof data.summary === "string" &&
    Array.isArray(data.keyPoints) &&
    Array.isArray(data.nextSteps) &&
    Array.isArray(data.followUpQuestions) &&
    Array.isArray(data.actionSuggestions) &&
    typeof data.disclaimer === "string" &&
    typeof data.speechText === "string"
  );
}

export async function POST(request: NextRequest) {
  let body: ChatRequestBody = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { query, userId, location, isFirstTimeVoter, language, simpleMode, agentMode } = body;

  if (typeof query !== "string" || !query.trim()) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const requestedAgentMode = typeof agentMode === "string" ? agentMode.trim() : "";
  const hasValidAgentMode =
    requestedAgentMode.length === 0 || CIVIC_AGENTS.some((agent) => agent.id === requestedAgentMode);

  if (!hasValidAgentMode) {
    return NextResponse.json({ error: "Invalid agentMode provided" }, { status: 400 });
  }

  const agent = getCivicAgent(requestedAgentMode || undefined);
  const normalizedLanguage = language || "en";
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch(`${AGENT_SERVICE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        query: query.trim(),
        userId: userId || "anonymous",
        location: location || "Unknown",
        isFirstTimeVoter: isFirstTimeVoter ?? false,
        language: normalizedLanguage,
        simpleMode: simpleMode ?? false,
        agentMode: agent.id,
      }),
    });

    if (!response.ok) {
      let errorDetail = "Agent service error";
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || errorDetail;
      } catch {}
      throw new Error(errorDetail);
    }

    const data = await response.json();

    if (!isStructuredChatResponse(data)) {
      throw new Error("Agent service returned an unexpected response shape.");
    }

    // Merge active agent metadata for richer UI state.
    return NextResponse.json({
      ...data,
      agent,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    const isConnectionError =
      message.includes("fetch failed") ||
      message.includes("ECONNREFUSED") ||
      message.includes("aborted");

    return NextResponse.json(
      {
        error: isConnectionError
          ? "AI agent service is unreachable. Verify AGENT_SERVICE_URL and backend availability."
          : "Chat request failed while processing with the AI service.",
        details: message,
      },
      { status: 500 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
