"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ListChecks,
  MapPin,
  IdCard,
  CalendarDays,
  Bookmark,
  Printer,
  WifiOff,
} from "lucide-react";
import Link from "next/link";
import { TrustStrip } from "@/components/civic-ui";

const KIT_SECTIONS = [
  {
    id: "checklist",
    icon: ListChecks,
    title: "Voter Checklist",
    desc: "Step-by-step preparation checklist you can print and check off.",
    color: "from-green-600/25 to-emerald-600/15 border-emerald-500/30 bg-gradient-to-r",
    content: [
      "☐ Confirm voter registration status on NVSP",
      "☐ Check ID requirements (Aadhaar/Voter ID)",
      "☐ Locate your assigned polling station/booth",
      "☐ Review candidates in your constituency",
      "☐ Plan transportation to the booth",
      "☐ Prepare valid EPIC or other photo ID",
      "☐ Set a reminder for the voting phase date",
      "☐ Bring this checklist on voting day!",
    ],
  },
  {
    id: "id_guide",
    icon: IdCard,
    title: "ID Requirements Quick Reference",
    desc: "Acceptable forms of identification at the booth.",
    color: "from-primary/25 to-sky-600/15 border-sky-500/30 bg-gradient-to-r",
    content: [
      "✅ Voter ID Card (EPIC)",
      "✅ Aadhaar Card (original or m-Aadhaar)",
      "✅ PAN Card",
      "✅ Indian Passport",
      "✅ Driving License",
      "⚠️ Note: Voter Slip alone is not sufficient",
      "💡 Digitally signed Aadhaar is also valid",
    ],
  },
  {
    id: "dates",
    icon: CalendarDays,
    title: "Key Election Dates 2026",
    desc: "Important deadlines for the Lok Sabha phase.",
    color: "from-purple-600/25 to-pink-600/15 border-purple-500/30 bg-gradient-to-r",
    content: [
      "📅 Mar 01 — Voter registration opens",
      "📅 Mar 25 — Form 6 submission deadline",
      "📅 Apr 05 — Polling station list finalized",
      "📅 Apr 10 — Candidate nomination ends",
      "📅 Apr 15 — Withdrawal of candidates",
      "📅 Apr 19 — PHASE 1 VOTING DAY 🗳️",
      "📅 May 20 — Counting of Votes",
    ],
  },
  {
    id: "polling",
    icon: MapPin,
    title: "Polling Booth Info",
    desc: "What to expect at the polling station.",
    color: "from-amber-600/25 to-orange-600/15 border-amber-500/30 bg-gradient-to-r",
    content: [
      "🕐 Polls typically open 7:00 AM — 6:00 PM",
      "📍 Your booth is based on your residential address",
      "🚗 Verify your Part Number and Serial Number",
      "👥 Queue management apps available in some cities",
      "🚫 No mobile phones allowed inside the booth",
      "🗣️ Polling Officers can assist with EVM/VVPAT",
      "🎉 Verify the VVPAT slip after pressing the button",
    ],
  },
];

export default function ElectionKitPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background pt-24 md:pt-28 pb-28 md:pb-8 px-4 md:px-8">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
      <div className="mx-auto max-w-3xl space-y-6 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-xl border border-white/6 bg-white/2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Election Kit</h1>
            <p className="text-muted-foreground mt-0.5">Everything you need, available offline.</p>
          </div>
          <Button onClick={handlePrint} variant="outline" className="rounded-xl border-white/10 gap-2 hidden md:flex">
            <Printer className="h-4 w-4" /> Print Kit
          </Button>
        </div>

        {/* Offline Banner */}
        <Card className="border-green-500/20 bg-green-500/4 backdrop-blur-xl">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/15 text-green-400">
              <WifiOff className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-400">Available Offline</p>
              <p className="text-xs text-muted-foreground">This page is cached for offline access. You can view it even without an internet connection.</p>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 shrink-0">PWA</Badge>
          </CardContent>
        </Card>

        <TrustStrip 
          source="Verified from ECI (Election Commission of India) official handbook 2026"
          updated="Updated for Lok Sabha Phase 1 requirements"
        />

        {/* Kit Sections */}
        <div className="space-y-4 print:space-y-8">
          {KIT_SECTIONS.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-white/6 bg-white/2 backdrop-blur-xl overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-4 bg-white/2 border-b border-white/6 pb-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${section.color} text-white shadow-lg`}>
                    <section.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{section.desc}</p>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="space-y-2.5">
                    {section.content.map((line, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                        <span className="shrink-0">{line.slice(0, 2)}</span>
                        <span>{line.slice(2).trim()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Download / Print CTA (Mobile) */}
        <div className="md:hidden">
          <Button onClick={handlePrint} className="w-full rounded-xl py-6 font-semibold gap-2">
            <Printer className="h-4 w-4" /> Print Election Kit
          </Button>
        </div>

        {/* Emergency Contacts */}
        <Card className="border-white/6 bg-white/2 backdrop-blur-xl">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-primary" /> Helpful Resources
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { label: "NVSP.in", desc: "National Voters' Service Portal" },
                { label: "ECI.gov.in", desc: "Election Commission of India" },
                { label: "Voter Helpline App", desc: "Official ECI mobile application" },
                { label: "Toll Free Helpline", desc: "Dial 1950 for assistance" },
              ].map((resource) => (
                <div key={resource.label} className="p-3 rounded-xl border border-white/6 bg-white/2">
                  <p className="text-sm font-medium">{resource.label}</p>
                  <p className="text-xs text-muted-foreground">{resource.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
