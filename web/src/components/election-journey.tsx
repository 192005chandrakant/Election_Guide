"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  Search, 
  IdCard, 
  MapPin, 
  Vote, 
  ClipboardList,
  Sparkles,
  ArrowRight,
  Info,
  type LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type JourneyStep = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  details: string[];
  actionLabel: string;
  actionQuery: string;
  status: "completed" | "current" | "upcoming";
};

const JOURNEY_STEPS: JourneyStep[] = [
  {
    id: "registration",
    title: "Voter Registration",
    description: "The first step is ensuring you're on the electoral roll.",
    icon: ClipboardList,
    details: [
      "Check status on NVSP portal",
      "Fill Form 6 for new registration",
      "Correction of entries (Form 8)"
    ],
    actionLabel: "How to register?",
    actionQuery: "Tell me how to register as a new voter in India.",
    status: "completed"
  },
  {
    id: "id_check",
    title: "ID & Voter ID",
    description: "Get your EPIC card or prepare alternative photo IDs.",
    icon: IdCard,
    details: [
      "Download e-EPIC card",
      "Verify name in Voter ID",
      "List of 12 acceptable photo IDs"
    ],
    actionLabel: "Check ID rules",
    actionQuery: "What IDs are accepted at the polling booth in India?",
    status: "current"
  },
  {
    id: "booth_finder",
    title: "Find Your Booth",
    description: "Locate exactly where you need to go to cast your vote.",
    icon: MapPin,
    details: [
      "Use Voter Helpline App",
      "Search by EPIC number",
      "Check booth accessibility"
    ],
    actionLabel: "Find my booth",
    actionQuery: "How do I find my assigned polling station and booth number?",
    status: "upcoming"
  },
  {
    id: "research",
    title: "Candidate Research",
    description: "Make an informed choice by knowing who is running.",
    icon: Search,
    details: [
      "Read candidate affidavits",
      "Compare party manifestos",
      "Check criminal/financial records"
    ],
    actionLabel: "Compare candidates",
    actionQuery: "Where can I find official information and affidavits of candidates in my constituency?",
    status: "upcoming"
  },
  {
    id: "election_day",
    title: "Casting Your Vote",
    description: "The big day! Know the process at the polling station.",
    icon: Vote,
    details: [
      "Understand EVM & VVPAT",
      "The 3-officer verification process",
      "Marking the indelible ink"
    ],
    actionLabel: "Explain the process",
    actionQuery: "Walk me through the step-by-step process inside the polling booth on election day.",
    status: "upcoming"
  }
];

interface ElectionJourneyProps {
  onStepAction: (query: string) => void;
  currentStepIndex?: number;
}

export function ElectionJourney({ onStepAction, currentStepIndex = 1 }: ElectionJourneyProps) {
  const [activeStep, setActiveStep] = useState(currentStepIndex);

  return (
    <div className="w-full space-y-8 py-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Election Roadmap
          </h3>
          <p className="text-sm text-muted-foreground">Your interactive guide through the democratic process</p>
        </div>
        <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary">
          Step {activeStep + 1} of {JOURNEY_STEPS.length}
        </Badge>
      </div>

      <div className="relative">
        {/* Connector Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10 z-0" />
        <div 
          className="absolute left-6 top-0 w-0.5 bg-primary transition-all duration-700 ease-in-out z-0" 
          style={{ height: `${(activeStep / (JOURNEY_STEPS.length - 1)) * 100}%` }}
        />

        <div className="space-y-6 relative z-10">
          {JOURNEY_STEPS.map((step, index) => {
            const isActive = activeStep === index;
            const isCompleted = index < activeStep;
            const Icon = step.icon;

            return (
              <div key={step.id} className="group flex gap-6 items-start">
                {/* Step Marker */}
                <button
                  onClick={() => setActiveStep(index)}
                  className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110" 
                      : isCompleted 
                        ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                        : "bg-white/5 text-muted-foreground border border-white/10 hover:border-white/20"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                  {isActive && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="absolute -inset-1 rounded-[1.25rem] border-2 border-primary/40 animate-pulse" 
                    />
                  )}
                </button>

                {/* Step Content */}
                <div className={`flex-1 pt-1 transition-all duration-300 ${isActive ? "opacity-100" : "opacity-60 grayscale-[0.5]"}`}>
                  <div className="flex items-center justify-between">
                    <h4 className={`font-bold text-lg ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.title}
                    </h4>
                    {isActive && (
                      <Badge className="bg-primary/10 text-primary border-primary/20 animate-in fade-in slide-in-from-right-4">
                        Current Step
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                  
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 p-4 rounded-2xl border border-white/8 bg-white/3 backdrop-blur-md">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Key Details</p>
                              <ul className="space-y-2">
                                {step.details.map((detail, i) => (
                                  <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-primary" />
                                    {detail}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="flex flex-col justify-end gap-2">
                              <Button 
                                onClick={() => onStepAction(step.actionQuery)}
                                className="w-full rounded-xl gap-2 h-10 text-xs"
                              >
                                <Info className="h-3.5 w-3.5" /> {step.actionLabel}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Card className="border-primary/20 bg-linear-to-br from-primary/10 to-transparent p-5 rounded-3xl">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold">Next Milestone</h4>
            <p className="text-sm text-muted-foreground">You are 40% ready for the election. Keep going!</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 text-primary">
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
