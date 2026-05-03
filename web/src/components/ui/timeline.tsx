"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "./card";
import { Badge } from "./badge";

export interface TimelineStep {
  id: string;
  title: string;
  description: string;
  details?: string;
  timeline?: string;
  status?: "completed" | "current" | "upcoming" | "pending";
  icon?: React.ReactNode;
  actionItems?: string[];
  tips?: string[];
  docs?: Array<{ label: string; description: string }>;
  deadline?: string;
  importance?: "high" | "medium" | "low";
}

interface TimelineProps {
  steps: TimelineStep[];
  onStepClick?: (step: TimelineStep) => void;
  compact?: boolean;
  interactive?: boolean;
}

function getStatusIcon(status?: string) {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "current":
      return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
    case "pending":
      return <AlertCircle className="h-5 w-5 text-amber-500" />;
    default:
      return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/40" />;
  }
}

function getStatusColor(status?: string) {
  switch (status) {
    case "completed":
      return "bg-green-500/10 border-green-500/30";
    case "current":
      return "bg-blue-500/10 border-blue-500/30";
    case "pending":
      return "bg-amber-500/10 border-amber-500/30";
    default:
      return "bg-muted/5 border-muted/30";
  }
}

export function Timeline({ steps, onStepClick, compact = false, interactive = true }: TimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className={compact ? "space-y-1.5" : "space-y-2"}>
      {steps.map((step, index) => {
        const isExpanded = expandedId === step.id;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="relative">
            {/* Vertical connector line */}
            {!isLast && (
              <div
                className={`absolute left-6 top-16 h-12 w-0.5 ${
                  step.status === "completed" ? "bg-green-500/30" : "bg-muted/20"
                }`}
              />
            )}

            {/* Timeline step card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              <Card
                className={`border-l-4 transition-all cursor-pointer hover:shadow-md ${
                  getStatusColor(step.status)
                } ${
                  step.status === "current"
                    ? "border-l-blue-500 shadow-md"
                    : step.status === "completed"
                      ? "border-l-green-500"
                      : "border-l-muted/50"
                } ${compact ? "rounded-xl" : "rounded-2xl"}`}
                onClick={() => {
                  if (interactive) {
                    setExpandedId(isExpanded ? null : step.id);
                    onStepClick?.(step);
                  }
                }}
              >
                <CardHeader className={compact ? "pb-2" : "pb-3"}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">{getStatusIcon(step.status)}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold leading-tight">{step.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                      </div>
                    </div>
                    {interactive && (
                      <motion.button
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-1 hover:bg-primary/10 rounded-md"
                      >
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </motion.button>
                    )}
                  </div>

                  {/* Meta info row */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {step.timeline && (
                      <Badge variant="outline" className="text-xs">
                        ⏱️ {step.timeline}
                      </Badge>
                    )}
                    {step.deadline && (
                      <Badge variant="outline" className="text-xs border-red-500/30 text-red-600">
                        📅 Deadline: {step.deadline}
                      </Badge>
                    )}
                    {step.importance && (
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          step.importance === "high"
                            ? "border-red-500/30 text-red-600"
                            : step.importance === "medium"
                              ? "border-amber-500/30 text-amber-600"
                              : "border-blue-500/30 text-blue-600"
                        }`}
                      >
                        {step.importance === "high" ? "⚠️" : step.importance === "medium" ? "📌" : "ℹ️"}{" "}
                        {step.importance.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                {/* Expandable content */}
                <AnimatePresence>
                  {isExpanded && interactive && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CardContent className="space-y-4 border-t border-white/6 pt-4">
                        {/* Details */}
                        {step.details && (
                          <div>
                            <p className="text-sm text-foreground leading-relaxed">{step.details}</p>
                          </div>
                        )}

                        {/* Action Items */}
                        {step.actionItems && step.actionItems.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-2">🎯 Action Items:</h4>
                            <ul className="space-y-1">
                              {step.actionItems.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <span className="text-primary mt-1">→</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Tips */}
                        {step.tips && step.tips.length > 0 && (
                          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                            <h4 className="text-sm font-semibold mb-2 text-blue-600">💡 Tips:</h4>
                            <ul className="space-y-1">
                              {step.tips.map((tip, i) => (
                                <li key={i} className="text-sm text-muted-foreground">
                                  • {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Documents */}
                        {step.docs && step.docs.length > 0 && (
                          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                            <h4 className="text-sm font-semibold mb-2 text-amber-600">📄 Documents Needed:</h4>
                            <div className="space-y-2">
                              {step.docs.map((doc, i) => (
                                <div key={i} className="text-sm">
                                  <p className="font-medium text-foreground">{doc.label}</p>
                                  <p className="text-muted-foreground">{doc.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

export default Timeline;
