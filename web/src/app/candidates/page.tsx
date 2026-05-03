"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  ArrowLeft,
  Filter,
  GraduationCap,
  Briefcase,
  Building2,
  DollarSign,
  Sparkles,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { TrustStrip } from "@/components/civic-ui";
import { WorkflowRail } from "@/components/workflow-rail";
import { useMemo } from "react";

const ISSUES = [
  { key: "agriculture", label: "Agriculture", icon: Briefcase },
  { key: "employment", label: "Employment", icon: DollarSign },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "infrastructure", label: "Infrastructure", icon: Building2 },
];

type CandidateCard = {
  id: number;
  name: string;
  party: string;
  experience: string;
  image: string;
  gradient: string;
  stances: Record<string, { position: string; support: boolean }>;
};

export default function CandidatesPage() {
  const { user } = useAuth();
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [candidateText, setCandidateText] = useState("Rajesh Sharma\nPriya Desai");
  const [issuesText, setIssuesText] = useState("agriculture, employment, infrastructure");
  const [analysis, setAnalysis] = useState("");
  const [analysisSource, setAnalysisSource] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [location, setLocation] = useState("Unknown");
  const [showcaseCandidates, setShowcaseCandidates] = useState<CandidateCard[]>([]);

  const candidateJourneyProgress = useMemo(() => {
    if (isAnalyzing) return 50;
    if (analysis) return 100;
    if (candidateText.split(/\n|,/).filter(Boolean).length >= 2) return 75;
    return 25;
  }, [analysis, candidateText, isAnalyzing]);

  const candidateSteps = useMemo(() => [
    {
      title: "Enter candidates",
      detail: "List at least two candidates to start the comparison.",
      complete: candidateText.split(/\n|,/).filter(Boolean).length >= 2,
    },
    {
      title: "Add priority issues",
      detail: "Include topics like education or healthcare for a focused analysis.",
      complete: issuesText.split(",").filter(Boolean).length > 0,
    },
    {
      title: "Generate AI analysis",
      detail: "Get a neutral, non-partisan summary of the candidates' platforms.",
      complete: Boolean(analysis),
    },
    {
      title: "Save to your kit",
      detail: "Keep a copy of the analysis for offline review and planning.",
      complete: false, // This is a manual action
    },
  ], [analysis, candidateText, issuesText]);

  useEffect(() => {
    let cancelled = false;
    const userId = user?.uid || "demo";

    const loadLocation = async () => {
      try {
        const response = await fetch(`/api/user?userId=${encodeURIComponent(userId)}`);
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (!cancelled && typeof data.location === "string" && data.location.trim()) {
          setLocation(data.location);
        }
      } catch {
        // Keep default unknown location.
      }
    };

    loadLocation();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  useEffect(() => {
    let cancelled = false;

    const loadCandidates = async () => {
      try {
        const response = await fetch("/api/platform/candidates");
        if (!response.ok || cancelled) {
          return;
        }

        const data = await response.json();
        const candidates = Array.isArray(data.candidates) ? data.candidates : [];
        if (!cancelled) {
          setShowcaseCandidates(candidates);
          if (candidates.length >= 2) {
            setCandidateText(`${candidates[0].name}\n${candidates[1].name}`);
          }
        }
      } catch {
        // Candidate showcase should come from Firestore. Keep empty state on failure.
      }
    };

    loadCandidates();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAnalyze = async () => {
    const candidateNames = candidateText
      .split(/\n|,/) 
      .map((name) => name.trim())
      .filter(Boolean);

    const issues = issuesText
      .split(",")
      .map((issue) => issue.trim())
      .filter(Boolean);

    if (candidateNames.length < 2) {
      setAnalysisError("Enter at least two candidate names to compare.");
      setAnalysis("");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch("/api/candidates/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateNames,
          issues,
          location,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAnalysisError(typeof data.error === "string" ? data.error : "Failed to analyze candidates.");
        setAnalysis("");
        setAnalysisSource(null);
        return;
      }

      setAnalysis(typeof data.analysis === "string" ? data.analysis : "No analysis was returned.");
      setAnalysisSource(typeof data.source === "string" ? data.source : null);
    } catch {
      setAnalysisError("Could not reach candidate analysis service. Try again.");
      setAnalysis("");
      setAnalysisSource(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToKit = () => {
    if (!analysis) return;
    
    try {
      const savedKits = JSON.parse(localStorage.getItem("civic_saved_analysis") || "[]");
      const newKit = {
        id: Date.now().toString(),
        candidates: candidateText,
        issues: issuesText,
        analysis,
        date: new Date().toISOString(),
        location
      };
      
      localStorage.setItem("civic_saved_analysis", JSON.stringify([newKit, ...savedKits].slice(0, 5)));
      alert("Analysis saved to your Election Kit!");
    } catch (error) {
      console.error("Failed to save analysis", error);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 md:pt-28 pb-28 md:pb-8 px-4 md:px-8">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl border border-white/6 bg-white/2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Candidate Comparison
            </h1>
            <p className="text-muted-foreground mt-0.5">
              Compare stances on key issues to make an informed choice.
            </p>
          </div>
        </div>

        <WorkflowRail
          title="Research candidates with a guided, non-partisan workflow"
          description="Enter candidates and issues, generate an AI-powered neutral analysis, and save your findings to your election kit to stay informed."
          progress={candidateJourneyProgress}
          xp={analysis ? 250 : candidateText ? 150 : 50}
          streak={user ? 3 : 1}
          steps={candidateSteps}
          quickLinks={[
            { href: "/ballot", label: "Build your ballot", detail: "Apply your research to a practice ballot." },
            { href: "/dashboard", label: "Open readiness", detail: "See what is left in your voter checklist." },
          ]}
        />

        <TrustStrip
          source={analysisSource ? `AI analysis source: ${analysisSource}` : "Candidate analysis requires user-provided names and issues; sample cards are clearly illustrative"}
          updated={`Location context: ${location}`}
        />

        {/* Issue Filter */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
            <Filter className="h-4 w-4" /> Filter by issue:
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedIssue(null)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              !selectedIssue
                ? "gradient-card-primary border-0 bg-primary/20 text-primary"
                : "gradient-card-secondary border-0 text-muted-foreground hover:text-foreground"
            }`}
          >
            All Issues
          </motion.button>
          {ISSUES.map((issue, idx) => (
            <motion.button
              key={issue.key}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() =>
                setSelectedIssue(selectedIssue === issue.key ? null : issue.key)
              }
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
                selectedIssue === issue.key
                  ? "gradient-card-accent border-0 bg-accent/20 text-accent"
                  : "gradient-card-secondary border-0 text-muted-foreground hover:text-foreground"
              }`}
            >
              <issue.icon className="h-3 w-3" />
              {issue.label}
            </motion.button>
          ))}
        </motion.div>

        <Card className="gradient-card-primary rounded-2xl md:rounded-3xl border-0 shadow-2xl shadow-primary/10">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-bounce-soft" /> AI Candidate Analysis
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Compare candidates with a non-partisan AI summary tailored to {location}.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Start Section */}
            <div className="gradient-card-secondary rounded-xl p-4 space-y-3 border-0">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-secondary" /> Quick Start
              </p>
              <p className="text-xs text-muted-foreground">Try comparing these candidates for your region:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {showcaseCandidates.map((candidate, idx) => (
                  <motion.button
                    key={candidate.id}
                    whileHover={{ y: -2 }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => {
                      const names = showcaseCandidates.map((c) => c.name).join("\n");
                      setCandidateText(names);
                      const issues = ISSUES.map((i) => i.label).join(", ");
                      setIssuesText(issues);
                    }}
                    className="text-left p-2.5 rounded-lg gradient-card-accent border-0 hover:shadow-lg transition-all"
                  >
                    <p className="text-xs font-medium">{candidate.name}</p>
                    <p className="text-xs text-muted-foreground">{candidate.party.split(" ")[0]}</p>
                  </motion.button>
                ))}
              </div>
              {showcaseCandidates.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Candidate showcase data is loading from Firestore. Add or update entries in platform_content/candidate_showcase.
                </p>
              )}
              <p className="text-xs text-muted-foreground">Or enter your own candidates below.</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Candidate names (one per line)</p>
              <textarea
                value={candidateText}
                onChange={(event) => setCandidateText(event.target.value)}
                className="min-h-24 w-full rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm outline-none transition focus:border-primary/40 focus:ring-primary/20"
                placeholder="Alex Rivera&#10;Jordan Smith"
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Priority issues (comma separated)</p>
              <Input
                value={issuesText}
                onChange={(event) => setIssuesText(event.target.value)}
                placeholder="education, healthcare, economy"
                className="h-11 bg-primary/5 border-primary/20 focus:border-primary/40 focus:ring-primary/20"
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <p className="text-xs text-muted-foreground">Tip: include at least 3 issues for a richer comparison.</p>
              <div className="flex gap-2">
                <Button onClick={handleAnalyze} disabled={isAnalyzing} className="rounded-xl btn-glow">
                  {isAnalyzing ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Analyzing
                    </span>
                  ) : (
                    "Generate Analysis"
                  )}
                </Button>
                {analysis && (
                  <motion.div whileHover={{ scale: 1.05 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Button onClick={handleSaveToKit} className="rounded-xl border-secondary/30 bg-secondary/10 text-secondary hover:bg-secondary/15">
                      Save to Kit
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
            {analysisError && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {analysisError}
              </motion.div>
            )}
            {analysis && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="gradient-card-accent rounded-xl p-4 border-0">
                <p className="text-xs uppercase tracking-wider text-accent mb-2 font-semibold">
                  Analysis {analysisSource ? `(${analysisSource})` : ""}
                </p>
                <div className="text-sm text-muted-foreground leading-relaxed space-y-1">
                  {analysis.split("\n").map((line, index) => (
                    <p key={`analysis-line-${index}-${line.slice(0, 10)}`}>{line}</p>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Candidate Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {showcaseCandidates.map((candidate, index) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
            >
              <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.2 }}>
                <Card className={`h-full flex flex-col rounded-2xl border-0 overflow-hidden ${
                  index === 0 ? 'gradient-card-primary' :
                  index === 1 ? 'gradient-card-accent' :
                  'gradient-card-secondary'
                } hover:shadow-2xl transition-all interactive-card`}>
                  {/* Candidate Header */}
                  <CardHeader className={`flex flex-row items-center gap-4 ${
                    index === 0 ? 'bg-primary/10' :
                    index === 1 ? 'bg-accent/10' :
                    'bg-secondary/10'
                  } border-b border-foreground/10 pb-5`}>
                    <Avatar className={`w-14 h-14 border-2 ${
                      index === 0 ? 'border-primary/30' :
                      index === 1 ? 'border-accent/30' :
                      'border-secondary/30'
                    }`}>
                      <AvatarFallback
                        className={`bg-linear-to-br ${candidate.gradient} text-white font-bold text-lg`}
                      >
                        {candidate.image}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <CardTitle className="text-xl mb-1 truncate">
                        {candidate.name}
                      </CardTitle>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge className="text-[10px] bg-foreground/10 text-foreground border-0">
                          {candidate.party}
                        </Badge>
                        <Badge className="text-[10px] border-foreground/20 text-muted-foreground bg-foreground/5">
                          <Briefcase className="mr-1 h-2.5 w-2.5" />
                          {candidate.experience}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Stances */}
                  <CardContent className="flex-1 p-5 space-y-1">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Key Stances
                    </h4>
                    {ISSUES.filter(
                      (issue) => !selectedIssue || issue.key === selectedIssue
                    ).map((issue, i, arr) => {
                      const stance =
                        candidate.stances[
                          issue.key as keyof typeof candidate.stances
                        ];
                      return (
                        <motion.div key={issue.key} whileHover={{ x: 4 }}>
                          <div className="flex items-start gap-3 py-3">
                            <motion.div whileHover={{ scale: 1.1 }} className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                              index === 0 ? 'bg-primary/20' :
                              index === 1 ? 'bg-accent/20' :
                              'bg-secondary/20'
                            } ${
                              index === 0 ? 'text-primary' :
                              index === 1 ? 'text-accent' :
                              'text-secondary'
                            }`}>
                              <issue.icon className="h-4 w-4" />
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-muted-foreground mb-0.5">
                                {issue.label}
                              </p>
                              <p className="text-sm font-medium leading-snug">
                                {stance.position}
                              </p>
                            </div>
                            <motion.div
                              whileHover={{ scale: 1.15 }}
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                                stance.support
                                  ? "bg-emerald-500/15 text-emerald-400"
                                  : "bg-rose-500/15 text-rose-400"
                              }`}
                            >
                              {stance.support ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : (
                                <X className="h-3.5 w-3.5" />
                              )}
                            </motion.div>
                          </div>
                          {i < arr.length - 1 && (
                            <Separator className="bg-foreground/10" />
                          )}
                        </motion.div>
                      );
                    })}
                  </CardContent>

                  {/* Footer */}
                  <CardFooter className={`p-5 ${
                    index === 0 ? 'bg-primary/5 border-t border-primary/20' :
                    index === 1 ? 'bg-accent/5 border-t border-accent/20' :
                    'bg-secondary/5 border-t border-secondary/20'
                  }`}>
                    <motion.div whileHover={{ scale: 1.02 }} className="w-full">
                      <Button className={`w-full rounded-xl ${
                        index === 0 ? 'bg-primary hover:bg-primary/90' :
                        index === 1 ? 'bg-accent hover:bg-accent/90' :
                        'bg-secondary hover:bg-secondary/90'
                      } text-white`}>
                        Read Full Platform
                      </Button>
                    </motion.div>
                  </CardFooter>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
