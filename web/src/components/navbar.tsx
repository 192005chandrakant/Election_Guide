"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Home, LayoutDashboard, MessageSquare, Users, MapPin,
  BookOpen, Bell, Settings, Package, Vote, Menu, X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import BrandLogo from "@/components/brand-logo";
import { useI18n } from "@/lib/i18n";

const NAV_ITEMS = [
  { href: "/", labelKey: "nav.home", icon: Home },
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/guide", labelKey: "nav.guide", icon: BookOpen },
  { href: "/assistant", labelKey: "nav.assistant", icon: MessageSquare },
  { href: "/candidates", labelKey: "nav.candidates", icon: Users },
  { href: "/ballot", labelKey: "nav.ballot", icon: Vote },
  { href: "/map", labelKey: "nav.map", icon: MapPin },
];

const MOBILE_NAV = [
  { href: "/", labelKey: "nav.home", icon: Home },
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/assistant", labelKey: "nav.assistant", icon: MessageSquare },
  { href: "/ballot", labelKey: "nav.ballot", icon: Vote },
  { href: "/map", labelKey: "nav.map", icon: MapPin },
];

// Pages where nav should be hidden
const HIDDEN_ROUTES = ["/login", "/onboarding", "/assistant"];

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useI18n();
  const [notifCount, setNotifCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch notification count
  useEffect(() => {
    if (HIDDEN_ROUTES.includes(pathname)) return;

    const controller = new AbortController();
    const userId = user?.uid || "demo";

    fetch(`/api/notifications?userId=${encodeURIComponent(userId)}`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((d) => {
        const unreadCount = Array.isArray(d.notifications)
          ? d.notifications.filter((n: { read?: boolean }) => !n.read).length
          : d.unreadCount;
        setNotifCount(Number.isFinite(unreadCount) ? unreadCount : Number(d.count ?? 0));
      })
      .catch(() => {});

    return () => controller.abort();
  }, [pathname, user]);

  if (HIDDEN_ROUTES.includes(pathname)) return null;

  // User initials for avatar
  const initials = user
    ? (user.displayName?.slice(0, 2) || user.email?.slice(0, 2) || "??").toUpperCase()
    : null;

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const }
    }
  } satisfies Variants;

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.3 }
    })
  } satisfies Variants;

  return (
    <>
      {/* ─── Desktop Top Navbar ─── */}
      <motion.nav 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="fixed top-0 left-0 right-0 z-50 hidden md:block px-4 sm:px-6 py-3 sm:py-4"
      >
        <div className={`mx-auto max-w-7xl transition-all duration-300 ${
          scrolled 
            ? "rounded-2xl border border-foreground/10 bg-background/60 shadow-[0_16px_48px_-28px] shadow-foreground/20 backdrop-blur-2xl" 
            : "rounded-2xl border border-foreground/5 bg-background/40 shadow-[0_8px_32px_-20px] shadow-foreground/10 backdrop-blur-md"
        }`}>
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-4">

            {/* Logo - More responsive */}
            <motion.div custom={0} variants={itemVariants}>
              <Link href="/" className="flex items-center gap-2 group shrink-0 hover:opacity-80 transition-opacity">
                <BrandLogo 
                  markClassName="h-9 w-9 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl" 
                  textClassName="hidden md:block text-sm sm:text-base" 
                />
              </Link>
            </motion.div>

            {/* Main Navigation - Desktop */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item, i) => {
                const isActive = pathname === item.href;
                return (
                  <motion.div key={item.href} custom={i} variants={itemVariants}>
                    <Link
                      href={item.href}
                      className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-200 group ${
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-foreground/6"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="navbar-active"
                          className="absolute inset-0 rounded-lg bg-linear-to-r from-primary/15 to-primary/5 border border-primary/30"
                          transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                        />
                      )}
                      <item.icon className="relative z-10 h-4 w-4 sm:h-4.5 sm:w-4.5" />
                      <span className="relative z-10 whitespace-nowrap">{t(item.labelKey, item.labelKey)}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Right Section - Responsive */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Additional items for larger screens */}
              <motion.div custom={NAV_ITEMS.length} variants={itemVariants}>
                <Link
                  href="/kit"
                  title={t("nav.kit")}
                  aria-label={t("nav.kit")}
                  className={`p-2 rounded-lg transition-all duration-200 group ${pathname === "/kit" ? "bg-linear-to-r from-primary/20 to-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-foreground/6"}`}
                >
                  <Package className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </Link>
              </motion.div>

              <motion.div custom={NAV_ITEMS.length + 1} variants={itemVariants}>
                <Link
                  href="/notifications"
                  title={t("nav.notifications")}
                  aria-label={notifCount > 0 ? `${t("nav.notifications")}, ${notifCount} unread` : t("nav.notifications")}
                  className={`relative p-2 rounded-lg transition-all duration-200 group ${pathname === "/notifications" ? "bg-linear-to-r from-primary/20 to-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-foreground/6"}`}
                >
                  <Bell className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                  {notifCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-0.5 right-0.5 flex h-2.5 w-2.5"
                    >
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-md shadow-red-500/50" />
                    </motion.span>
                  )}
                </Link>
              </motion.div>

              <motion.div custom={NAV_ITEMS.length + 2} variants={itemVariants}>
                <Link
                  href="/settings"
                  title={t("nav.settings")}
                  aria-label={t("nav.settings")}
                  className={`p-2 rounded-lg transition-all duration-200 group ${pathname === "/settings" ? "bg-linear-to-r from-primary/20 to-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-foreground/6"}`}
                >
                  <Settings className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </Link>
              </motion.div>

              {/* User Avatar / Login Button */}
              <motion.div custom={NAV_ITEMS.length + 3} variants={itemVariants} className="ml-1 sm:ml-2">
                {user ? (
                  <Link
                    href="/settings"
                    aria-label={t("nav.profile")}
                    className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 via-teal-600 to-green-600 text-white text-xs font-bold shadow-md hover:shadow-lg hover:shadow-blue-600/40 transition-all duration-200 cursor-pointer border border-white/10 hover:border-white/20"
                  >
                    {initials}
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    aria-label={t("nav.signIn")}
                    className="px-3 sm:px-4 py-2 rounded-lg bg-linear-to-r from-blue-600 to-teal-600 text-white text-xs font-semibold border border-blue-500/50 hover:border-blue-400 shadow-md hover:shadow-lg hover:shadow-blue-600/30 transition-all duration-200"
                  >
                    {t("nav.signIn")}
                  </Link>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ─── Mobile Navigation ─── */}
      <motion.nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-3 pb-3">
        <motion.div
          layout
          className={`flex items-center justify-between rounded-2xl border transition-all duration-300 ${
            scrolled 
              ? "border-foreground/15 bg-background/70 shadow-[0_16px_40px_-30px] shadow-foreground/40 backdrop-blur-2xl" 
              : "border-foreground/10 bg-background/80 shadow-[0_16px_40px_-30px] shadow-foreground/30 backdrop-blur-xl"
          } px-1 py-2`}
        >
          {MOBILE_NAV.map((item, i) => {
            const isActive = pathname === item.href;
            return (
              <motion.div key={item.href} custom={i} variants={itemVariants}>
                <Link
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label={t(item.labelKey, item.labelKey)}
                  className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-200 group"
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-active"
                      className="absolute inset-0 rounded-lg bg-linear-to-r from-primary/20 to-primary/5 border border-primary/30"
                      transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                    />
                  )}
                  <item.icon className={`relative z-10 h-5 w-5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                  <span className={`relative z-10 text-[9px] sm:text-[10px] font-semibold transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
                    {t(item.labelKey, item.labelKey)}
                  </span>
                </Link>
              </motion.div>
            );
          })}

          {/* Mobile notifications and menu */}
          <motion.div custom={MOBILE_NAV.length} variants={itemVariants}>
            <Link
              href="/notifications"
              onClick={() => setMobileMenuOpen(false)}
              aria-label={notifCount > 0 ? `${t("nav.alerts")}, ${notifCount} unread` : t("nav.alerts")}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-200 group"
            >
              {pathname === "/notifications" && (
                <motion.div layoutId="mobile-nav-active" className="absolute inset-0 rounded-lg bg-linear-to-r from-primary/20 to-primary/5 border border-primary/30" transition={{ type: "spring", duration: 0.5, bounce: 0.2 }} />
              )}
              <div className="relative z-10">
                <Bell className={`h-5 w-5 transition-colors ${pathname === "/notifications" ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                {notifCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 border border-background shadow-md shadow-red-500/50"
                  />
                )}
              </div>
              <span className={`text-[9px] sm:text-[10px] font-semibold transition-colors ${pathname === "/notifications" ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
                {t("nav.alerts")}
              </span>
            </Link>
          </motion.div>

          {/* More menu for mobile */}
          <motion.button
            custom={MOBILE_NAV.length + 1}
            variants={itemVariants}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? t("nav.closeMenu") : t("nav.menu")}
            className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-200 group"
          >
            <div className="relative z-10">
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-primary" />
              ) : (
                <Menu className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
              )}
            </div>
            <span className={`text-[9px] sm:text-[10px] font-semibold ${mobileMenuOpen ? "text-primary" : "text-muted-foreground group-hover:text-foreground"} transition-colors`}>{t("nav.menu")}</span>
          </motion.button>
        </motion.div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-20 left-3 right-3 rounded-2xl border border-foreground/10 bg-background/95 shadow-xl backdrop-blur-xl overflow-hidden"
            >
              <div className="p-3 space-y-3">
                <div className="flex items-center justify-between gap-3 border-b border-white/6 pb-3">
                  <BrandLogo showWordmark={false} markClassName="h-9 w-9 rounded-xl" />
                  <button onClick={() => setMobileMenuOpen(false)} aria-label={t("nav.closeMenu")} className="rounded-full p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link href="/kit" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${pathname === "/kit" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-foreground/6"}`}>
                    <Package className="h-4 w-4" />
                    <span className="text-sm font-medium">{t("nav.kit")}</span>
                  </Link>

                  <Link href="/settings" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${pathname === "/settings" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-foreground/6"}`}>
                    <Settings className="h-4 w-4" />
                    <span className="text-sm font-medium">{t("nav.settings")}</span>
                  </Link>

                  <Link href="/notifications" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${pathname === "/notifications" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-foreground/6"}`}>
                    <Bell className="h-4 w-4" />
                    <span className="text-sm font-medium">{t("nav.notifications")}</span>
                  </Link>

                  {!user ? (
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 bg-linear-to-r from-blue-600 to-teal-600 text-white transition-all">
                      <span className="text-sm font-semibold">{t("nav.signIn")}</span>
                    </Link>
                  ) : (
                    <Link href="/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 bg-primary/10 text-primary transition-all">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-teal-600 text-white text-xs font-bold">
                        {initials}
                      </div>
                      <span className="text-sm font-medium">{t("nav.profile")}</span>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
