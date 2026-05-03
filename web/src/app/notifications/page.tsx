"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Bell,
  AlertTriangle,
  Info,
  Lightbulb,
  Clock,
  X,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { messaging } from "@/lib/firebase";
import { getToken } from "firebase/messaging";

type Notification = {
  id: string;
  type: "urgent" | "reminder" | "info" | "suggestion";
  title: string;
  body: string;
  action: { label: string; href: string } | null;
  timestamp: string;
  read: boolean;
};

const TYPE_CONFIG = {
  urgent: { icon: AlertTriangle, color: "text-red-400", bg: "bg-linear-to-r from-red-600/20 to-pink-600/10", border: "border-red-500/40" },
  reminder: { icon: Clock, color: "text-amber-400", bg: "bg-linear-to-r from-amber-600/20 to-orange-600/10", border: "border-amber-500/40" },
  info: { icon: Info, color: "text-blue-400", bg: "bg-linear-to-r from-primary/20 to-sky-600/10", border: "border-blue-500/40" },
  suggestion: { icon: Lightbulb, color: "text-green-400", bg: "bg-linear-to-r from-green-600/20 to-emerald-600/10", border: "border-green-500/40" },
};

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    typeof window === "undefined" ? "default" : Notification.permission
  );
  const userId = user?.uid || "demo";

  const syncNotificationState = async (
    action: "read" | "dismiss" | "read_all",
    notificationId?: string
  ) => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          action,
          ...(notificationId ? { notificationId } : {}),
        }),
      });
    } catch {
      // Keep UI responsive even when sync fails.
    }
  };

  const requestPermission = async () => {
    try {
      const p = await Notification.requestPermission();
      setPermission(p);
      if (p === "granted" && messaging) {
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
        });
        if (token) {
          // Save token to backend (we assume /api/user/fcm exists or will be created)
          await fetch("/api/user/fcm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user?.uid || "anonymous", token })
          });
        }
      }
    } catch (error) {
      console.error("Error requesting notification permission", error);
    }
  };

  useEffect(() => {
    if (authLoading) {
      return;
    }

    fetch(`/api/notifications?userId=${encodeURIComponent(userId)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load notifications");
        }
        return res.json();
      })
      .then((data) => {
        setNotifications(data.notifications || []);
      })
      .catch(() => {
        setNotifications([]);
      })
      .finally(() => setLoading(false));
  }, [userId, authLoading]);

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    void syncNotificationState("dismiss", id);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    void syncNotificationState("read", id);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-background pt-24 md:pt-28 pb-28 md:pb-8 px-4 md:px-8">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
      <div className="mx-auto max-w-2xl space-y-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-xl border border-white/6 bg-white/2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                Notifications
                {unreadCount > 0 && (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">{unreadCount} new</Badge>
                )}
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">Smart reminders to keep you on track.</p>
            </div>
          </div>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                void syncNotificationState("read_all");
              }}
            >
              Mark all read
            </Button>
          )}
        </div>

        {/* Push Notification Promo */}
        {permission !== "granted" && (
          <Card className="border-blue-500/20 bg-blue-500/10 backdrop-blur-xl">
            <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">Turn on push notifications</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Never miss a deadline or polling update.</p>
                </div>
              </div>
              <Button onClick={requestPermission} size="sm" className="shrink-0 rounded-lg">
                Enable Notifications
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Notifications List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-white/6 bg-white/2 animate-pulse">
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-xl bg-muted/30" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-40 bg-muted/30 rounded" />
                      <div className="h-3 w-full bg-muted/20 rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Card className="border-white/6 bg-white/2 backdrop-blur-xl">
            <CardContent className="flex flex-col items-center text-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-muted/20 flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="font-semibold mb-1">All caught up!</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                No new notifications. We&apos;ll send smart reminders as election dates approach.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {notifications.map((notif, i) => {
                const config = TYPE_CONFIG[notif.type];
                const Icon = config.icon;
                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: i * 0.05 }}
                    layout
                  >
                    <Card
                      className={`backdrop-blur-xl transition-all cursor-pointer ${
                        notif.read
                          ? "border-white/4 bg-white/1 opacity-60"
                          : `${config.border} ${config.bg}`
                      }`}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <CardContent className="p-4 flex gap-4">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.bg} ${config.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className={`text-sm font-semibold ${notif.read ? "text-muted-foreground" : ""}`}>
                              {notif.title}
                            </h3>
                            <button
                              onClick={(e) => { e.stopPropagation(); dismissNotification(notif.id); }}
                              className="p-1 rounded-md hover:bg-white/6 text-muted-foreground shrink-0"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed mb-2">{notif.body}</p>
                          {notif.action && (
                            <Link href={notif.action.href}>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-7 text-xs rounded-lg gap-1"
                              >
                                {notif.action.label} <ExternalLink className="h-3 w-3" />
                              </Button>
                            </Link>
                          )}
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
