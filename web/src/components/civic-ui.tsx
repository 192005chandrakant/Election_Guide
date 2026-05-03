import type { LucideIcon } from "lucide-react";
import { ArrowLeft, BadgeCheck, ExternalLink, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function CivicShell({
  children,
  className,
  max = "max-w-6xl",
}: {
  children: React.ReactNode;
  className?: string;
  max?: string;
}) {
  return (
    <main className={cn("relative min-h-screen overflow-hidden bg-background px-4 pb-28 pt-24 md:px-8 md:pb-10 md:pt-28", className)}>
      <div className="pointer-events-none absolute inset-0 civic-field" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--primary)_12%,transparent),transparent)]" />
      <div className={cn("relative z-10 mx-auto w-full space-y-8", max)}>{children}</div>
    </main>
  );
}

export function PageHeader({
  title,
  description,
  backHref = "/dashboard",
  icon: Icon,
  action,
  kicker,
}: {
  title: string;
  description: string;
  backHref?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  kicker?: string;
}) {
  return (
    <header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <Link href={backHref}>
          <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl border border-foreground/10 bg-card/70 shadow-sm backdrop-blur-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        {Icon && (
          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary sm:flex">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0">
          {kicker && <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{kicker}</p>}
          <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">{description}</p>
        </div>
      </div>
      {action && <div className="w-full md:w-auto md:shrink-0">{action}</div>}
    </header>
  );
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  tone = "primary",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: "primary" | "green" | "amber" | "blue" | "rose";
}) {
  const tones = {
    primary: "bg-primary/12 text-primary",
    green: "bg-emerald-500/12 text-emerald-500",
    amber: "bg-amber-500/14 text-amber-500",
    blue: "bg-sky-500/12 text-sky-500",
    rose: "bg-rose-500/12 text-rose-500",
  };

  return (
    <Card className="border-foreground/10 bg-card/78 backdrop-blur-xl">
      <CardContent className="flex items-center gap-3 p-4">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl", tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-0.5 truncate text-lg font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function MissionCard({
  icon: Icon,
  title,
  description,
  href,
  status,
  tone = "primary",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  status?: string;
  tone?: "primary" | "green" | "amber" | "blue" | "rose";
}) {
  const tones = {
    primary: "from-primary/18 to-primary/4 text-primary",
    green: "from-emerald-500/18 to-emerald-500/4 text-emerald-500",
    amber: "from-amber-500/18 to-amber-500/4 text-amber-500",
    blue: "from-sky-500/18 to-sky-500/4 text-sky-500",
    rose: "from-rose-500/18 to-rose-500/4 text-rose-500",
  };

  return (
    <Link href={href} className="block h-full">
      <Card className="h-full border-foreground/10 bg-card/76 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_24px_80px_-20px_rgba(30,64,175,0.35)]">
        <CardContent className="flex h-full flex-col gap-5 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br", tones[tone])}>
              <Icon className="h-6 w-6" />
            </div>
            {status && (
              <span className="rounded-full border border-foreground/10 bg-background/70 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                {status}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold tracking-tight">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
          </div>
          <div className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            Open <ExternalLink className="h-3.5 w-3.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function TrustStrip({
  source = "Official election sources",
  updated = "Reviewed for your profile",
}: {
  source?: string;
  updated?: string;
}) {
  return (
    <Card className="border-primary/25 bg-linear-to-r from-primary/12 to-teal-600/8 backdrop-blur-xl">
      <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-primary/30 to-teal-600/20 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Verified guidance</p>
            <p className="text-xs text-muted-foreground">{source}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:justify-end">
          <BadgeCheck className="h-4 w-4 text-primary" />
          <p className="text-xs font-medium text-muted-foreground">{updated}</p>
        </div>
      </CardContent>
    </Card>
  );
}
