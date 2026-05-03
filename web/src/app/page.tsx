"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  Bot,
  CheckCircle2,
  DatabaseZap,
  FileDown,
  Languages,
  MapPin,
  Radar,
  ShieldCheck,
  Sparkles,
  Users,
  Search,
  Clock3,
  FileText,
  Smartphone,
  Vote,
  Target,
  Accessibility,
  CheckSquare,
  Route,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MetricCard, MissionCard, TrustStrip } from "@/components/civic-ui";
import BrandLogo from "@/components/brand-logo";
import { PremiumCivicShowcase } from "@/components/premium-civic-components";

type HomeAction = {
  title: string;
  description: string;
  href: string;
  icon?: string;
};

type HomeStep = {
  step: string;
  title: string;
  description: string;
};

type HomePillar = {
  title: string;
  body: string;
};

type HomeContent = {
  heroTitle: string;
  heroDescription: string;
  quickActions: HomeAction[];
  onboardingSteps: HomeStep[];
  supportPillars: HomePillar[];
};

const DEFAULT_QUICK_ACTIONS: HomeAction[] = [
  {
    title: "Check your readiness score",
    description: "See what is complete, what is missing, and what to do next before election day.",
    href: "/dashboard",
  },
  {
    title: "Find your polling station",
    description: "Locate your correct booth, reduce travel uncertainty, and plan timing in advance.",
    href: "/map",
  },
  {
    title: "Compare candidates confidently",
    description: "Use issue-based summaries to compare candidates without information overload.",
    href: "/candidates",
  },
  {
    title: "Prepare offline election kit",
    description: "Keep key documents, checklist steps, and voting plan available even with weak network.",
    href: "/kit",
  },
];

const DEFAULT_ONBOARDING_STEPS: HomeStep[] = [
  {
    step: "1",
    title: "Set your voter context",
    description: "Add your location and profile so guidance reflects your constituency and voter journey.",
  },
  {
    step: "2",
    title: "Track readiness progress",
    description: "Follow your checklist for registration, booth, ID, research, and voting-day planning.",
  },
  {
    step: "3",
    title: "Use AI guidance at each step",
    description: "Ask questions in plain language and get practical, action-focused next steps.",
  },
  {
    step: "4",
    title: "Finalize and vote with confidence",
    description: "Save your ballot choices, reminders, and offline resources for a stress-free voting day.",
  },
];

const DEFAULT_SUPPORT_PILLARS: HomePillar[] = [
  {
    title: "Trusted source visibility",
    body: "Each core module emphasizes source confidence so users understand what is verified and what is fallback.",
  },
  {
    title: "Decision clarity",
    body: "Complex election tasks are broken into manageable actions to reduce confusion and decision fatigue.",
  },
  {
    title: "Inclusive experience",
    body: "Accessibility controls, simple language patterns, and adaptive guidance support a wide range of users.",
  },
  {
    title: "Time-sensitive nudges",
    body: "Timeline and reminders keep voters focused on deadlines, preparation, and voting-day execution.",
  },
];

const SERVICE_DEEP_DIVES = [
  {
    title: "Readiness Engine",
    icon: CheckSquare,
    href: "/dashboard",
    summary: "A personalized mission board for voter preparation.",
    benefits: [
      "Turns complex election prep into a clear checklist.",
      "Calculates readiness score and highlights missing actions.",
      "Rewards progress with levels, streaks, and civic XP.",
    ],
  },
  {
    title: "AI Election Assistant",
    icon: Bot,
    href: "/assistant",
    summary: "On-demand guidance for election questions in plain language.",
    benefits: [
      "Explains steps and procedures in simple terms.",
      "Adapts answers based on user context and readiness.",
      "Provides practical next actions, not generic theory.",
    ],
  },
  {
    title: "Candidate Intelligence",
    icon: Target,
    href: "/candidates",
    summary: "Issue-based comparison to support informed decisions.",
    benefits: [
      "Compares candidates by topics users care about.",
      "Reduces information overload with structured summaries.",
      "Makes trade-offs easier to understand before voting.",
    ],
  },
  {
    title: "Polling Navigation",
    icon: Route,
    href: "/map",
    summary: "Booth discovery and route planning for voting day.",
    benefits: [
      "Helps users confirm and reach the correct polling station.",
      "Improves confidence with location-aware planning.",
      "Reduces last-minute delays and missed voting windows.",
    ],
  },
  {
    title: "Offline Election Kit",
    icon: FileDown,
    href: "/kit",
    summary: "Preparedness tools designed for low-connectivity moments.",
    benefits: [
      "Keeps essential voting info available without network.",
      "Supports practical voting-day execution under constraints.",
      "Provides continuity in unstable connectivity conditions.",
    ],
  },
  {
    title: "Trust and Verification Layer",
    icon: Shield,
    href: "/guide",
    summary: "Transparency patterns that strengthen user confidence.",
    benefits: [
      "Shows verified vs fallback information clearly.",
      "Reinforces accountability through source signaling.",
      "Helps users judge reliability of election guidance.",
    ],
  },
] as const;

const USER_VALUE_TRACKS = [
  {
    title: "For first-time voters",
    icon: Vote,
    body: "Guided onboarding, simplified election language, and step-by-step planning remove fear and uncertainty.",
  },
  {
    title: "For busy working citizens",
    icon: Sparkles,
    body: "Action-oriented summaries, reminders, and prioritization help users prepare quickly without missing critical tasks.",
  },
  {
    title: "For accessibility-first users",
    icon: Accessibility,
    body: "Voice support, readability controls, and inclusive interaction design keep election information usable for more people.",
  },
] as const;

const PLATFORM_FAQ = [
  {
    question: "What does CivicGuide do in one sentence?",
    answer:
      "CivicGuide helps users become vote-ready by combining readiness tracking, AI guidance, trusted election information, booth planning, and offline support.",
  },
  {
    question: "How is this useful beyond basic election information?",
    answer:
      "The platform turns information into concrete actions, so users do not just read election facts but actually complete preparation tasks.",
  },
  {
    question: "Why does gamification matter here?",
    answer:
      "Levels, streaks, and civic XP create momentum and help users stay engaged long enough to complete essential voting preparation.",
  },
  {
    question: "How does CivicGuide build trust?",
    answer:
      "Source signaling, fallback transparency, and clear context labels help users understand confidence and reliability of each output.",
  },
] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const QUICK_ACTION_ICONS = [CheckCircle2, MapPin, Users, FileDown] as const;
const SUPPORT_PILLAR_ICONS = [Search, Clock3, FileText, Smartphone] as const;

export default function Home() {
  const [content, setContent] = useState<HomeContent | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadContent = async () => {
      try {
        const response = await fetch("/api/platform/home");
        if (!response.ok || cancelled) {
          return;
        }

        const data = await response.json();
        if (!cancelled && data?.content) {
          setContent(data.content as HomeContent);
        }
      } catch {
        // Keep the page usable if Firestore is not available yet.
      }
    };

    loadContent();

    return () => {
      cancelled = true;
    };
  }, []);

  const quickActions = content?.quickActions?.length ? content.quickActions : DEFAULT_QUICK_ACTIONS;
  const onboardingSteps = content?.onboardingSteps?.length ? content.onboardingSteps : DEFAULT_ONBOARDING_STEPS;
  const supportPillars = content?.supportPillars?.length ? content.supportPillars : DEFAULT_SUPPORT_PILLARS;
  const heroTitle = content?.heroTitle ?? "Empower your vote in Indian elections.";
  const heroDescription =
    content?.heroDescription ??
    "CivicGuide is your AI-powered election guide for voting readiness, verified information, booth navigation, candidate comparisons, accessibility support, and an offline voter kit—all designed for Indian elections.";

  return (
    <main className="relative w-full min-h-screen overflow-x-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 civic-field" />

      <section className="relative z-10 w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid min-h-[calc(100vh-5rem)] md:min-h-screen grid-cols-1 lg:grid-cols-[1.02fr_0.98fr] gap-8 lg:gap-12 items-center py-16 sm:py-20 md:py-28">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full max-w-3xl"
            >
              <motion.div className="mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3">
                <BrandLogo
                  subtitle
                  markClassName="h-12 w-12 sm:h-14 sm:w-14 rounded-lg sm:rounded-xl"
                  textClassName="pt-0.5 text-xs sm:text-sm md:text-base"
                />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-balance"
              >
                {heroTitle}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mt-6 sm:mt-7 max-w-2xl text-base sm:text-lg leading-relaxed text-muted-foreground"
              >
                {heroDescription}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto"
              >
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-11 sm:h-12 gap-2 rounded-xl sm:rounded-2xl px-4 sm:px-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                    Open dashboard <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/assistant" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto h-11 sm:h-12 gap-2 rounded-xl sm:rounded-2xl border-foreground/15 bg-card/50 px-4 sm:px-6 text-base font-semibold backdrop-blur-xl hover:bg-card/70 transition-all duration-300"
                  >
                    Ask AI <Bot className="h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
              >
                <div className="gradient-card-primary p-4 rounded-2xl">
                  <MetricCard icon={ShieldCheck} label="Trust layer" value="Source-backed" tone="green" />
                </div>
                <div className="gradient-card-accent p-4 rounded-2xl">
                  <MetricCard icon={Radar} label="Guidance" value="Adaptive" tone="blue" />
                </div>
                <div className="gradient-card-secondary p-4 rounded-2xl">
                  <MetricCard icon={Languages} label="Access" value="Inclusive" tone="amber" />
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="hidden lg:block relative w-full"
            >
              <PremiumCivicShowcase />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative z-10 w-full -mt-4 sm:-mt-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
          >
            {quickActions.map((action, index) => {
              const ActionIcon = QUICK_ACTION_ICONS[index] || CheckCircle2;

              return (
                <motion.div key={action.title} variants={itemVariants}>
                  <Link href={action.href} className="group block h-full">
                    <Card
                      className={`h-full border-foreground/10 bg-card/78 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_24px_70px_-34px] hover:shadow-primary/40 interactive-card ${
                        index === 0 ? "gradient-card-primary" :
                        index === 1 ? "gradient-card-accent" :
                        index === 2 ? "gradient-card-secondary" :
                        "gradient-card-primary"
                      }`}
                    >
                      <CardContent className="flex h-full gap-4 p-5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all group-hover:bg-primary/15 group-hover:scale-110">
                          <ActionIcon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="font-semibold group-hover:text-primary transition-colors">{action.title}</h3>
                            <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{action.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 w-full py-16 sm:py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12 md:space-y-16">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <TrustStrip source="Election commission data, user profile context, and transparent fallback data" updated="Every core page now shows source and readiness context" />
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full"
          >
            <motion.div variants={itemVariants} className="gradient-card-primary rounded-2xl overflow-hidden">
              <MissionCard icon={CheckCircle2} title="Voting Readiness Engine" description="A dynamic score converts registration, ID, polling station, candidate research, and voting plan progress into clear next actions." href="/dashboard" status="Live" tone="primary" />
            </motion.div>
            <motion.div variants={itemVariants} className="gradient-card-accent rounded-2xl overflow-hidden">
              <MissionCard icon={Bot} title="Dynamic Election Assistant" description="Specialist AI modes explain voting steps, polling station planning, candidate comparison, and checklist coaching in plain language." href="/assistant" status="Adaptive" tone="blue" />
            </motion.div>
            <motion.div variants={itemVariants} className="gradient-card-secondary rounded-2xl overflow-hidden">
              <MissionCard icon={BadgeCheck} title="Trust & Verification Layer" description="Verified badges, source labels, and clear fallback notices help users understand where each answer came from." href="/guide" status="Transparent" tone="green" />
            </motion.div>
            <motion.div variants={itemVariants} className="gradient-card-primary rounded-2xl overflow-hidden">
              <MissionCard icon={Users} title="Decision Simplification" description="Candidate and ballot tools reduce voter fatigue with structured comparisons, summaries, and focused issue filters." href="/candidates" status="Focused" tone="rose" />
            </motion.div>
            <motion.div variants={itemVariants} className="gradient-card-accent rounded-2xl overflow-hidden">
              <MissionCard icon={MapPin} title="Polling Station Navigation" description="Search polling stations, compare distance and wait estimates, and jump directly into directions." href="/map" status="Actionable" tone="amber" />
            </motion.div>
            <motion.div variants={itemVariants} className="gradient-card-secondary rounded-2xl overflow-hidden">
              <MissionCard icon={FileDown} title="Offline Election Kit" description="Critical documents, dates, ID notes, and checklists remain available for low-connectivity voting days." href="/kit" status="PWA" tone="green" />
            </motion.div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Platform Services</p>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">What CivicGuide provides and why it matters</h2>
              <p className="max-w-3xl text-sm sm:text-base leading-relaxed text-muted-foreground">
                CivicGuide is not only an information page. It is a complete voter-preparation platform that helps users plan, decide, and act with confidence from the first visit to voting day.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {SERVICE_DEEP_DIVES.map((service) => (
                <motion.div key={service.title} variants={itemVariants}>
                  <Link href={service.href} className="group block h-full">
                    <Card className="h-full border-foreground/10 bg-card/82 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_24px_70px_-34px] hover:shadow-primary/40">
                      <CardContent className="h-full p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary group-hover:bg-primary/20 transition-colors">
                            <service.icon className="h-5 w-5" />
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="mt-4 font-semibold text-lg leading-tight">{service.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{service.summary}</p>
                        <ul className="mt-4 space-y-2 text-sm text-foreground/90">
                          {service.benefits.map((benefit) => (
                            <li key={benefit} className="flex gap-2 leading-relaxed">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {USER_VALUE_TRACKS.map((track) => (
              <motion.div key={track.title} variants={itemVariants}>
                <Card className="h-full gradient-card-accent rounded-2xl border-0 overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent">
                      <track.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-3 text-base font-semibold">{track.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{track.body}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]"
          >
            <Card className="gradient-card-primary rounded-2xl sm:rounded-3xl overflow-hidden border-0">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Utilities</p>
                    <h2 className="mt-2 font-heading text-2xl sm:text-3xl font-bold tracking-tight">Built-in tools for real election prep</h2>
                  </div>
                  <BadgeCheck className="h-7 w-7 text-primary shrink-0" />
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {supportPillars.map((pillar, index) => {
                    const PillarIcon = SUPPORT_PILLAR_ICONS[index] || Search;

                    return (
                      <motion.div
                        key={pillar.title}
                        whileHover={{ y: -2 }}
                        className="gradient-card-accent rounded-2xl border-0 p-4 cursor-pointer"
                      >
                        <PillarIcon className="h-5 w-5 text-accent" />
                        <h3 className="mt-3 font-semibold">{pillar.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{pillar.body}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card-secondary rounded-2xl sm:rounded-3xl overflow-hidden border-0">
              <CardContent className="p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">How it works</p>
                <h2 className="mt-2 font-heading text-2xl sm:text-3xl font-bold tracking-tight">A guided journey from first visit to vote-ready</h2>

                <div className="mt-6 space-y-4">
                  {onboardingSteps.map((step) => (
                    <motion.div
                      key={step.step}
                      variants={itemVariants}
                      className="flex gap-4 rounded-2xl gradient-card-primary border-0 p-4 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary/20 text-sm font-bold text-secondary">
                        {step.step}
                      </div>
                      <div>
                        <h3 className="font-semibold">{step.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <Card className="gradient-card-primary rounded-2xl sm:rounded-3xl overflow-hidden border-0">
              <CardContent className="grid gap-6 sm:gap-8 p-6 sm:p-8 md:p-10 md:grid-cols-[0.8fr_1.2fr]">
                <div className="flex flex-col justify-center">
                  <motion.div
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DatabaseZap className="h-6 w-6" />
                  </motion.div>
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
                    A real platform architecture,<br className="hidden sm:block" /> visible in the experience.
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground max-w-md">
                    The interface now exposes the intelligence layer, AI layer, verification layer, accessibility engine, integration layer, and offline layer as user-facing workflows.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 auto-rows-max">
                  {[
                    ["Behavioral guidance", "Next-step nudges adapt to checklist progress."],
                    ["Source confidence", "Verified and fallback states are explicit."],
                    ["Inclusive access", "Voice, contrast, simple language, and language settings stay global."],
                    ["Election urgency", "Timeline and notifications surface time-sensitive actions."],
                  ].map(([title, body]) => (
                    <motion.div
                      key={title}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="gradient-card-accent rounded-xl sm:rounded-2xl border-0 p-4 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    >
                      <Sparkles className="mb-3 h-4 w-4 text-accent" />
                      <p className="font-semibold text-sm sm:text-base">{title}</p>
                      <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">{body}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-4"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Clarity for users</p>
              <h2 className="mt-2 font-heading text-2xl sm:text-3xl font-bold tracking-tight">Frequently asked: how this platform helps</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PLATFORM_FAQ.map((item) => (
                <motion.div key={item.question} variants={itemVariants}>
                  <Card className="h-full gradient-card-secondary rounded-2xl border-0">
                    <CardContent className="p-5">
                      <h3 className="text-base font-semibold leading-snug">{item.question}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 rounded-2xl sm:rounded-3xl border border-primary/30 bg-linear-to-r from-primary/15 to-secondary/10 px-6 sm:px-8 py-8 sm:py-10 text-foreground"
          >
            <div className="w-full sm:w-auto">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold">Ready to finish your voting plan?</h2>
              <p className="mt-2 text-sm text-muted-foreground">Open the dashboard and follow the recommended next action.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button className="btn-glow w-full sm:w-auto h-11 rounded-xl sm:rounded-2xl px-5 sm:px-6 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300">
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/notifications" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto h-11 rounded-xl sm:rounded-2xl border-primary/30 bg-primary/10 px-5 sm:px-6 text-foreground hover:bg-primary/15 font-semibold transition-all duration-300"
                >
                  Reminders <BellRing className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
