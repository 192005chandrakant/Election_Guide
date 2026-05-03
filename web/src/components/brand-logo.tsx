import { cn } from "@/lib/utils";

type BrandLogoProps = {
  showWordmark?: boolean;
  className?: string;
  markClassName?: string;
  textClassName?: string;
  subtitle?: boolean;
};

export default function BrandLogo({
  showWordmark = true,
  className,
  markClassName,
  textClassName,
  subtitle = false,
}: BrandLogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-2.5 sm:gap-3", className)}>
      {/* Modern Mark with Enhanced Visual Hierarchy */}
      <div
        className={cn(
          "relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl bg-[linear-gradient(135deg,#0ea5e9_0%,#7c3aed_50%,#ec4899_100%)] shadow-[0_20px_50px_-20px_rgba(14,165,233,0.28)] ring-1 ring-white/14 backdrop-blur-md hover:shadow-[0_30px_60px_-20px_rgba(124,58,237,0.3)] transition-all duration-300 group",
          markClassName
        )}
      >
        {/* Animated background layer */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.6),transparent_40%),linear-gradient(135deg,transparent,rgba(15,23,42,0.2))]" />
        
        {/* Animated glow effect on hover */}
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />

        {/* Modern SVG Mark */}
        <svg viewBox="0 0 64 64" className="relative h-8 w-8 sm:h-9 sm:w-9" aria-hidden="true">
          {/* Shield background with modern look */}
          <defs>
              <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff22" />
                <stop offset="100%" stopColor="#ffffff08" />
              </linearGradient>
          </defs>
          
          {/* Main shield path */}
          <path
            d="M32 6 L50 13 L50 28 C50 40 44 49 32 52 C20 49 14 40 14 28 L14 13 Z"
            fill="url(#shieldGrad)"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          
          {/* Checkmark for verified/ready */}
          <path
            d="M24 33 L29 38 L41 26"
            fill="none"
            stroke="white"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Accent dot - represents vote */}
          <circle
            cx="48"
            cy="18"
            r="3.5"
            fill="#facc15"
            opacity="0.95"
          />
        </svg>
      </div>

      {showWordmark && (
        <div className={cn("min-w-0 leading-none", textClassName)}>
          <div className="font-heading text-sm sm:text-base font-extrabold tracking-[-0.04em] flex flex-col">
            <span className="text-foreground">Civic</span>
            <span className="bg-[linear-gradient(135deg,#0ea5e9,#7c3aed_45%,#ec4899)] bg-clip-text text-transparent text-sm sm:text-base font-extrabold">
              Guide
            </span>
          </div>
          {subtitle && (
            <p className="mt-0.5 sm:mt-1 text-[0.55rem] sm:text-[0.62rem] font-bold uppercase tracking-[0.15em] sm:tracking-[0.22em] text-muted-foreground">
              Smart Voting Companion
            </p>
          )}
        </div>
      )}
    </div>
  );
}
