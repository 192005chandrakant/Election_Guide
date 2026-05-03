"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  HelpCircle,
  FileText,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { MOCK_BALLOT, type BallotData } from "./data";
import { useAppSettings } from "@/lib/settings-context";
import { WorkflowRail } from "@/components/workflow-rail";
import { useAuth } from "@/lib/auth-context";

export default function BallotBuilderPage() {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [ballot, setBallot] = useState<BallotData | null>(null);
  const [ballotError, setBallotError] = useState<string | null>(null);
  const [ballotSource, setBallotSource] = useState<string | null>(null);
  const [loadingBallot, setLoadingBallot] = useState(true);
  const { voiceEnabled, speak } = useAppSettings();
  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const loadBallot = async () => {
      try {
        const response = await fetch("/api/platform/ballot");
        const data = await response.json();

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          setBallotError(typeof data.error === "string" ? data.error : "Ballot content unavailable");
          setBallot(null);
          return;
        }

        if (data?.ballot && typeof data.ballot === "object") {
          setBallot(data.ballot as BallotData);
          setBallotSource(typeof data.source === "string" ? data.source : null);
        }
      } catch (error) {
        if (!cancelled) {
          setBallotError(error instanceof Error ? error.message : "Ballot content unavailable");
        }
      } finally {
        if (!cancelled) {
          setLoadingBallot(false);
        }
      }
    };

    loadBallot();

    return () => {
      cancelled = true;
    };
  }, []);

  const ballotData = ballot ?? MOCK_BALLOT;

  const handleSelect = (raceOrMeasureId: string, choiceId: string) => {
    setSelections((prev) => ({
      ...prev,
      [raceOrMeasureId]: prev[raceOrMeasureId] === choiceId ? "" : choiceId,
    }));
  };

  const ballotJourneyProgress = useMemo(() => {
    const raceIds = ballotData.races.map((r) => r.id);
    const measureIds = ballotData.measures.map((m) => m.id);
    const total = raceIds.length + measureIds.length;
    if (total === 0) return 100;

    const selectedCount = Object.keys(selections).filter((key) =>
      (raceIds.includes(key) || measureIds.includes(key)) && selections[key]
    ).length;

    return (selectedCount / total) * 100;
  }, [ballotData, selections]);

  const ballotSteps = useMemo(() => [
    {
      title: "Review candidates",
      detail: "Read through each candidate's profile and party affiliation.",
      complete: true,
    },
    {
      title: "Select your choices",
      detail: "Click on your preferred candidate for each race.",
      complete: Object.values(selections).some(v => v),
    },
    {
      title: "Consider priorities",
      detail: "Vote on the constituency priorities that matter to you.",
      complete: ballotData.measures.some((m) => selections[m.id]),
    },
    {
      title: "Print your cheat sheet",
      detail: "Generate a printable summary of your choices for voting day.",
      complete: false, // This is a manual action
    },
  ], [ballotData, selections]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background pt-24 md:pt-28 pb-28 md:pb-8 px-4 md:px-8">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />

      <div className="mx-auto max-w-4xl space-y-8 relative z-10">
        {/* Header (Hidden in Print) */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-xl border border-white/6 bg-white/2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Interactive Ballot</h1>
              <p className="text-muted-foreground mt-0.5">Pre-vote and generate your voting cheat sheet.</p>
            </div>
          </div>
          <Button onClick={handlePrint} className="w-full md:w-auto rounded-xl gap-2 font-semibold">
            <Printer className="h-4 w-4" /> Print Cheat Sheet
          </Button>
        </div>

        <WorkflowRail
          title="Build your practice ballot with a clear, step-by-step flow"
          description={ballotSource === "firestore" || ballotSource === "seeded"
            ? "Make your choices for each race and priority, then print a personal cheat sheet to take with you on voting day."
            : "Loading ballot content from Firestore..."}
          progress={ballotJourneyProgress}
          xp={Math.round(ballotJourneyProgress * 2)}
          streak={user ? 3 : 1}
          steps={ballotSteps}
          accent="secondary"
          quickLinks={[
            { href: "/dashboard", label: "Return to dashboard", detail: "Check your overall readiness progress." },
            { href: "/kit", label: "Open election kit", detail: "Access your saved documents and plans." },
          ]}
        />

        {ballotError && (
          <Card className="border-destructive/30 bg-destructive/10 backdrop-blur-xl no-print">
            <CardContent className="p-4 text-sm text-destructive">
              {ballotError}
            </CardContent>
          </Card>
        )}

        {loadingBallot && !ballotError && (
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl no-print">
            <CardContent className="p-4 text-sm text-muted-foreground">
              Loading ballot content from Firestore...
            </CardContent>
          </Card>
        )}

        {/* Print Only Header */}
        <div className="hidden print:block mb-8 border-b-2 border-black pb-4">
          <h1 className="text-3xl font-bold text-black text-center">{ballotData.electionName}</h1>
          <p className="text-center text-gray-700 font-medium">My Voting Cheat Sheet</p>
        </div>

        {/* Ballot Info */}
        <Card className="border-primary/30 bg-linear-to-r from-primary/10 to-blue-500/5 backdrop-blur-xl no-print shadow-lg">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary via-teal-600 to-green-600 text-white shadow-lg">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">{ballotData.electionName}</h2>
              <p className="text-sm text-muted-foreground">
                {ballotData.date} • {ballotData.location}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-8 print:space-y-4">
          {/* Candidates Section */}
          {ballotData.races.map((race) => (
            <Card key={race.id} className="border-white/6 bg-white/2 backdrop-blur-xl overflow-hidden print:border-black print:bg-white print:shadow-none">
              <CardHeader className="bg-white/2 border-b border-white/6 pb-4 print:border-black print:bg-gray-100 print:py-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl print:text-lg print:text-black">{race.office}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 print:text-black">{race.instructions}</p>
                  </div>
                  {voiceEnabled && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="no-print h-8 w-8"
                      onClick={() => speak(`Race for ${race.office}. ${race.instructions}`)}
                    >
                      <Volume2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 divide-y divide-white/6 print:divide-black">
                  {race.candidates.map((candidate) => {
                    const isSelected = selections[race.id] === candidate.id;
                    const selectedClass = isSelected ? "bg-primary/10 print:bg-gray-200" : "hover:bg-white/4 print:hidden";
                    return (
                      <div
                        key={candidate.id}
                        onClick={() => handleSelect(race.id, candidate.id)}
                        className={`flex items-start gap-4 p-5 cursor-pointer transition-colors print:p-2 ${selectedClass}`}
                      >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-sm border-2 ${isSelected ? "bg-primary border-primary text-primary-foreground print:border-black print:bg-white print:text-black" : "bg-transparent border-muted-foreground text-muted-foreground"}`}>
                          {isSelected ? <CheckCircle2 className="h-5 w-5" /> : candidate.avatar}
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold print:text-black ${isSelected ? "text-primary print:text-black" : "text-foreground"}`}>
                            {candidate.name}
                          </h3>
                          <p className="text-xs font-medium text-muted-foreground mb-2 print:text-gray-800">
                            {candidate.party}
                          </p>
                          <p className="text-sm text-muted-foreground leading-relaxed no-print">
                            {candidate.description}
                          </p>
                        </div>
                        {voiceEnabled && !isSelected && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="no-print h-8 w-8 self-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              speak(`${candidate.name}, ${candidate.party}. ${candidate.description}`);
                            }}
                          >
                            <Volume2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Measures Section */}
          <div className="space-y-6 pt-6">
            <h2 className="text-2xl font-bold border-b border-white/10 pb-2 print:text-black print:border-black">Constituency Priorities</h2>
            {ballotData.measures.map((measure) => {
              const selectedValue = selections[measure.id];
              const isSelectedYes = selectedValue === "yes";
              const isSelectedNo = selectedValue === "no";

              if (typeof window !== "undefined" && window.matchMedia("print").matches && !selectedValue) {
                return null;
              }

              return (
                <Card key={measure.id} className="border-white/6 bg-white/2 backdrop-blur-xl overflow-hidden print:border-black print:bg-white print:shadow-none print:mb-4">
                  <CardContent className="p-5 print:p-2">
                    <div className="flex justify-between items-start mb-4 print:mb-2">
                      <h3 className="font-semibold text-lg print:text-black">{measure.title}</h3>
                      {voiceEnabled && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="no-print h-8 w-8 shrink-0"
                          onClick={() => speak(`${measure.title}. ${measure.description}`)}
                        >
                          <Volume2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed print:hidden">
                      {measure.description}
                    </p>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex gap-3 items-start mb-5 no-print">
                      <HelpCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-500/90 leading-relaxed">
                        <span className="font-semibold">Financial Impact:</span> {measure.financialImpact}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 print:grid-cols-1">
                      <Button
                        variant="outline"
                        onClick={() => handleSelect(measure.id, "yes")}
                        className={`h-12 border-2 ${isSelectedYes ? "border-green-500 bg-green-500/10 text-green-500 print:border-black print:bg-white print:text-black" : "border-white/10 text-muted-foreground print:hidden"}`}
                      >
                        {isSelectedYes && <CheckCircle2 className="mr-2 h-5 w-5" />}
                        YES
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleSelect(measure.id, "no")}
                        className={`h-12 border-2 ${isSelectedNo ? "border-red-500 bg-red-500/10 text-red-500 print:border-black print:bg-white print:text-black" : "border-white/10 text-muted-foreground print:hidden"}`}
                      >
                        {isSelectedNo && <CheckCircle2 className="mr-2 h-5 w-5" />}
                        NO
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Print Notice */}
        <div className="hidden print:block mt-8 text-center text-sm text-gray-500">
          <p>Generated by CivicGuide • civicguide.org</p>
          <p>This is a personal cheat sheet, NOT an official ballot.</p>
        </div>
      </div>
    </div>
  );
}
