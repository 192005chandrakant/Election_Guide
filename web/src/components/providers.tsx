"use client";

import { AuthProvider } from "@/lib/auth-context";
import { AppSettingsProvider } from "@/lib/settings-context";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AppSettingsProvider>
        {children}
      </AppSettingsProvider>
    </AuthProvider>
  );
}
