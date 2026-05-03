"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, User, Globe, Volume2, Eye, LogOut, ChevronRight, Check, BookOpen, CalendarDays,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSettings } from "@/lib/settings-context";
import { useAuth } from "@/lib/auth-context";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { LANGUAGE_OPTIONS } from "@/lib/i18n";

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    language, setLanguage,
    voiceEnabled, setVoiceEnabled,
    highContrast, setHighContrast,
    simpleMode, setSimpleMode,
    speak,
  } = useAppSettings();

  const [showLangPicker, setShowLangPicker] = useState(false);
  const [saved, setSaved] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [electionDate, setElectionDate] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadElectionDate = async () => {
      if (!user?.uid) {
        return;
      }

      try {
        const response = await fetch(`/api/user?userId=${encodeURIComponent(user.uid)}`);
        if (!response.ok || cancelled) {
          return;
        }

        const profile = await response.json();
        if (!cancelled && typeof profile.electionDate === "string") {
          setElectionDate(profile.electionDate.slice(0, 10));
        }
      } catch (error) {
        console.error("Failed to load election date", error);
      }
    };

    loadElectionDate();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  const handleSave = async () => {
    try {
      await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid || "demo",
          language,
          voiceEnabled,
          highContrast,
          simpleMode,
          electionDate: electionDate || null,
        }),
      });
      setSaved(true);
      if (voiceEnabled) speak("Preferences saved successfully!");
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error("Save failed", e);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut(auth);
      router.push("/login");
    } catch (e) {
      console.error("Sign out failed", e);
      setSigningOut(false);
    }
  };

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Voter";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background pt-24 md:pt-28 pb-28 md:pb-8 px-4 md:px-8">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
      <div className="mx-auto max-w-2xl space-y-6 relative z-10">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-xl border border-white/6 bg-white/2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Preferences saved locally and to your profile.</p>
          </div>
        </div>

        {/* Profile */}
        <Card className="border-white/6 bg-white/2 backdrop-blur-xl">
          <CardHeader className="pb-3 bg-linear-to-r from-primary/10 to-blue-500/5">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-blue-400" /> Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/20">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{displayName}</p>
                <p className="text-sm text-muted-foreground truncate">{user?.email || "Not signed in"}</p>
              </div>
              {user && <Badge variant="outline" className="border-white/10 shrink-0">Authenticated</Badge>}
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card className="border-white/6 bg-white/2 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" /> Language & Communication
            </CardTitle>
            <CardDescription>Applies to AI responses and voice playback.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Language Picker */}
            <div>
              <button
                onClick={() => setShowLangPicker(!showLangPicker)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-white/6 bg-white/2 hover:bg-white/4 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{LANGUAGE_OPTIONS.find((l) => l.code === language)?.flag}</span>
                  <div className="text-left">
                    <p className="text-sm font-medium">Display Language</p>
                    <p className="text-xs text-muted-foreground">{LANGUAGE_OPTIONS.find((l) => l.code === language)?.label}</p>
                  </div>
                </div>
                <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${showLangPicker ? "rotate-90" : ""}`} />
              </button>

              {showLangPicker && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-2 grid grid-cols-2 gap-2"
                >
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code); setShowLangPicker(false); }}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                        language === lang.code
                          ? "bg-primary/15 border-primary/30 text-primary"
                          : "border-white/6 bg-white/2 hover:bg-white/4 text-foreground"
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span className="flex-1 text-left">{lang.label}</span>
                      {language === lang.code && <Check className="h-3.5 w-3.5 shrink-0" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            <Separator className="bg-white/6" />

            <ToggleRow
              icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
              label="Simple Language Mode"
              description={"Explain everything like I'm 15 — plain words, short sentences"}
              enabled={simpleMode}
              onToggle={() => setSimpleMode(!simpleMode)}
            />
          </CardContent>
        </Card>

        {/* Election Timeline */}
        <Card className="border-white/6 bg-white/2 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" /> Election Timeline
            </CardTitle>
            <CardDescription>Used for reminders, timeline cards, and notification timing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="block space-y-2">
              <span className="text-sm font-medium">Election date</span>
              <input
                type="date"
                value={electionDate}
                onChange={(event) => setElectionDate(event.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-background/60 px-3 text-sm outline-none transition focus:border-primary/40"
              />
            </label>
            <p className="text-xs text-muted-foreground">
              Update this any time when your official election date is confirmed.
            </p>
          </CardContent>
        </Card>

        {/* Accessibility */}
        <Card className="border-white/6 bg-white/2 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" /> Accessibility
            </CardTitle>
            <CardDescription>Visual and audio settings for inclusive access.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <ToggleRow
              icon={<Volume2 className="h-4 w-4 text-muted-foreground" />}
              label="Voice Playback"
              description="AI responses are read aloud via text-to-speech"
              enabled={voiceEnabled}
              onToggle={() => {
                const next = !voiceEnabled;
                setVoiceEnabled(next);
                if (next) {
                  // Small demo of voice
                  setTimeout(() => speak("Voice playback enabled. I will read responses aloud."), 200);
                }
              }}
            />
            <Separator className="bg-white/6" />
            <ToggleRow
              icon={<Eye className="h-4 w-4 text-muted-foreground" />}
              label="High Contrast Mode"
              description="Maximum contrast for better readability (WCAG AAA)"
              enabled={highContrast}
              onToggle={() => setHighContrast(!highContrast)}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleSave} className="flex-1 rounded-xl py-6 font-semibold gap-2 bg-linear-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-700 text-white">
            {saved ? <><Check className="h-4 w-4" /> Saved!</> : "Save Preferences"}
          </Button>
          <Button
            variant="outline"
            onClick={handleSignOut}
            disabled={signingOut}
            className="rounded-xl py-6 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-2 sm:w-auto"
          >
            <LogOut className="h-4 w-4" />
            {signingOut ? "Signing out..." : "Sign Out"}
          </Button>
        </div>

        {/* Version info */}
        <p className="text-center text-xs text-muted-foreground/40 pb-4">CivicGuide v1.0.0 · AI-powered by Gemini</p>
      </div>
    </div>
  );
}

function ToggleRow({
  icon, label, description, enabled, onToggle,
}: {
  icon: React.ReactNode; label: string; description: string; enabled: boolean; onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/2 transition-colors"
      aria-pressed={enabled}
    >
      <div className="flex items-center gap-3">
        {icon}
        <div className="text-left">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div
        className={`relative h-6 w-11 rounded-full transition-colors duration-200 shrink-0 ${enabled ? "bg-primary" : "bg-muted"}`}
        role="switch"
        aria-checked={enabled}
      >
        <motion.div
          animate={{ x: enabled ? 20 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-md"
        />
      </div>
    </button>
  );
}
