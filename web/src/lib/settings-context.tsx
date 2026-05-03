"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";

type AppSettings = {
  language: string;
  voiceEnabled: boolean;
  highContrast: boolean;
  simpleMode: boolean;
  fontSize: "normal" | "large" | "xlarge";
};

type AppSettingsContextType = AppSettings & {
  setLanguage: (lang: string) => void;
  setVoiceEnabled: (v: boolean) => void;
  setHighContrast: (v: boolean) => void;
  setSimpleMode: (v: boolean) => void;
  setFontSize: (v: "normal" | "large" | "xlarge") => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
};

const defaults: AppSettings = {
  language: "en",
  voiceEnabled: false,
  highContrast: false,
  simpleMode: false,
  fontSize: "normal",
};

const AppSettingsContext = createContext<AppSettingsContextType>({
  ...defaults,
  setLanguage: () => {},
  setVoiceEnabled: () => {},
  setHighContrast: () => {},
  setSimpleMode: () => {},
  setFontSize: () => {},
  speak: () => {},
  stopSpeaking: () => {},
});

const STORAGE_KEY = "civicguide_settings";

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [hasLocalSettings] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return Boolean(localStorage.getItem(STORAGE_KEY));
  });
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window === "undefined") {
      return defaults;
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch {
      return defaults;
    }
  });

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  useEffect(() => {
    if (authLoading || !user || hasLocalSettings) {
      return;
    }

    const controller = new AbortController();

    const hydrateFromProfile = async () => {
      try {
        const response = await fetch(`/api/user?userId=${encodeURIComponent(user.uid)}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const profile = await response.json();

        setSettings((current) => ({
          ...current,
          language: typeof profile.language === "string" ? profile.language : current.language,
          voiceEnabled:
            typeof profile.voiceEnabled === "boolean" ? profile.voiceEnabled : current.voiceEnabled,
          highContrast:
            typeof profile.highContrast === "boolean" ? profile.highContrast : current.highContrast,
          simpleMode:
            typeof profile.simpleMode === "boolean" ? profile.simpleMode : current.simpleMode,
        }));
      } catch {
        // Keep local defaults if the profile cannot be loaded.
      }
    };

    hydrateFromProfile();

    return () => controller.abort();
  }, [authLoading, hasLocalSettings, user]);

  // Apply high contrast class to document
  useEffect(() => {
    if (settings.highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }, [settings.highContrast]);

  // Apply simple-mode class to document
  useEffect(() => {
    if (settings.simpleMode) {
      document.documentElement.classList.add("simple-mode");
    } else {
      document.documentElement.classList.remove("simple-mode");
    }
  }, [settings.simpleMode]);

  useEffect(() => {
    document.documentElement.lang = settings.language || "en";
    document.documentElement.dir = settings.language === "ar" ? "rtl" : "ltr";
  }, [settings.language]);

  // Apply font-size class
  useEffect(() => {
    document.documentElement.classList.remove("text-size-large", "text-size-xlarge");
    if (settings.fontSize === "large") {
      document.documentElement.classList.add("text-size-large");
    } else if (settings.fontSize === "xlarge") {
      document.documentElement.classList.add("text-size-xlarge");
    }
  }, [settings.fontSize]);

  // Voice synthesis using Web Speech API
  const speak = useCallback(
    (text: string) => {
      if (!settings.voiceEnabled || typeof window === "undefined") return;
      if (!("speechSynthesis" in window)) return;

      window.speechSynthesis.cancel();

      // Strip markdown-style formatting
      const cleanText = text
        .replace(/\*\*/g, "")
        .replace(/[•📅📬⚠️💡✅🗳️🎉🕐📍🚗👥🚫🗣️]/gu, "")
        .replace(/\n+/g, ". ");

      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Map language codes to speech synthesis lang codes
      const langMap: Record<string, string> = {
        en: "en-IN",
        es: "es-ES",
        hi: "hi-IN",
        zh: "zh-CN",
        fr: "fr-FR",
        ar: "ar-SA",
      };
      utterance.lang = langMap[settings.language] || "en-US";
      utterance.rate = 0.95;
      utterance.pitch = 1;

      window.speechSynthesis.speak(utterance);
    },
    [settings.voiceEnabled, settings.language]
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const value: AppSettingsContextType = {
    ...settings,
    setLanguage: (language) => setSettings((s) => ({ ...s, language })),
    setVoiceEnabled: (voiceEnabled) => setSettings((s) => ({ ...s, voiceEnabled })),
    setHighContrast: (highContrast) => setSettings((s) => ({ ...s, highContrast })),
    setSimpleMode: (simpleMode) => setSettings((s) => ({ ...s, simpleMode })),
    setFontSize: (fontSize) => setSettings((s) => ({ ...s, fontSize })),
    speak,
    stopSpeaking,
  };

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export const useAppSettings = () => useContext(AppSettingsContext);
