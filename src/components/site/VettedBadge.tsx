import { ShieldCheck } from "lucide-react";

export function VettedBadge({ label = "Vetted by Hineni", className = "" }: { label?: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary ${className}`}
      title="Reviewed and approved by Hineni Learning City before publication."
    >
      <ShieldCheck className="size-3" /> {label}
    </span>
  );
}
