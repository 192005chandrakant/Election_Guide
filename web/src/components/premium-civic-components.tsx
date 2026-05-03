import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  BellRing,
  CheckCircle2,
  Fingerprint,
  Flame,
  MapPin,
  Radar,
  Sparkles,
  Trophy,
  Users,
  Vote,
  WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Readiness", value: "72%", delta: "+18%", icon: Radar, tone: "violet" },
  { label: "Trust score", value: "Verified", delta: "sources", icon: BadgeCheck, tone: "cyan" },
  { label: "Civic XP", value: "1,840", delta: "+240", icon: Trophy, tone: "coral" },
];

const programs = [
  { icon: Vote, label: "Voting Plan", value: "4/6 steps" },
  { icon: Users, label: "Candidate Review", value: "Issue filters" },
  { icon: MapPin, label: "Booth Route", value: "Ready" },
  { icon: WifiOff, label: "Offline Kit", value: "Saved" },
];

const activity = [
  { title: "ID requirement checked", time: "2m ago", tone: "bg-emerald-400" },
  { title: "AI assistant prepared next actions", time: "9m ago", tone: "bg-violet-400" },
  { title: "Booth source labeled as verified", time: "18m ago", tone: "bg-cyan-400" },
];

export function PremiumCivicShowcase({ className }: { className?: string }) {
  return (
    <section className={cn("rounded-[2rem] border border-white/10 bg-[#07091a]/92 p-3 shadow-[0_32px_90px_-48px_rgba(124,58,237,0.9)]", className)}>
      <div className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-[linear-gradient(135deg,rgba(17,24,63,0.96),rgba(7,9,26,0.98)_42%,rgba(18,24,59,0.96))] p-5 text-white md:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(125,92,255,0.18),transparent_30%),radial-gradient(circle_at_76%_8%,rgba(255,116,116,0.14),transparent_28%),radial-gradient(circle_at_70%_92%,rgba(34,211,238,0.12),transparent_32%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] bg-size-[42px_42px] opacity-[0.22]" />

        <div className="relative flex flex-col gap-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/4 p-1">
              {["Home", "Readiness", "Assistant", "Booth"].map((item, index) => (
                <span
                  key={item}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-xs font-semibold text-white/65",
                    index === 0 && "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.1)]"
                  )}
                >
                  {item}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/4 text-white/75">
                <BellRing className="h-4 w-4" />
              </button>
              <button className="rounded-full border border-violet-300/25 bg-violet-500/20 px-4 py-2 text-sm font-semibold text-violet-100">
                Vote Ready
              </button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr_0.72fr]">
            <GlassPanel className="min-h-64">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">Voting Analytics</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight">Engagement pulse</h3>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-200">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
              <NeonLineChart className="mt-7" />
              <div className="mt-6 grid grid-cols-3 gap-3">
                {stats.map((stat) => (
                  <MiniStat key={stat.label} {...stat} />
                ))}
              </div>
            </GlassPanel>

            <GlassPanel className="min-h-64">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">Readiness Engine</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight">Mission control</h3>
                </div>
                <Fingerprint className="h-6 w-6 text-cyan-200" />
              </div>
              <ReadinessConstellation className="mt-6" />
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/4 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/62">Secret civic code</span>
                  <span className="font-semibold tracking-[0.45em] text-white">25486</span>
                </div>
              </div>
            </GlassPanel>

            <GlassPanel className="min-h-64">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Action wallet</h3>
                <button className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/68">Live</button>
              </div>
              <p className="mt-5 text-4xl font-semibold tracking-tight">94%</p>
              <p className="mt-1 text-sm text-white/55">Vote confidence</p>
              <div className="mt-6 grid gap-2">
                {programs.map((program) => (
                  <div key={program.label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/4 p-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/8 text-cyan-100">
                      <program.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{program.label}</p>
                      <p className="text-xs text-white/45">{program.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_0.75fr_0.9fr]">
            <GlassPanel>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent civic moves</h3>
                <span className="text-xs text-white/45">Real-time</span>
              </div>
              <div className="mt-4 space-y-3">
                {activity.map((item) => (
                  <div key={item.title} className="flex items-center gap-3">
                    <span className={cn("h-2.5 w-2.5 rounded-full", item.tone)} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                    </div>
                    <span className="text-xs text-white/42">{item.time}</span>
                  </div>
                ))}
              </div>
            </GlassPanel>

            <GlassPanel>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Streak</h3>
                <Flame className="h-5 w-5 text-orange-300" />
              </div>
              <p className="mt-5 text-4xl font-semibold">7 days</p>
              <p className="mt-2 text-sm text-white/52">Keep completing one civic action daily to unlock Champion status.</p>
            </GlassPanel>

            <GlassPanel>
              <h3 className="text-lg font-semibold">Trust center</h3>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {["Verified", "Neutral", "Accessible", "Offline"].map((label) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/4 p-3">
                    <CheckCircle2 className="mb-2 h-4 w-4 text-emerald-300" />
                    <p className="text-sm font-semibold">{label}</p>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>
    </section>
  );
}

function GlassPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-[1.45rem] border border-white/10 bg-white/4.5 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl", className)}>
      {children}
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  delta,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  delta: string;
  tone: string;
}) {
  const toneClass =
    tone === "cyan"
      ? "bg-cyan-400/15 text-cyan-200"
      : tone === "coral"
      ? "bg-rose-400/15 text-rose-200"
      : "bg-violet-400/15 text-violet-200";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/4 p-3">
      <div className={cn("mb-3 flex h-8 w-8 items-center justify-center rounded-xl", toneClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xs text-white/42">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
      <p className="mt-1 text-[11px] text-emerald-300">{delta}</p>
    </div>
  );
}

function NeonLineChart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 520 190" className={cn("h-44 w-full", className)} aria-hidden="true">
      <defs>
        <linearGradient id="lineA" x1="0" x2="520" y1="0" y2="0">
          <stop stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#F472B6" />
        </linearGradient>
        <linearGradient id="lineB" x1="0" x2="520" y1="0" y2="0">
          <stop stopColor="#22D3EE" />
          <stop offset="1" stopColor="#34D399" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={`h-${i}`} x1="0" x2="520" y1={30 + i * 32} y2={30 + i * 32} stroke="rgba(255,255,255,.08)" />
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={`v-${i}`} y1="12" y2="170" x1={40 + i * 80} x2={40 + i * 80} stroke="rgba(255,255,255,.08)" />
      ))}
      <path d="M12 126 C72 84 111 77 150 108 C188 137 213 54 263 68 C318 84 312 144 366 112 C415 83 442 128 508 78" fill="none" stroke="url(#lineA)" strokeWidth="7" strokeLinecap="round" />
      <path d="M12 154 C62 124 94 111 130 132 C176 160 208 102 262 104 C319 106 318 158 370 139 C424 120 456 151 510 112" fill="none" stroke="url(#lineB)" strokeWidth="6" strokeLinecap="round" />
      <circle cx="263" cy="68" r="9" fill="#0b1028" stroke="#f7d76b" strokeWidth="5" />
    </svg>
  );
}

function ReadinessConstellation({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto flex h-44 max-w-80 items-center justify-center", className)}>
      <div className="absolute h-40 w-40 rounded-full border border-white/8 bg-white/3" />
      <div className="absolute h-28 w-28 rounded-full border border-white/8 bg-white/[0.035]" />
      <div className="absolute h-20 w-20 rounded-full bg-[radial-gradient(circle_at_32%_22%,#fff,transparent_24%),linear-gradient(135deg,#fb7185,#f59e0b)] shadow-[0_18px_54px_-20px_rgba(251,113,133,.9)]" />
      <div className="absolute ml-24 mt-8 h-16 w-16 rounded-full bg-[radial-gradient(circle_at_34%_24%,#fff,transparent_26%),linear-gradient(135deg,#22d3ee,#8b5cf6)] shadow-[0_18px_54px_-20px_rgba(34,211,238,.9)]" />
      <div className="absolute -mt-19 ml-16 h-12 w-12 rounded-full bg-[radial-gradient(circle_at_32%_24%,#fff,transparent_26%),linear-gradient(135deg,#f472b6,#a855f7)] shadow-[0_18px_48px_-20px_rgba(168,85,247,.9)]" />
      <div className="absolute -mr-29 -mt-5 h-7 w-7 rounded-full bg-cyan-300 shadow-[0_0_30px_rgba(34,211,238,.75)]" />
      <div className="absolute left-10 top-12 h-1.5 w-1.5 rounded-full bg-white/80" />
      <div className="absolute bottom-14 left-14 h-1.5 w-1.5 rounded-full bg-white/70" />
      <div className="absolute right-12 top-16 h-1.5 w-1.5 rounded-full bg-white/70" />
    </div>
  );
}
