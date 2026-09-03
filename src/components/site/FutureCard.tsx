import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Reusable card style for forward-looking / "What's coming next" content.
 * Presentation only — it links nowhere and exposes no unfinished functionality.
 */
export function FutureCard({
  icon: Icon,
  title,
  description,
  accent = "green",
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  accent?: "green" | "orange" | "navy";
  className?: string;
}) {
  const accents = {
    green: "bg-brand-green/10 text-brand-green",
    orange: "bg-brand-orange/12 text-brand-orange",
    navy: "bg-brand-navy/8 text-brand-navy",
  } as const;

  return (
    <div
      className={cn(
        "rounded-2xl border border-brand-navy/10 bg-white p-5 shadow-sm transition hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", accents[accent])}>
            <Icon className="size-5" />
          </span>
        )}
        <div>
          <div className="font-heading text-base font-semibold text-brand-navy">{title}</div>
          {description && (
            <p className="mt-1 text-sm leading-relaxed text-brand-navy/65">{description}</p>
          )}
        </div>
      </div>
      <span className="mt-4 inline-block rounded-full bg-brand-neutral px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-navy/60">
        Coming soon
      </span>
    </div>
  );
}
