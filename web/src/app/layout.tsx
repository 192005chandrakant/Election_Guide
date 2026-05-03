import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import Providers from "@/components/providers";
import AccessibilityMenu from "@/components/accessibility-menu";

export const metadata: Metadata = {
  title: "CivicGuide - Smart Election Assistant",
  description:
    "Your personalized, interactive election and voting assistant. Get AI-powered guidance, track readiness, compare candidates, and find your polling booth.",
  manifest: "/manifest.json",
  keywords: [
    "election",
    "voting",
    "civic guide",
    "polling booth finder",
    "voter readiness",
    "AI assistant",
  ],
  icons: {
    icon: "/civicguide-mark.svg",
    shortcut: "/civicguide-mark.svg",
    apple: "/civicguide-mark.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#f2f5ff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/30 selection:text-primary-foreground overflow-x-hidden">
        <Providers>
          <Navbar />
          <div className="flex min-h-screen flex-col pt-0 md:pt-20 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
            {children}
          </div>
          <AccessibilityMenu />
        </Providers>
      </body>
    </html>
  );
}
