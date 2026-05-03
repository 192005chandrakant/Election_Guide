export type CivicAgent = {
  id: string;
  title: string;
  description: string;
  icon: string;
  promptFocus: string;
  systemRole: string;
};

export const CIVIC_AGENTS: CivicAgent[] = [
  {
    id: "guide",
    title: "Voter Guide Agent",
    description: "Explains ECI registration, valid IDs, voting deadlines, and step-by-step voting process.",
    icon: "book-open",
    promptFocus: "Provide practical, context-aware Indian election guidance in plain language.",
    systemRole: "Concise non-partisan Indian election guide",
  },
  {
    id: "readiness",
    title: "Voter Readiness Engine",
    description: "Tracks voter preparation progress and recommends next actions to ensure readiness.",
    icon: "radar",
    promptFocus: "Identify readiness gaps and recommend the most critical next step.",
    systemRole: "Voter preparation strategist",
  },
  {
    id: "booth",
    title: "Polling Station Finder",
    description: "Helps locate assigned polling station, plan transport, and prepare for voting day.",
    icon: "map-pin",
    promptFocus: "Help users find their polling station and plan logistics to get there.",
    systemRole: "Polling station and logistics guide",
  },
  {
    id: "candidate",
    title: "Candidate Comparison Agent",
    description: "Provides neutral issue-by-issue candidate and party comparisons without endorsements.",
    icon: "users",
    promptFocus: "Compare candidates and parties on key issues neutrally and objectively.",
    systemRole: "Neutral candidate and party research analyst",
  },
  {
    id: "trust",
    title: "Information Verification Agent",
    description: "Verifies source quality, flags official vs. fallback data, and ensures accuracy.",
    icon: "shield-check",
    promptFocus: "Explain information sources, confidence levels, and verification methods.",
    systemRole: "Election information verification and credibility specialist",
  },
  {
    id: "accessibility",
    title: "Inclusive Access Agent",
    description: "Simplifies language, supports voice assistance, and guides voters with access needs.",
    icon: "accessibility",
    promptFocus: "Make all election guidance inclusive, simple, and accessible for all voters.",
    systemRole: "Accessible and inclusive civic guidance specialist",
  },
  {
    id: "offline",
    title: "Voter Kit Agent",
    description: "Creates printable offline checklists, ID reminders, and voting-day resource kits.",
    icon: "wifi-off",
    promptFocus: "Build offline-ready voter resources and printable election-day kits.",
    systemRole: "Offline election preparation and kit planner",
  },
  {
    id: "reminder",
    title: "Smart Notification Agent",
    description: "Sends timely reminders for registration, ID prep, booth verification, and voting day.",
    icon: "bell",
    promptFocus: "Create respectful, timely reminders that increase voter preparedness.",
    systemRole: "Voter engagement and reminder coach",
  },
];

export function getCivicAgent(mode: string | undefined) {
  return CIVIC_AGENTS.find((agent) => agent.id === mode) || CIVIC_AGENTS[0];
}
