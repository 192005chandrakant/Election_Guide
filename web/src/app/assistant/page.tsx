"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Menu, X, Send, Trash2, ShieldCheck, Accessibility, 
  MapPin, Radar, Users, BookOpen, Sparkles, AlertCircle, RefreshCcw,
  Volume2, Copy, Check, MessageCircle, CheckCircle2, HelpCircle, Info, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppSettings } from "@/lib/settings-context";
import { useAuth } from "@/lib/auth-context";
import { ElectionJourney } from "@/components/election-journey";

// ─── TYPES ───

type AgentInfo = {
  id: string;
  title: string;
  description: string;
  icon: string;
  promptFocus: string;
};

type AssistantResponse = {
  agent?: AgentInfo;
  answer: string;
  summary: string;
  keyPoints: string[];
  nextSteps: string[];
  followUpQuestions: string[];
  actionSuggestions: Array<{ label: string; query: string }>;
  trust: {
    source: string;
    confidence: "high" | "medium" | "low";
    note: string;
  };
  disclaimer: string;
  speechText: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  structured?: AssistantResponse;
  isError?: boolean;
};

const SUGGESTED_QUESTIONS = [
  "How do I apply for a Voter ID card (EPIC)?",
  "What documents are needed for registration?",
  "How to link Aadhaar with Voter ID?",
  "Find my constituency and polling booth.",
];

const renderBoldItalic = (text: string) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
};

const renderFormattedText = (text: string) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('### ')) return <h3 key={i} className="font-semibold text-foreground mt-3 mb-1">{trimmed.replace('### ', '')}</h3>;
    if (trimmed.startsWith('## ')) return <h2 key={i} className="font-bold text-primary mt-4 mb-2">{trimmed.replace('## ', '')}</h2>;
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) return <li key={i} className="ml-4 list-disc marker:text-primary/70">{renderBoldItalic(trimmed.substring(2))}</li>;
    if (trimmed === '') return <div key={i} className="h-2" />;
    return <p key={i} className="leading-relaxed mb-1.5">{renderBoldItalic(trimmed)}</p>;
  });
};

// Fallback just in case API fails to load catalog
const FALLBACK_AGENTS: AgentInfo[] = [
  { id: "guide", title: "Voting Guide", description: "Explains registration and voting steps clearly.", icon: "book-open", promptFocus: "Provide practical step-by-step election guidance." },
  { id: "readiness", title: "Readiness Engine", description: "Finds gaps and recommends the next best action.", icon: "radar", promptFocus: "Diagnose readiness gaps." },
  { id: "booth", title: "Booth Finder", description: "Helps users find polling places and directions.", icon: "map-pin", promptFocus: "Help the user plan how to find a polling place." },
  { id: "candidate", title: "Candidate Compare", description: "Turns candidate research into comparisons.", icon: "users", promptFocus: "Compare candidates neutrally." },
  { id: "plan", title: "Readiness Coach", description: "Creates personalized next steps.", icon: "sparkles", promptFocus: "Create short action steps." },
  { id: "trust", title: "Trust & Verification", description: "Explains source confidence.", icon: "shield-check", promptFocus: "Explain source quality." },
  { id: "accessibility", title: "Accessibility Helper", description: "Provides simple, readable guidance.", icon: "accessibility", promptFocus: "Focus on accessible voting options." },
];

function AssistantPageContent() {
  const { language, simpleMode, voiceEnabled, speak, stopSpeaking } = useAppSettings();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  
  const [viewMode, setViewMode] = useState<"chat" | "journey">(
    searchParams.get("mode") === "journey" ? "journey" : "chat"
  );
  const [location, setLocation] = useState("Unknown");
  const [isFirstTimeVoter, setIsFirstTimeVoter] = useState(true);
  const [copiedId, setCopiedId] = useState<string>("");
  const messageIdRef = useRef(0);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content: "👋 Hello! I'm **CivicGuide AI**, your personal election guide for India. Select a specialist mode from the sidebar, or just ask me anything about voting!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agentMode, setAgentMode] = useState("guide");
  const [agents, setAgents] = useState<AgentInfo[]>(FALLBACK_AGENTS);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Helper function to copy text to clipboard
  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(""), 2000);
    } catch (e) {
      console.error("Failed to copy", e);
    }
  };

  // Load agents
  useEffect(() => {
    fetch("/api/agents")
      .then(res => res.json())
      .then(data => {
        if (data.agents?.length > 0) setAgents(data.agents);
      })
      .catch(console.error);
  }, []);

  // Load user profile context
  useEffect(() => {
    const loadProfileContext = async () => {
      const userId = user?.uid || "demo";
      try {
        const response = await fetch(`/api/user?userId=${encodeURIComponent(userId)}`);
        if (!response.ok) return;
        
        const profile = await response.json();
        if (typeof profile.location === "string" && profile.location.trim()) {
          setLocation(profile.location);
        }
        if (typeof profile.isFirstTimeVoter === "boolean") {
          setIsFirstTimeVoter(profile.isFirstTimeVoter);
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
      }
    };
    loadProfileContext();
  }, [user]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const activeAgent = agents.find((a) => a.id === agentMode) || agents[0] || FALLBACK_AGENTS[0];

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const nextMessageId = () => `msg-${++messageIdRef.current}`;

    const userMsg: Message = { id: nextMessageId(), role: "user", content: text.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: text,
          userId: user?.uid || "anonymous",
          location: location,
          isFirstTimeVoter: isFirstTimeVoter,
          language: language || "en",
          simpleMode,
          agentMode,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        const errorMessage = data.details ? `${data.error} \n\nDebug Info: ${data.details}` : (data.error || "Failed to get response");
        throw new Error(errorMessage);
      }

      const aiMsg: Message = {
        id: nextMessageId(),
        role: "assistant",
        content: data.answer,
        structured: data as AssistantResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMsg: Message = {
        id: nextMessageId(),
        role: "assistant",
        content: error instanceof Error ? error.message : "I encountered an error connecting to my knowledge base. Please try again.",
        isError: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to render icon
  const renderIcon = (name: string, className = "w-5 h-5") => {
    switch (name) {
      case "book-open": return <BookOpen className={className} />;
      case "radar": return <Radar className={className} />;
      case "map-pin": return <MapPin className={className} />;
      case "users": return <Users className={className} />;
      case "sparkles": return <Sparkles className={className} />;
      case "shield-check": return <ShieldCheck className={className} />;
      case "accessibility": return <Accessibility className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex h-dvh w-screen overflow-hidden bg-background">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 flex flex-col 
        border-r border-border bg-card/50 backdrop-blur-xl transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-heading font-semibold tracking-tight brand-text-gradient flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Civic Specialists
          </h2>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* View Mode Toggle */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex rounded-lg bg-background p-1">
            <button
              onClick={() => setViewMode("chat")}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === "chat" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" /> Chat
            </button>
            <button
              onClick={() => setViewMode("journey")}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === "journey" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Radar className="w-3.5 h-3.5" /> Journey
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-2">
            {agents.map((agent) => {
              const isActive = agentMode === agent.id;
              return (
                <button
                  key={agent.id}
                  onClick={() => {
                    setAgentMode(agent.id);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex flex-col items-start p-3 rounded-xl transition-all text-left border
                    ${isActive 
                      ? "bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(124,58,237,0.1)]" 
                      : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/10"}
                  `}
                >
                  <div className="flex items-center gap-3 font-medium">
                    <span className={isActive ? "text-primary" : "text-muted-foreground"}>
                      {renderIcon(agent.icon, "w-4 h-4")}
                    </span>
                    <span className={isActive ? "text-foreground" : "text-muted-foreground"}>
                      {agent.title}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                    {agent.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setMessages([messages[0]])}
          >
            <Trash2 className="w-4 h-4" />
            Clear Chat History
          </Button>
        </div>
      </aside>

      {/* Main Chat Area or Journey View */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 relative">
        {viewMode === "journey" ? (
          <div className="flex-1 overflow-auto bg-background p-4 sm:p-6 lg:p-12">
            <div className="max-w-4xl mx-auto">
              <header className="flex items-center gap-3 mb-8 lg:hidden">
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                  <Menu className="w-5 h-5" />
                </Button>
                <h1 className="font-semibold text-lg">My Voter Journey</h1>
              </header>
              <ElectionJourney onStepAction={(query) => {
                setViewMode("chat");
                handleSend(query);
              }} />
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="h-14 flex items-center gap-3 px-4 border-b border-border bg-card/30 backdrop-blur-md sticky top-0 z-10">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  {renderIcon(activeAgent.icon, "w-4 h-4")}
                </div>
                <div>
                  <h1 className="font-semibold text-sm leading-tight">{activeAgent.title}</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">{activeAgent.description}</p>
                </div>
              </div>
            </header>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
              <div className="max-w-4xl mx-auto space-y-6 pb-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`
                      max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 
                      ${msg.role === "user" 
                        ? "bg-primary text-primary-foreground rounded-tr-sm" 
                        : msg.isError
                          ? "bg-destructive/10 border border-destructive/30 text-foreground rounded-tl-sm"
                          : "glass border-border/50 text-foreground rounded-tl-sm shadow-sm"
                      }
                    `}>
                      {msg.isError && (
                        <div className="flex items-center gap-2 text-destructive font-semibold mb-2 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          Connection Error
                        </div>
                      )}
                      
                      {/* Plain Text Rendering (if no structure) */}
                      {!msg.structured && (
                        <div className="text-sm sm:text-base leading-relaxed">
                          {renderFormattedText(msg.content)}
                        </div>
                      )}

                      {/* Structured response rendering */}
                      {msg.structured && !msg.isError && (
                        <div className="space-y-5 mt-1">
                          
                          {/* Summary Bubble */}
                          {msg.structured.summary && (
                            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-sm text-foreground font-medium">
                              <Sparkles className="w-4 h-4 inline mr-2 text-primary" />
                              {renderBoldItalic(msg.structured.summary)}
                            </div>
                          )}

                          {/* Main Answer */}
                          {msg.structured.answer && (
                            <div className="text-sm sm:text-base text-foreground/90">
                              {renderFormattedText(msg.structured.answer)}
                            </div>
                          )}

                          {/* Key Points */}
                          {msg.structured.keyPoints?.length > 0 && (
                            <div className="glass rounded-xl p-4 border border-border/50">
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Key Points
                              </h4>
                              <ul className="space-y-2">
                                {msg.structured.keyPoints.map((kp, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm">
                                    <span className="text-primary mt-0.5">•</span>
                                    <span className="text-muted-foreground">{renderBoldItalic(kp)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Next Steps */}
                          {msg.structured.nextSteps?.length > 0 && (
                            <div className="bg-background/40 rounded-xl p-4 border border-border">
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3 flex items-center gap-2">
                                <ArrowRight className="w-4 h-4 text-primary" /> Next Steps
                              </h4>
                              <div className="space-y-2.5">
                                {msg.structured.nextSteps.map((step, i) => (
                                  <div key={i} className="flex items-start gap-3 bg-card p-2.5 rounded-lg border border-border/50 shadow-sm">
                                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
                                    <span className="text-sm text-foreground">{renderBoldItalic(step)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Trust Indicator & Disclaimer */}
                          <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            {msg.structured.trust && (
                              <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border ${
                                msg.structured.trust.confidence === "high" ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400" :
                                msg.structured.trust.confidence === "medium" ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400" :
                                "bg-destructive/10 border-destructive/20 text-destructive"
                              }`}>
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span className="font-medium capitalize">{msg.structured.trust.confidence} Confidence</span>
                              </div>
                            )}
                            {msg.structured.disclaimer && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1.5 rounded-md">
                                <Info className="w-3.5 h-3.5 shrink-0" />
                                <span>{msg.structured.disclaimer}</span>
                              </div>
                            )}
                          </div>

                          {/* Follow up Questions & Actions */}
                          {(msg.structured.followUpQuestions?.length > 0 || msg.structured.actionSuggestions?.length > 0) && (
                            <div className="pt-3 border-t border-border/50">
                              <h4 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
                                <HelpCircle className="w-3.5 h-3.5" /> Suggested Follow-ups
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {msg.structured.actionSuggestions?.map((action, i) => (
                                  <Button 
                                    key={`action-${i}`} 
                                    variant="secondary" 
                                    size="sm" 
                                    className="text-xs rounded-full bg-primary/10 hover:bg-primary/20 text-primary border-0"
                                    onClick={() => handleSend(action.query)}
                                  >
                                    {action.label}
                                  </Button>
                                ))}
                                {msg.structured.followUpQuestions?.map((q, i) => (
                                  <Button 
                                    key={`q-${i}`} 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-xs rounded-full bg-background hover:bg-muted text-foreground border border-border/60"
                                    onClick={() => handleSend(q)}
                                  >
                                    {q}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* AI Utilities */}
                          <div className="flex items-center gap-2 pt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-muted-foreground hover:text-primary"
                              onClick={() => copyToClipboard(msg.structured!.answer, msg.id)}
                            >
                              {copiedId === msg.id ? <Check className="w-4 h-4 mr-1 text-green-500" /> : <Copy className="w-4 h-4 mr-1" />}
                              <span className="text-xs">Copy</span>
                            </Button>
                            
                            {voiceEnabled && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-muted-foreground hover:text-primary"
                                onClick={() => {
                                  stopSpeaking();
                                  if (msg.structured?.speechText) speak(msg.structured.speechText);
                                }}
                              >
                                <Volume2 className="w-4 h-4 mr-1" />
                                <span className="text-xs">Listen</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="glass rounded-2xl rounded-tl-sm p-4 w-24 flex items-center justify-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background/80 backdrop-blur-md border-t border-border">
              <div className="max-w-4xl mx-auto">
                {/* Suggested starters if chat is empty */}
                {messages.length === 1 && (
                  <div className="flex flex-wrap gap-2 mb-4 justify-center">
                    {SUGGESTED_QUESTIONS.map((q, i) => (
                      <Button 
                        key={i} 
                        variant="outline" 
                        size="sm"
                        className="rounded-full text-xs bg-card/50 hover:bg-primary/10 hover:border-primary/30"
                        onClick={() => handleSend(q)}
                      >
                        {q}
                      </Button>
                    ))}
                  </div>
                )}

                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                  className="relative flex items-center"
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Message ${activeAgent.title}...`}
                    className="pr-12 py-6 rounded-2xl bg-card border-border/50 focus-visible:ring-primary/50 shadow-sm"
                    disabled={isLoading}
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 rounded-xl h-10 w-10 bg-primary hover:bg-primary/90 text-white"
                  >
                    {isLoading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </form>
                <p className="text-[10px] text-center text-muted-foreground mt-3">
                  CivicGuide AI can make mistakes. Please verify important election rules with the ECI.
                </p>
              </div>
            </div>
          </>
        )}
      </main>

    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-background px-4 text-sm text-muted-foreground">
          Loading assistant workspace...
        </div>
      }
    >
      <AssistantPageContent />
    </Suspense>
  );
}
