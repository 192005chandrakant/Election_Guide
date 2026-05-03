"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

type PlatformContentTab = "home" | "candidates" | "facts" | "ballot";

interface PlatformContent {
  [key: string]: unknown;
}

export default function AdminPlatformContent() {
  const [activeTab, setActiveTab] = useState<PlatformContentTab>("home");
  const [content, setContent] = useState<PlatformContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadContent = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/platform/${activeTab}`);
      if (response.ok) {
        const data = await response.json();
        setContent((data.content || data) as PlatformContent);
      }
    } catch {
      setMessage("Failed to load content");
    }
    setLoading(false);
  }, [activeTab]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadContent();
  }, [loadContent]);

  const saveContent = async () => {
    if (!content) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/platform/${activeTab}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (response.ok) {
        setMessage("✓ Saved successfully");
        setTimeout(() => setMessage(""), 2000);
      } else {
        setMessage("Failed to save");
      }
    } catch {
      setMessage("Error saving content");
    }
    setSaving(false);
  };

  const updateField = (key: string, value: unknown) => {
    setContent((prev) => (prev ? { ...prev, [key]: value } : null));
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-4 md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-xl border border-primary/20">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Platform Content Editor</h1>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {(["home", "candidates", "facts", "ballot"] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              onClick={() => setActiveTab(tab)}
              className="capitalize"
            >
              {tab === "home" ? "Home" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>

        {/* Content Editor */}
        {loading ? (
          <Card><CardContent className="pt-6">Loading...</CardContent></Card>
        ) : content ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{activeTab} Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Home */}
                {activeTab === "home" && content && (
                  <>
                    <div>
                      <label className="text-sm font-medium">Hero Title</label>
                      <Input
                        value={String(content.heroTitle || "")}
                        onChange={(e) => updateField("heroTitle", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Hero Description</label>
                      <textarea
                        value={String(content.heroDescription || "")}
                        onChange={(e) => updateField("heroDescription", e.target.value)}
                        className="mt-1 w-full p-2 rounded border border-input bg-background"
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Quick Actions (JSON)</label>
                      <textarea
                        value={JSON.stringify(Array.isArray(content.quickActions) ? content.quickActions : [], null, 2)}
                        onChange={(e) => {
                          try {
                            updateField("quickActions", JSON.parse(e.target.value));
                          } catch {
                            // Parse error, ignore
                          }
                        }}
                        className="mt-1 w-full p-2 rounded border border-input bg-background font-mono text-xs"
                        rows={6}
                      />
                    </div>
                  </>
                )}

                {/* Candidates */}
                {activeTab === "candidates" && content && (
                  <div>
                    <label className="text-sm font-medium">Candidates (JSON)</label>
                    <textarea
                      value={JSON.stringify(Array.isArray(content.candidates) ? content.candidates : [], null, 2)}
                      onChange={(e) => {
                        try {
                          updateField("candidates", JSON.parse(e.target.value));
                        } catch {
                          // Parse error, ignore
                        }
                      }}
                      className="mt-1 w-full p-2 rounded border border-input bg-background font-mono text-xs"
                      rows={12}
                    />
                  </div>
                )}

                {/* Facts */}
                {activeTab === "facts" && content && (
                  <div>
                    <label className="text-sm font-medium">Facts (JSON)</label>
                    <textarea
                      value={JSON.stringify(Array.isArray(content.facts) ? content.facts : [], null, 2)}
                      onChange={(e) => {
                        try {
                          updateField("facts", JSON.parse(e.target.value));
                        } catch {
                          // Parse error, ignore
                        }
                      }}
                      className="mt-1 w-full p-2 rounded border border-input bg-background font-mono text-xs"
                      rows={8}
                    />
                  </div>
                )}

                {/* Ballot */}
                {activeTab === "ballot" && content && (
                  <div>
                    <label className="text-sm font-medium">Ballot (JSON)</label>
                    <textarea
                      value={JSON.stringify(content.ballot && typeof content.ballot === "object" ? content.ballot : {}, null, 2)}
                      onChange={(e) => {
                        try {
                          updateField("ballot", JSON.parse(e.target.value));
                        } catch {
                          // Parse error, ignore
                        }
                      }}
                      className="mt-1 w-full p-2 rounded border border-input bg-background font-mono text-xs"
                      rows={12}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Message & Save Button */}
            {message && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-lg bg-primary/10 text-primary text-sm">
                {message}
              </motion.div>
            )}

            <div className="flex gap-2">
              <Button onClick={saveContent} disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={loadContent}>
                Reload
              </Button>
            </div>
          </>
        ) : (
          <Card><CardContent className="pt-6">No content found</CardContent></Card>
        )}
      </div>
    </div>
  );
}
