"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Trophy, FlameKindling, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import { Timeline } from "@/components/ui/timeline";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth-context";
import { getElectionTimeline } from "@/lib/election-timeline-data";
import { trackCivicEvent } from "@/lib/analytics";

type GuideReadiness = {
  score: number;
  items: {
    registered: boolean;
    polling_place: boolean;
    id_ready: boolean;
    research: boolean;
    plan: boolean;
  };
  location: string;
  isFirstTimeVoter: boolean;
  source: string;
};

type GuideNextSteps = {
  steps: string[];
  source: string;
};

const FALLBACK_NEXT_STEPS = [
  "Confirm your voter registration details and keep your EPIC or Aadhaar handy.",
  "Save your polling station location so you can leave early on voting day.",
  "Review the candidates and the issues that matter most to you.",
];

export default function GuidePage() {
  const { user } = useAuth();
  const timelineSteps = useMemo(() => getElectionTimeline(), []);
  const completedSteps = timelineSteps.filter((step) => step.status === "completed").length;
  const totalSteps = timelineSteps.length;
  const progressPercent =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const guideLevel = Math.max(1, Math.floor(progressPercent / 20) + 1);
  const guideMood =
    progressPercent >= 90
      ? "Election-ready"
      : progressPercent >= 60
      ? "On track"
      : progressPercent >= 30
      ? "Building momentum"
      : "Getting started";
  const userId = user?.uid || "demo";

  const [readiness, setReadiness] = useState<GuideReadiness | null>(null);
  const [nextSteps, setNextSteps] = useState<string[]>(FALLBACK_NEXT_STEPS);
  const [nextStepsSource, setNextStepsSource] = useState("fallback");
  const [contextLoading, setContextLoading] = useState(true);

  useEffect(() => {
    trackCivicEvent({
      eventName: "guide_viewed",
      userId,
      metadata: {
        steps: totalSteps,
      },
    });
  }, [totalSteps, userId]);

  useEffect(() => {
    trackCivicEvent({
      eventName: "guide_progress_seen",
      userId,
      metadata: {
        progressPercent,
        guideLevel,
      },
    });
  }, [progressPercent, guideLevel, userId]);

  useEffect(() => {
    let cancelled = false;

    const loadGuideContext = async () => {
      setContextLoading(true);

      try {
        const readinessResponse = await fetch(`/api/readiness?userId=${encodeURIComponent(userId)}`);
        const readinessData = readinessResponse.ok ? await readinessResponse.json() : null;

        if (!cancelled && readinessData) {
          setReadiness({
            score: typeof readinessData.score === "number" ? readinessData.score : progressPercent,
            items: readinessData.items ?? {
              registered: false,
              polling_place: false,
              id_ready: false,
              research: false,
              plan: false,
            },
            location: typeof readinessData.location === "string" ? readinessData.location : "Unknown",
            isFirstTimeVoter: readinessData.isFirstTimeVoter !== false,
            source: typeof readinessData.source === "string" ? readinessData.source : "unknown",
          });
        }

        const nextStepsResponse = await fetch("/api/next-steps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            location: typeof readinessData?.location === "string" ? readinessData.location : "Unknown",
            isFirstTimeVoter: readinessData?.isFirstTimeVoter !== false,
            language: "en",
            simpleMode: false,
            checklistProgress: readinessData?.items ?? {
              registered: false,
              polling_place: false,
              id_ready: false,
              research: false,
              plan: false,
            },
          }),
        });

        const nextStepsData: GuideNextSteps | null = nextStepsResponse.ok ? await nextStepsResponse.json() : null;

        if (!cancelled && nextStepsData) {
          setNextSteps(Array.isArray(nextStepsData.steps) && nextStepsData.steps.length > 0 ? nextStepsData.steps : FALLBACK_NEXT_STEPS);
          setNextStepsSource(typeof nextStepsData.source === "string" ? nextStepsData.source : "fallback");
        }
      } catch (error) {
        console.error("Failed to load guide context", error);
        if (!cancelled) {
          setNextSteps(FALLBACK_NEXT_STEPS);
          setNextStepsSource("fallback");
        }
      } finally {
        if (!cancelled) {
          setContextLoading(false);
        }
      }
    };

    void loadGuideContext();

    return () => {
      cancelled = true;
    };
  }, [userId, progressPercent]);

  return (
    <div className="min-h-screen bg-background pt-24 md:pt-28 pb-28 md:pb-8 px-4 md:px-8">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
      <div className="mx-auto max-w-4xl space-y-6 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 sm:items-center sm:gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl border border-primary/20 bg-primary/10 hover:bg-primary/15 hover:border-primary/30 sm:h-11 sm:w-11">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-primary via-secondary to-accent">Voting Guide</h1>
            <p className="text-muted-foreground mt-0.5">Your step-by-step journey from registration to ballot.</p>
          </div>
        </motion.div>

        {/* Readiness Snapshot */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <Card className="rounded-2xl border border-border/60 bg-card/80 shadow-sm backdrop-blur">
            <CardContent className="grid gap-4 p-4 md:grid-cols-[1.2fr_0.8fr] md:items-center">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="border-primary/30 bg-primary/10 text-primary">
                    <Sparkles className="mr-1 h-3.5 w-3.5" /> {contextLoading ? "Loading your plan" : `Source: ${nextStepsSource}`}
                  </Badge>
                  <Badge variant="outline" className="border-border/70">
                    <MapPin className="mr-1 h-3.5 w-3.5" /> {readiness?.location || "Location pending"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {readiness ? `${readiness.score}% readiness from backend` : "Personalized readiness snapshot"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {readiness
                      ? readiness.isFirstTimeVoter
                        ? "Your guide content is being tailored for a first-time voter flow."
                        : "Your guide content is being tailored to your current voting progress."
                      : "We are checking your profile and generating the next best actions."}
                  </p>
                </div>
                <Progress value={readiness?.score ?? progressPercent} className="h-2.5" aria-label="Voting readiness progress" />
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Next actions</p>
                <ul className="mt-3 space-y-2 text-sm text-foreground">
                  {nextSteps.slice(0, 3).map((step) => (
                    <li key={step} className="flex gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress Summary */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="gradient-card-primary rounded-2xl border-0 overflow-hidden">
            <CardContent className="grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="flex items-center gap-3 min-w-0">
                <motion.div whileHover={{ scale: 1.1 }} className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
                  <FileText className="h-5 w-5" />
                </motion.div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{completedSteps} of {totalSteps} steps completed</p>
                  <p className="text-xs text-muted-foreground">{guideMood}. Keep completing steps to unlock higher guide levels.</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <Badge className="border-primary/30 bg-primary/20 text-primary">
                  <FlameKindling className="mr-1 h-3.5 w-3.5" /> Level {guideLevel}
                </Badge>
                <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className="rounded-full bg-primary/10 px-4 py-2">
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    <Trophy className="mr-1 h-3.5 w-3.5" /> {progressPercent}%
                  </Badge>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

          {/* Steps */}
          <Timeline steps={timelineSteps} compact />
      </div>
    </div>
  );
}
