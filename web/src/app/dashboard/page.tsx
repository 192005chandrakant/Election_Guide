"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  CheckCircle2,
  Navigation,
  Zap,
  Trophy,
  Flame,
  Sparkles,
  Users,
  Share2,
  Check,
  Loader2,
  Star,
  FlameKindling,
  Target,
  Award,
  ArrowUpRight,
  Volume2,
  CalendarPlus,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useAppSettings } from "@/lib/settings-context";
import { downloadICS, generateICS } from "@/lib/calendar";
import { TrustStrip } from "@/components/civic-ui";
import { PremiumCivicShowcase } from "@/components/premium-civic-components";

const INITIAL_CHECKLIST = [
  { id: "registered", label: "Registered as Voter (ECI)", completed: true },
  { id: "polling_place", label: "Found Polling Station", completed: false },
  { id: "id_ready", label: "Verified Valid ID (Aadhaar/Voter ID)", completed: false },
  { id: "research", label: "Researched Candidates & Parties", completed: false },
  { id: "plan", label: "Planned Voting Day Route", completed: false },
];

const BADGES = [
  { id: "registered", label: "Registered Voter", icon: CheckCircle2, color: "bg-linear-to-r from-green-600/20 to-emerald-600/10 text-emerald-400 border border-emerald-500/30" },
  { id: "explorer", label: "Booth Explorer", icon: MapPin, color: "bg-linear-to-r from-blue-600/20 to-sky-600/10 text-blue-400 border border-blue-500/30" },
  { id: "informed", label: "Informed Citizen", icon: Users, color: "bg-linear-to-r from-teal-600/20 to-cyan-600/10 text-teal-400 border border-teal-500/30" },
  { id: "champion", label: "Vote Champion", icon: Trophy, color: "bg-linear-to-r from-amber-600/20 to-yellow-600/10 text-amber-300 border border-amber-500/30" },
];

const toChecklistProgress = (items: typeof INITIAL_CHECKLIST) =>
  items.reduce(
    (acc, item) => {
      acc[item.id as keyof typeof acc] = item.completed;
      return acc;
    },
    {
      registered: false,
      polling_place: false,
      id_ready: false,
      research: false,
      plan: false,
    }
  );

const fromChecklistProgress = (progress: Partial<Record<string, boolean>>) =>
  INITIAL_CHECKLIST.map((item) => ({
    ...item,
    completed:
      typeof progress[item.id] === "boolean"
        ? Boolean(progress[item.id])
        : item.completed,
  }));

type TimelineEvent = {
  date: Date;
  title: string;
  color: string;
};

function buildTimelineEvents(electionDate: string | null): TimelineEvent[] {
  if (!electionDate) {
    return [];
  }

  const votingDay = new Date(electionDate);
  if (Number.isNaN(votingDay.getTime())) {
    return [];
  }

  const registrationStart = new Date(votingDay);
  registrationStart.setDate(registrationStart.getDate() - 45);

  const finalNominationDay = new Date(votingDay);
  finalNominationDay.setDate(finalNominationDay.getDate() - 9);

  return [
    { date: registrationStart, title: "Registration Starts", color: "text-primary" },
    { date: finalNominationDay, title: "Final Nomination Day", color: "text-blue-400" },
    { date: votingDay, title: "VOTING DAY 🗳️", color: "text-muted-foreground" },
  ];
}

function Timeline({ electionDate }: { electionDate: string | null }) {
  const now = new Date();
  const timelineEvents = buildTimelineEvents(electionDate);

  if (!timelineEvents.length) {
    return (
      <Card className="gradient-card-secondary rounded-2xl md:rounded-3xl border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-secondary" /> Election Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add your election date in Settings to see a personalized timeline.
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalDays = Math.max(
    timelineEvents[timelineEvents.length - 1].date.getTime() - timelineEvents[0].date.getTime(),
    1
  );
  const elapsedDays = now.getTime() - timelineEvents[0].date.getTime();
  const progress = Math.max(0, Math.min(100, (elapsedDays / totalDays) * 100));

  return (
    <Card className="gradient-card-secondary rounded-2xl md:rounded-3xl border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="w-4 h-4 text-secondary" /> Election Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative w-full h-1 bg-muted/30 rounded-full overflow-hidden">
          <motion.div className="absolute h-1 bg-linear-to-r from-primary via-secondary to-accent rounded-full" style={{ width: `${progress}%` }} />
          <motion.div className="absolute h-3 w-3 bg-linear-to-r from-primary via-secondary to-accent rounded-full -top-1" style={{ left: `${progress}%`, transform: "translateX(-50%)" }} />
        </div>
        <div className="space-y-4">
          {timelineEvents.map((event, index) => (
            <motion.div key={index} whileHover={{ x: 2 }} className="flex items-center gap-3 group">
              <div className={`h-2 w-2 rounded-full shrink-0 transition-all ${event.date < now ? "bg-linear-to-r from-primary to-secondary" : "bg-muted/50"}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${event.color} truncate`}>{event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                <p className="text-xs text-muted-foreground truncate">{event.title}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-secondary opacity-0 group-hover:opacity-100 transition-all"
                onClick={() => {
                  const startDate = new Date(event.date);
                  // Default to all-day event or standard hours
                  startDate.setHours(9, 0, 0); 
                  const endDate = new Date(event.date);
                  endDate.setHours(17, 0, 0);
                  
                  const icsData = generateICS({
                    title: event.title,
                    description: "Event via CivicGuide.",
                    startDate,
                    endDate,
                  });
                  downloadICS("election-event", icsData);
                }}
                title="Add to Calendar"
              >
                <CalendarPlus className="h-3.5 w-3.5" />
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const { user } = useAuth();
  const { speak, voiceEnabled, language, simpleMode } = useAppSettings();
  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);
  const [location, setLocation] = useState("Unknown");
  const [electionDate, setElectionDate] = useState<string | null>(null);
  const [isFirstTimeVoter, setIsFirstTimeVoter] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [serverScore, setServerScore] = useState<number | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [aiSteps, setAiSteps] = useState<string[]>([]);
  const [loadingAiSteps, setLoadingAiSteps] = useState(false);
  const [confettiDismissed, setConfettiDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [engagementPoints, setEngagementPoints] = useState(180);
  const [streakDays, setStreakDays] = useState(3);
  const [platformFacts, setPlatformFacts] = useState<string[]>([]);

  const displayName = user?.displayName?.split(" ")[0] || "Voter";
  const score = useMemo(() => {
    const completedCount = checklist.filter((item) => item.completed).length;
    return Math.round((completedCount / checklist.length) * 100);
  }, [checklist]);
  const displayScore = serverScore ?? score;
  const randomFact = platformFacts.length
    ? platformFacts[new Date().getDate() % platformFacts.length]
    : "Loading civic facts from Firestore...";
  const showConfetti = score === 100 && profileLoaded && !confettiDismissed;

  useEffect(() => {
    const userId = user?.uid || "demo";
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const response = await fetch(
          `/api/user?userId=${encodeURIComponent(userId)}`
        );
        if (!response.ok) {
          return;
        }

        const profile = await response.json();
        if (cancelled) {
          return;
        }

        setChecklist(fromChecklistProgress(profile.checklistProgress || {}));
        if (typeof profile.readinessScore === "number") {
          setServerScore(Number(profile.readinessScore));
        }
        setLocation(profile.location || "Unknown");
        setElectionDate(typeof profile.electionDate === "string" ? profile.electionDate : null);
        setIsFirstTimeVoter(Boolean(profile.isFirstTimeVoter));
        setEngagementPoints(Number(profile.engagementPoints) || 180);
        setStreakDays(Number(profile.streakDays) || 3);
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        if (!cancelled) {
          setProfileLoaded(true);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  useEffect(() => {
    let cancelled = false;

    const loadFacts = async () => {
      try {
        const response = await fetch("/api/platform/facts");
        if (!response.ok || cancelled) {
          return;
        }

        const data = await response.json();
        const facts = Array.isArray(data.facts)
          ? data.facts.filter((fact: unknown): fact is string => typeof fact === "string" && fact.trim().length > 0)
          : [];

        if (!cancelled) {
          setPlatformFacts(facts);
        }
      } catch {
        // Keep the loading placeholder if Firestore facts are unavailable.
      }
    };

    loadFacts();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (score === 100 && profileLoaded && voiceEnabled) {
      speak("Congratulations! You've reached 100% readiness. You're a Vote Champion!");
    }
  }, [score, voiceEnabled, speak, profileLoaded]);

  const saveChecklist = async (nextChecklist: typeof INITIAL_CHECKLIST) => {
    setIsSyncing(true);
    try {
      await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid || "demo",
          checklistProgress: toChecklistProgress(nextChecklist),
          location,
          isFirstTimeVoter,
          engagementPoints,
          streakDays,
        }),
      });
    } catch (error) {
      console.error("Failed to sync checklist", error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (!profileLoaded) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoadingAiSteps(true);
      try {
        const response = await fetch("/api/next-steps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?.uid || "demo",
            location,
            isFirstTimeVoter,
            language,
            simpleMode,
            checklistProgress: toChecklistProgress(checklist),
          }),
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (Array.isArray(data.steps)) {
          setAiSteps(data.steps.slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to fetch AI next steps", error);
      } finally {
        setLoadingAiSteps(false);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [
    checklist,
    isFirstTimeVoter,
    language,
    location,
    profileLoaded,
    simpleMode,
    user?.uid,
  ]);

  const toggleChecklist = (id: string) => {
    setChecklist((prev) => {
      const nextChecklist = prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      );
      setConfettiDismissed(false);
      void saveChecklist(nextChecklist);
      return nextChecklist;
    });
  };

  const handleShare = useCallback(async () => {
    const text = `🗳️ My CivicGuide Voter Readiness Score: ${score}%!\n\nI'm getting ready for Election Day. Are you? Check your readiness at CivicGuide.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Voter Readiness Score", text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [score]);

  const earnedBadges = BADGES.filter((_, i) => {
    const completed = checklist.filter((c) => c.completed).length;
    return i < completed;
  });
  const level = Math.max(1, Math.floor(engagementPoints / 100) + 1);
  const pointsToNextLevel = 100 - (engagementPoints % 100);
  const completionCount = checklist.filter((c) => c.completed).length;
  const questProgress = Math.round((completionCount / checklist.length) * 100);
  const questLabel =
    questProgress === 100
      ? "Mission complete"
      : questProgress >= 80
      ? "Final stretch"
      : questProgress >= 40
      ? "Making progress"
      : "Starting out";

  return (
    <div className="min-h-screen bg-background pt-24 md:pt-28 pb-28 md:pb-8 px-4 md:px-8 overflow-hidden relative">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 civic-field" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <PremiumCivicShowcase />

        <Card className="gradient-card-primary rounded-2xl md:rounded-3xl overflow-hidden border-0">
          <CardContent className="p-5 md:p-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr] items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary status-pulse">
                <Star className="h-3.5 w-3.5" /> Civic XP Level {level}
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Your vote-ready journey is in motion.
                </h2>
                <p className="text-muted-foreground mt-1 max-w-2xl">
                  Earn XP, extend your streak, and finish your civic mission to become fully election-ready.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <motion.div whileHover={{ scale: 1.05 }} className="gradient-card-accent rounded-2xl border-0 px-4 py-3 flex items-center gap-3 cursor-pointer">
                  <FlameKindling className="h-5 w-5 text-orange-400" />
                  <div>
                    <p className="text-xs text-muted-foreground">Streak</p>
                    <p className="font-semibold">{streakDays} day{streakDays === 1 ? "" : "s"}</p>
                  </div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} className="gradient-card-secondary rounded-2xl border-0 px-4 py-3 flex items-center gap-3 cursor-pointer">
                  <Award className="h-5 w-5 text-amber-400" />
                  <div>
                    <p className="text-xs text-muted-foreground">XP</p>
                    <p className="font-semibold">{engagementPoints} points</p>
                  </div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} className="gradient-card-primary rounded-2xl border-0 px-4 py-3 flex items-center gap-3 cursor-pointer">
                  <Target className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-xs text-muted-foreground">Next level</p>
                    <p className="font-semibold">{pointsToNextLevel} pts away</p>
                  </div>
                </motion.div>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} className="gradient-card-secondary rounded-[1.5rem] border-0 p-4 md:p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Mission progress</p>
                  <p className="font-semibold">{questLabel}</p>
                </div>
                <div className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                  {questProgress}%
                </div>
              </div>
              <Progress value={questProgress} className="h-3 mb-4" />
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: "Checklist", value: `${completionCount}/5 complete`, icon: CheckCircle2 },
                  { label: "Rank", value: `Level ${level}`, icon: ArrowUpRight },
                ].map((item) => (
                  <div key={item.label} className="gradient-card-primary rounded-2xl border-0 p-3">
                    <item.icon className="h-4 w-4 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="font-semibold mt-1">{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </CardContent>
        </Card>

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Welcome back, {displayName} 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your progress and get ready for Election Day.
            </p>
          </div>
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className="px-3 py-1.5 border-white/10 bg-white/3 backdrop-blur-md gap-1.5"
            >
              <MapPin className="w-3 h-3 text-blue-400" /> {location}
            </Badge>
            <Badge className="px-3 py-1.5 bg-primary/15 text-primary border-primary/25 gap-1.5">
              <Sparkles className="w-3 h-3" /> {isFirstTimeVoter ? "First-Time Voter" : "Returning Voter"}
            </Badge>
          </div>
        </header>

        <TrustStrip
          source="Your checklist, profile preferences, official election guidance, and transparent AI next-step generation"
          updated={`Readiness score recalculated at ${score}%`}
        />

        {/* Daily Fact */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="gradient-card-accent rounded-2xl border-0 overflow-hidden">
            <CardContent className="flex items-start gap-4 p-4">
              <motion.div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/25 text-accent" whileHover={{ scale: 1.1 }}>
                <Zap className="h-5 w-5" />
              </motion.div>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-0.5">
                  Daily Civic Tip
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {randomFact}
                </p>
              </div>
              {voiceEnabled && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-accent hover:text-accent/80 hover:bg-accent/10 shrink-0"
                  onClick={() => speak(randomFact)}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── Readiness Score + Checklist ─── */}
          <Card className="gradient-card-primary rounded-2xl md:rounded-3xl border-0 overflow-hidden relative">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-primary animate-bounce-soft" /> Voting Readiness Score
              </CardTitle>
              <CardDescription>
                Complete all tasks to earn the Vote Champion badge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score Bar */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Progress value={displayScore} className="h-3" />
                </div>
                <motion.span
                  key={displayScore}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary via-secondary to-accent min-w-16 text-right"
                >
                  {displayScore}%
                </motion.span>
              </div>

              {/* Share Score */}
              <Button
                onClick={handleShare}
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl border-primary/30 bg-primary/10 hover:bg-primary/15 text-sm transition-all duration-300"
              >
                {copied
                  ? <><Check className="h-4 w-4 text-green-400" /> Copied to clipboard!</>
                  : <><Share2 className="h-4 w-4" /> Share My Score</>}
              </Button>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: Star, label: "XP Earned", value: `${engagementPoints}`, color: 'gradient-card-primary' },
                  { icon: FlameKindling, label: "Streak", value: `${streakDays} days`, color: 'gradient-card-accent' },
                  { icon: Trophy, label: "Level", value: `${level}`, color: 'gradient-card-secondary' },
                ].map((stat) => (
                  <motion.div key={stat.label} whileHover={{ y: -4 }} className={`${stat.color} rounded-2xl border-0 p-4`}>
                    <stat.icon className="h-4 w-4 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-lg font-semibold mt-1">{stat.value}</p>
                  </motion.div>
                ))}
              </div>

              {isSyncing && (
                <motion.p animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Syncing your progress...
                </motion.p>
              )}


              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="text-primary h-4 w-4" /> Action Checklist
                </h3>
                {checklist.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className={`flex items-center space-x-3 p-3.5 rounded-xl transition-all duration-200 cursor-pointer interactive-card ${
                      item.completed
                        ? "gradient-card-primary border-0"
                        : "gradient-card-secondary border-0 hover:shadow-lg"
                    }`}
                    onClick={() => toggleChecklist(item.id)}
                  >
                    <Checkbox
                      id={item.id}
                      checked={item.completed}
                      onCheckedChange={() => toggleChecklist(item.id)}
                      className="h-5 w-5 rounded-md"
                    />
                    <label
                      htmlFor={item.id}
                      className={`text-sm font-medium leading-none cursor-pointer flex-1 transition-colors ${
                        item.completed
                          ? "text-muted-foreground line-through"
                          : ""
                      }`}
                    >
                      {item.label}
                    </label>
                    {item.completed && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Badges Section */}
              <div className="pt-4 border-t border-foreground/10">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Trophy className="text-amber-400 h-4 w-4 animate-bounce-soft" /> Earned Badges
                </h3>
                <div className="flex flex-wrap gap-3">
                  {BADGES.map((badge, i) => {
                    const earned = i < earnedBadges.length;
                    return (
                      <motion.div
                        key={badge.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all interactive-card ${
                          earned
                            ? "gradient-card-accent border-0"
                            : "bg-foreground/5 border border-foreground/10 opacity-40"
                        }`}
                      >
                        <badge.icon className={`h-4 w-4 ${earned ? "text-accent" : "text-muted-foreground"}`} />
                        {badge.label}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </CardContent>

            {/* 100% Overlay */}
            <AnimatePresence>
              {showConfetti && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 z-20"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="gradient-card-primary rounded-full p-6 mb-6 border-0"
                  >
                    <Trophy className="w-14 h-14 text-primary" />
                  </motion.div>
                  <h2 className="text-3xl font-bold mb-2">
                    🎉 You&apos;re 100% Ready!
                  </h2>
                  <p className="text-muted-foreground max-w-sm mb-6">
                    You&apos;ve completed all preparation steps. You&apos;ve earned the
                    Vote Champion badge! Go make your voice heard.
                  </p>
                  <Button
                    onClick={() => setConfettiDismissed(true)}
                    variant="outline"
                    className="border-primary/30 bg-primary/10 hover:bg-primary/15"
                  >
                    Back to Dashboard
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* ─── Sidebar ─── */}
          <div className="space-y-6">
            <Card className="border-white/6 bg-white/2 backdrop-blur-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" /> AI Next Steps
                  </div>
                  {voiceEnabled && aiSteps.length > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => speak("Here are your next steps: " + aiSteps.join(". "))}
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  Personalized actions to improve your readiness this week.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAiSteps ? (
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating your plan...
                  </p>
                ) : aiSteps.length > 0 ? (
                  <ol className="space-y-2 text-sm text-muted-foreground list-decimal pl-4">
                    {aiSteps.map((step, idx) => (
                      <li key={`${idx}-${step}`}>{step}</li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Start checking items to get personalized AI guidance.
                  </p>
                )}
              </CardContent>
            </Card>

            <Timeline electionDate={electionDate} />

            {/* Polling Booth CTA */}
            <Card className="border-white/6 bg-linear-to-br from-cyan-900/20 to-sky-900/20 backdrop-blur-xl overflow-hidden group">
              <CardContent className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400 mb-3 group-hover:bg-blue-500/25 transition-colors">
                  <Navigation className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-1">Find Your Booth</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Locate your nearest polling station and get navigation
                  directions.
                </p>
                <Link href="/map">
                  <Button className="w-full rounded-xl gap-2" variant="secondary">
                    <MapPin className="h-4 w-4" /> Open Map
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Interactive Ballot CTA */}
            <Link href="/ballot" className="block">
              <Card className="border-white/6 bg-white/2 backdrop-blur-xl hover:bg-white/4 hover:border-white/10 transition-all cursor-pointer group">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400 group-hover:bg-orange-500/25 transition-colors">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-0.5">
                      Interactive Ballot
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Build your voting cheat sheet
                    </p>
                  </div>
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                    →
                  </span>
                </CardContent>
              </Card>
            </Link>

            {/* Candidate Comparison CTA */}
            <Link href="/candidates" className="block">
              <Card className="border-white/6 bg-white/2 backdrop-blur-xl hover:bg-white/4 hover:border-white/10 transition-all cursor-pointer group">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 group-hover:bg-purple-500/25 transition-colors">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-0.5">
                      Compare Candidates
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Side-by-side on key issues
                    </p>
                  </div>
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                    →
                  </span>
                </CardContent>
              </Card>
            </Link>

            {/* Election Journey & AI Assistant CTA */}
            <Link href="/assistant?mode=journey" className="block">
              <Card className="border-white/6 bg-white/2 backdrop-blur-xl hover:bg-white/4 hover:border-white/10 transition-all cursor-pointer group">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500/20 to-teal-500/20 group-hover:from-cyan-500/30 group-hover:to-teal-500/30 transition-colors">
                    <Sparkles className="h-5 w-5 text-cyan-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-0.5">
                      Election Journey & AI
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Interactive roadmap & assistance
                    </p>
                  </div>
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                    →
                  </span>
                </CardContent>
              </Card>
            </Link>

            {/* Voting Guide & Election Kit Links */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/guide" className="block">
                <Card className="border-white/6 bg-white/2 backdrop-blur-xl hover:bg-white/4 hover:border-white/10 transition-all cursor-pointer group h-full">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/15 text-green-400 group-hover:bg-green-500/25 transition-colors">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-semibold">Voting Guide</h4>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/kit" className="block">
                <Card className="border-white/6 bg-white/2 backdrop-blur-xl hover:bg-white/4 hover:border-white/10 transition-all cursor-pointer group h-full">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 group-hover:bg-amber-500/25 transition-colors">
                      <Trophy className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-semibold">Election Kit</h4>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
