import { NextResponse } from "next/server";
import { CIVIC_AGENTS } from "@/lib/civic-agents";

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const response = await fetch(`${AGENT_SERVICE_URL}/agents`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data?.agents) && data.agents.length > 0) {
        return NextResponse.json({
          agents: data.agents,
          source: "agent-service",
        });
      }
    }
  } catch (error) {
    console.warn("GET /api/agents falling back to local catalog:", error);
  }

  return NextResponse.json({
    agents: CIVIC_AGENTS,
    source: "local-catalog",
    warning: "Agent service unavailable. Using local catalog.",
  });
}
