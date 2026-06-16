import { PATHWAY_STAGES } from "@/lib/youth";
import { Check } from "lucide-react";

export function PathwayTracker({ currentStage = 0 }: { currentStage?: number }) {
  return (
    <ol className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
      {PATHWAY_STAGES.map((s, i) => {
        const done = i < currentStage;
        const active = i === currentStage;
        return (
          <li
            key={s}
            className={`rounded-xl border p-3 text-center text-xs ${
              done
                ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary"
                : active
                  ? "bg-brand-accent/10 border-brand-accent/40 text-brand-accent font-semibold"
                  : "bg-white border-brand-dark/10 text-brand-dark/60"
            }`}
          >
            <div className="flex items-center justify-center mb-1">
              {done ? <Check className="size-4" /> : <span className="font-bold">{i + 1}</span>}
            </div>
            {s}
          </li>
        );
      })}
    </ol>
  );
}
