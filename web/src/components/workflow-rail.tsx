"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Circle, Sparkles, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type WorkflowStep = {
  title: string;
  detail: string;
  complete: boolean;
};

export type WorkflowQuickLink = {
  href: string;
  label: string;
  detail: string;
};

type WorkflowRailProps = {
  title: string;
  description: string;
  progress: number;
  xp: number;
  streak: number;
  steps: WorkflowStep[];
  quickLinks: WorkflowQuickLink[];
  accent?: "primary" | "accent" | "secondary";
};

const accentStyles = {
  primary: "from-primary/14 to-teal-600/8 text-primary",
  accent: "from-accent/14 to-cyan-600/8 text-accent",
  secondary: "from-secondary/14 to-emerald-600/8 text-secondary",
};

function getJourneyLabel(progress: number) {
  if (progress >= 90) return "Election-ready";
  if (progress >= 65) return "On track";
  if (progress >= 35) return "Building momentum";
  return "Getting started";
}

export function WorkflowRail({
  title,
  description,
  progress,
  xp,
  streak,
  steps,
  quickLinks,
  accent = "primary",
}: WorkflowRailProps) {
  const clampedProgress = Math.max(0, Math.min(100, Math.round(progress)));
  const journeyLabel = getJourneyLabel(clampedProgress);

  return (
    <Card className={cn("overflow-hidden border-primary/20 bg-linear-to-r backdrop-blur-xl", accentStyles[accent])}>
      <CardContent className="space-y-5 p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Civic journey
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center md:min-w-0 md:w-65">
            <div className="rounded-2xl border border-foreground/10 bg-background/70 px-3 py-2">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">XP</p>
              <motion.p className="mt-1 text-lg font-semibold" aria-live="polite">
                <motion.span
                  key={xp}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.36 }}
                >
                  {xp}
                </motion.span>
              </motion.p>
            </div>
            <div className="rounded-2xl border border-foreground/10 bg-background/70 px-3 py-2">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Streak</p>
              <motion.p className="mt-1 text-lg font-semibold" aria-live="polite">
                <motion.span
                  key={streak}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.36 }}
                >
                  {streak} days
                </motion.span>
              </motion.p>
            </div>
          </div>
        </div>

        <div className="space-y-2 rounded-2xl border border-foreground/10 bg-background/60 p-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <p className="font-medium text-foreground">{journeyLabel}</p>
            <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
              {clampedProgress}% complete
            </Badge>
          </div>
          <Progress value={clampedProgress} className="h-2" aria-label={`Journey progress ${clampedProgress} percent`} />
          <p className="text-xs text-muted-foreground">
            Keep moving from planning to action. Each completed step syncs your election journey.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step) => (
            <motion.div key={step.title} whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
              <div className="h-full rounded-2xl border border-foreground/10 bg-background/65 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl", step.complete ? "bg-emerald-500/12 text-emerald-500" : "bg-muted/50 text-muted-foreground") }>
                    {step.complete ? <CheckCircle2 className="h-4.5 w-4.5" /> : <Circle className="h-4.5 w-4.5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-tight">{step.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.detail}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-foreground/10 bg-background/60 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Zap className="h-4 w-4 text-primary" /> Smart navigation
          </div>
          <div className="flex flex-wrap gap-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-auto rounded-xl border-foreground/10 bg-background/70 px-3 py-2 text-left"
                )}
              >
                <span className="flex items-center gap-3">
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold leading-tight">{link.label}</span>
                    <span className="block text-[11px] leading-tight text-muted-foreground">{link.detail}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}