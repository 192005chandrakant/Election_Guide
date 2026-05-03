export type ChecklistProgress = {
  registered: boolean;
  polling_place: boolean;
  id_ready: boolean;
  research: boolean;
  plan: boolean;
};

export type StoredUserProfile = {
  uid: string;
  email: string | null;
  location: string;
  isFirstTimeVoter: boolean;
  electionDate?: string | null;
  readinessScore: number;
  engagementPoints: number;
  streakDays: number;
  language: string;
  simpleMode: boolean;
  highContrast: boolean;
  voiceEnabled: boolean;
  checklistProgress: ChecklistProgress;
};

export const DEFAULT_CHECKLIST: ChecklistProgress = {
  registered: true,
  polling_place: false,
  id_ready: false,
  research: false,
  plan: false,
};

export function getDefaultUserProfile(uid: string): StoredUserProfile {
  return {
    uid,
    email: null,
    location: "Unknown",
    isFirstTimeVoter: true,
    electionDate: null,
    readinessScore: calculateReadinessScore(DEFAULT_CHECKLIST),
    engagementPoints: 180,
    streakDays: 3,
    language: "en",
    simpleMode: false,
    highContrast: false,
    voiceEnabled: false,
    checklistProgress: { ...DEFAULT_CHECKLIST },
  };
}

export function normalizeChecklistProgress(
  raw: Partial<Record<keyof ChecklistProgress, unknown>> | undefined
): ChecklistProgress {
  if (!raw) {
    return { ...DEFAULT_CHECKLIST };
  }

  return {
    registered:
      typeof raw.registered === "boolean"
        ? raw.registered
        : DEFAULT_CHECKLIST.registered,
    polling_place:
      typeof raw.polling_place === "boolean"
        ? raw.polling_place
        : DEFAULT_CHECKLIST.polling_place,
    id_ready:
      typeof raw.id_ready === "boolean"
        ? raw.id_ready
        : DEFAULT_CHECKLIST.id_ready,
    research:
      typeof raw.research === "boolean"
        ? raw.research
        : DEFAULT_CHECKLIST.research,
    plan: typeof raw.plan === "boolean" ? raw.plan : DEFAULT_CHECKLIST.plan,
  };
}

export function calculateReadinessScore(checklist: ChecklistProgress): number {
  const entries = Object.values(checklist);
  const completed = entries.filter(Boolean).length;
  return Math.round((completed / entries.length) * 100);
}

export function mergeUserProfile(
  uid: string,
  raw: Partial<Record<keyof StoredUserProfile, unknown>> | null | undefined
): StoredUserProfile {
  const defaults = getDefaultUserProfile(uid);
  const checklist = normalizeChecklistProgress(
    (raw?.checklistProgress as Partial<Record<keyof ChecklistProgress, unknown>>) ||
      undefined
  );

  const readinessScore =
    typeof raw?.readinessScore === "number"
      ? raw.readinessScore
      : calculateReadinessScore(checklist);

  return {
    uid,
    email: typeof raw?.email === "string" || raw?.email === null ? raw.email : defaults.email,
    location: typeof raw?.location === "string" ? raw.location : defaults.location,
    isFirstTimeVoter:
      typeof raw?.isFirstTimeVoter === "boolean"
        ? raw.isFirstTimeVoter
        : defaults.isFirstTimeVoter,
    electionDate:
      typeof raw?.electionDate === "string" || raw?.electionDate === null
        ? raw.electionDate
        : defaults.electionDate,
    readinessScore,
    engagementPoints:
      typeof raw?.engagementPoints === "number"
        ? raw.engagementPoints
        : defaults.engagementPoints,
    streakDays:
      typeof raw?.streakDays === "number" ? raw.streakDays : defaults.streakDays,
    language: typeof raw?.language === "string" ? raw.language : defaults.language,
    simpleMode:
      typeof raw?.simpleMode === "boolean" ? raw.simpleMode : defaults.simpleMode,
    highContrast:
      typeof raw?.highContrast === "boolean"
        ? raw.highContrast
        : defaults.highContrast,
    voiceEnabled:
      typeof raw?.voiceEnabled === "boolean"
        ? raw.voiceEnabled
        : defaults.voiceEnabled,
    checklistProgress: checklist,
  };
}
