"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Accessibility, Type, Eye, Languages, Ear, X, Check } from "lucide-react";
import { useAppSettings } from "@/lib/settings-context";
import { Button } from "@/components/ui/button";
import { LANGUAGE_OPTIONS, useI18n } from "@/lib/i18n";

export default function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useI18n();
  const {
    language,
    setLanguage,
    voiceEnabled,
    setVoiceEnabled,
    highContrast,
    setHighContrast,
    fontSize,
    setFontSize,
  } = useAppSettings();
  const fontSizes = ["normal", "large", "xlarge"] as const;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-16 left-0 mb-4 w-72 rounded-2xl border border-white/10 bg-background/80 p-4 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2" suppressHydrationWarning>
                <Accessibility className="h-4 w-4 text-primary" /> {t("a11y.accessibility")}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close accessibility menu"
                suppressHydrationWarning
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Language */}
              <div className="space-y-2">
                <p className="text-xs font-medium flex items-center gap-2">
                  <Languages className="h-3.5 w-3.5" /> {t("a11y.language")}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <Button
                      key={lang.code}
                      variant="outline"
                      size="sm"
                      onClick={() => setLanguage(lang.code)}
                      className={`h-8 text-xs ${
                        language === lang.code
                          ? "bg-primary/20 border-primary text-primary"
                          : "border-white/10"
                      }`}
                    >
                      {language === lang.code && <Check className="mr-1.5 h-3 w-3" />}
                      {lang.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Text Size */}
              <div className="space-y-2">
                <p className="text-xs font-medium flex items-center gap-2">
                  <Type className="h-3.5 w-3.5" /> {t("a11y.textSize")}
                </p>
                <div className="flex gap-2">
                  {fontSizes.map((size) => (
                    <Button
                      key={size}
                      variant="outline"
                      size="sm"
                      onClick={() => setFontSize(size)}
                      className={`h-8 flex-1 text-xs ${
                        fontSize === size
                          ? "bg-primary/20 border-primary text-primary"
                          : "border-white/10"
                      }`}
                    >
                      {size === "normal" ? "A" : size === "large" ? "A+" : "A++"}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <Button
                  variant="ghost"
                  onClick={() => setHighContrast(!highContrast)}
                  className={`w-full justify-start h-9 text-sm ${
                    highContrast ? "bg-primary/10 text-primary" : ""
                  }`}
                >
                  <Eye className="mr-3 h-4 w-4" /> {t("a11y.highContrast")}
                  {highContrast && <Check className="ml-auto h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`w-full justify-start h-9 text-sm ${
                    voiceEnabled ? "bg-primary/10 text-primary" : ""
                  }`}
                >
                  <Ear className="mr-3 h-4 w-4" /> {t("a11y.voicePlayback")}
                  {voiceEnabled && <Check className="ml-auto h-4 w-4" />}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close accessibility menu" : "Open accessibility menu"}
        className="h-14 w-14 rounded-full shadow-2xl hover:scale-105 transition-transform"
        suppressHydrationWarning
      >
        <Accessibility className="h-6 w-6" />
      </Button>
    </div>
  );
}
