"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { Timeline } from "@/components/ui/timeline";
import { getElectionTimeline } from "@/lib/election-timeline-data";

export default function GuidePage() {
  const timelineSteps = useMemo(() => getElectionTimeline(), []);
  const completedSteps = timelineSteps.filter((step) => step.status === "completed").length;
  const totalSteps = timelineSteps.length;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="min-h-screen bg-background pt-24 md:pt-28 pb-28 md:pb-8 px-4 md:px-8">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
      <div className="mx-auto max-w-4xl space-y-6 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-xl border border-primary/20 bg-primary/10 hover:bg-primary/15 hover:border-primary/30">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">Voting Guide</h1>
            <p className="text-muted-foreground mt-0.5">Your step-by-step journey from registration to ballot.</p>
          </div>
        </motion.div>

        {/* Progress Summary */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="gradient-card-primary rounded-2xl border-0 overflow-hidden">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <motion.div whileHover={{ scale: 1.1 }} className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
                  <FileText className="h-5 w-5" />
                </motion.div>
                <div>
                  <p className="text-sm font-semibold">{completedSteps} of {totalSteps} steps completed</p>
                  <p className="text-xs text-muted-foreground">You&apos;re making great progress!</p>
                </div>
              </div>
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className="rounded-full bg-primary/10 px-4 py-2">
                <Badge className="bg-primary/20 text-primary border-primary/30">{progressPercent}%</Badge>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

          {/* Steps */}
          <Timeline steps={timelineSteps} compact />
      </div>
    </div>
  );
}
