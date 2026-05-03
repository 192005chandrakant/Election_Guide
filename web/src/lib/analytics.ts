type CivicEventName =
  | "guide_viewed"
  | "guide_progress_seen"
  | "checklist_toggled"
  | "score_shared"
  | "level_progress_viewed";

type TrackEventInput = {
  eventName: CivicEventName;
  userId?: string;
  metadata?: Record<string, unknown>;
};

export function trackCivicEvent({ eventName, userId, metadata }: TrackEventInput) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = {
    eventName,
    userId,
    metadata: metadata ?? {},
    page: window.location.pathname,
    timestamp: new Date().toISOString(),
  };

  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      navigator.sendBeacon("/api/analytics", blob);
      return;
    }
  } catch {
    // Fall through to fetch.
  }

  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    // Analytics must never break the user experience.
  });
}
