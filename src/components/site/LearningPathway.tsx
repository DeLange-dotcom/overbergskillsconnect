import { LEARNING_PATHWAY } from "@/lib/apprenticeships";
import { ChevronRight } from "lucide-react";

export function LearningPathway({ current = -1 }: { current?: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
      {LEARNING_PATHWAY.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-full border ${
              i === current
                ? "bg-brand-primary text-white border-brand-primary"
                : i < current
                ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                : "bg-white text-brand-dark/70 border-brand-dark/10"
            }`}
          >
            {i + 1}. {step}
          </span>
          {i < LEARNING_PATHWAY.length - 1 && (
            <ChevronRight className="size-4 text-brand-dark/30" />
          )}
        </div>
      ))}
    </div>
  );
}
