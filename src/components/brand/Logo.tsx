import { cn } from "@/lib/utils";

/**
 * Overberg Skills Connect identity.
 *
 * ConnectMark — circular three-person connection symbol (navy / green / orange).
 * Logo        — mark + wordmark, in "full" or "compact" size, on light or dark
 *               backgrounds. Icon-only use = <ConnectMark /> on its own.
 */

export function ConnectMark({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  const ring = onDark ? "#FFFFFF" : "#0F1F2E";
  const third = onDark ? "#FFFFFF" : "#0F1F2E";
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="Overberg Skills Connect"
    >
      {/* connection ring */}
      <circle
        cx="32"
        cy="32"
        r="27"
        fill="none"
        stroke={ring}
        strokeWidth="3"
        strokeOpacity={onDark ? 0.5 : 0.18}
      />
      {/* links between the three people */}
      <g stroke={ring} strokeOpacity={onDark ? 0.55 : 0.3} strokeWidth="2.5" strokeLinecap="round">
        <line x1="32" y1="22" x2="20" y2="43" />
        <line x1="32" y1="22" x2="44" y2="43" />
        <line x1="20" y1="43" x2="44" y2="43" />
      </g>
      {/* three people */}
      <circle cx="32" cy="20" r="7" fill="#4CAF2A" />
      <circle cx="19" cy="43" r="7" fill="#F28C28" />
      <circle cx="45" cy="43" r="7" fill={third} />
    </svg>
  );
}

export function Wordmark({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  const navy = onDark ? "text-white" : "text-brand-navy";
  return (
    <span
      className={cn(
        "font-heading font-bold uppercase leading-none tracking-tight",
        navy,
        className,
      )}
    >
      Overberg <span className="text-brand-green">Skills</span> Connect
    </span>
  );
}

export function Logo({
  variant = "full",
  onDark = false,
  showRelationship = true,
  className,
}: {
  variant?: "full" | "compact";
  onDark?: boolean;
  showRelationship?: boolean;
  className?: string;
}) {
  const compact = variant === "compact";
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <ConnectMark onDark={onDark} className={compact ? "size-9" : "size-12"} />
      <span className="flex flex-col gap-1">
        <Wordmark onDark={onDark} className={compact ? "text-[15px]" : "text-xl sm:text-2xl"} />
        {showRelationship && (
          <span
            className={cn(
              "text-[9px] font-medium uppercase tracking-[0.14em]",
              onDark ? "text-white/70" : "text-brand-navy/55",
            )}
          >
            A Hineni Call Initiative · Powered by Khulisa Group
          </span>
        )}
      </span>
    </span>
  );
}
