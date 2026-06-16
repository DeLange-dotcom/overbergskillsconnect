import { ShieldCheck, Shield, ShieldAlert } from "lucide-react";

export type VerificationLevel = "unverified" | "bronze" | "silver" | "gold";

const STYLES: Record<VerificationLevel, { bg: string; text: string; ring: string; label: string; icon: typeof Shield }> = {
  unverified: {
    bg: "bg-brand-dark/5",
    text: "text-brand-dark/60",
    ring: "ring-brand-dark/10",
    label: "Unverified",
    icon: ShieldAlert,
  },
  bronze: {
    bg: "bg-amber-50",
    text: "text-amber-900",
    ring: "ring-amber-200",
    label: "Bronze Verified",
    icon: Shield,
  },
  silver: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    ring: "ring-slate-300",
    label: "Silver Verified",
    icon: Shield,
  },
  gold: {
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    ring: "ring-yellow-300",
    label: "Gold Verified",
    icon: ShieldCheck,
  },
};

export const VERIFICATION_CRITERIA: Record<Exclude<VerificationLevel, "unverified">, string[]> = {
  bronze: ["Identity verified", "References checked"],
  silver: ["Identity verified", "References checked", "Interview completed"],
  gold: ["Identity verified", "References checked", "Interview completed", "Police Clearance Certificate verified"],
};

export function VerificationBadge({
  level,
  size = "md",
  showTooltip = false,
}: {
  level: VerificationLevel;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}) {
  const s = STYLES[level];
  const Icon = s.icon;
  const padding =
    size === "lg" ? "px-3.5 py-1.5 text-sm" : size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs";
  const iconSize = size === "lg" ? "size-4" : "size-3.5";

  return (
    <span
      title={
        showTooltip && level !== "unverified"
          ? VERIFICATION_CRITERIA[level].join(" · ")
          : undefined
      }
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ${s.bg} ${s.text} ${s.ring} ${padding}`}
    >
      <Icon className={iconSize} />
      {s.label}
    </span>
  );
}
