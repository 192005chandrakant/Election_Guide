"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { createUserProfile } from "@/lib/db";
import BrandLogo from "@/components/brand-logo";

type Message = {
  id: string;
  sender: "bot" | "user";
  text: string;
  options?: string[];
  inputType?: "text";
};

export default function Onboarding() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [step, setStep] = useState(0);
  const [location, setLocation] = useState("");
  const [isFirstTimeVoter, setIsFirstTimeVoter] = useState(true);
  const [, setElectionDate] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  useEffect(() => {
    // Initial greeting
    setTimeout(() => {
      setMessages([
        {
          id: "1",
          sender: "bot",
          text: "Namaste! 🇮🇳 I'm CivicGuide, your AI-powered voting assistant. I'll help you navigate the Indian election process with ease. Which state or constituency are you registered in?",
          inputType: "text",
        },
      ]);
    }, 500);
  }, []);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const trimmedText = text.trim();

    // Add user message
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: "user", text: trimmedText },
    ]);
    setInputValue("");

    // Simulate bot thinking and responding based on step
    setTimeout(() => {
      if (step === 0) {
        setLocation(trimmedText);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: "bot",
            text: `Got it, ${trimmedText}. Is this your first time voting in the General Elections?`,
            options: ["Yes, first time!", "No, I've voted before."],
          },
        ]);
        setStep(1);
      } else if (step === 1) {
        setIsFirstTimeVoter(/yes|first time/i.test(trimmedText));
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: "bot",
            text: "Great. What is your election date? Please use YYYY-MM-DD so I can tailor reminders and timelines.",
            inputType: "text",
          },
        ]);
        setStep(2);
      } else if (step === 2) {
        setElectionDate(trimmedText);

        // Save to Firebase
        const user = auth.currentUser;
        if (user) {
          createUserProfile(user.uid, {
            email: user.email,
            location,
            isFirstTimeVoter,
            electionDate: trimmedText,
          }).then(() => {
            setTimeout(() => {
              router.push("/dashboard");
            }, 1500);
          }).catch(err => {
             console.error("Failed to create profile", err);
             router.push("/dashboard"); // Fallback
          });
        } else {
          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
        }
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[80vh] flex flex-col bg-background/50 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-muted/20 flex items-center gap-3">
          <BrandLogo showWordmark={false} markClassName="h-10 w-10 rounded-2xl" />
          <div>
            <h2 className="font-bold">CivicGuide Assistant</h2>
            <p className="text-xs text-green-400">Online</p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.sender === "user"
                      ? "bg-linear-to-r from-primary/25 to-teal-600/15 text-foreground rounded-tr-sm border border-primary/40"
                      : "bg-linear-to-r from-teal-600/15 to-cyan-600/10 text-foreground rounded-tl-sm border border-teal-500/30"
                  }`}
                >
                  <p>{msg.text}</p>
                  
                  {/* Render Options if any */}
                  {msg.options && msg.sender === "bot" && (
                    <div className="mt-4 flex flex-col gap-2">
                      {msg.options.map((opt) => (
                        <Button
                          key={opt}
                          variant="secondary"
                          className="justify-start w-full whitespace-normal h-auto py-2"
                          onClick={() => handleSend(opt)}
                        >
                          {opt}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        {messages[messages.length - 1]?.inputType === "text" && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="p-4 border-t border-white/10 bg-background"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputValue);
              }}
              className="flex gap-2"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your state or constituency..."
                className="flex-1 bg-muted/50"
              />
              <Button type="submit">Send</Button>
            </form>
          </motion.div>
        )}
      </Card>
    </div>
  );
}
