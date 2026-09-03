import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Standard Overberg Skills Connect internal page heading:
 * small green eyebrow (optional) + strong navy heading + short supporting line.
 */
export function PageHeader({
  eyebrow,
  title,
  intro,
  align = "left",
  className,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("mb-6 sm:mb-8", align === "center" && "text-center", className)}>
      {eyebrow && <span className="osc-eyebrow">{eyebrow}</span>}
      <h1
        className={cn(
          "osc-heading text-3xl sm:text-4xl leading-tight",
          eyebrow ? "mt-2" : undefined,
        )}
      >
        {title}
      </h1>
      {intro && (
        <p
          className={cn(
            "mt-3 text-brand-navy/70 leading-relaxed",
            align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl",
          )}
        >
          {intro}
        </p>
      )}
      {children}
    </div>
  );
}
