import { Info } from "lucide-react";
import { HINENI_DISCLAIMER } from "@/lib/directory-constants";

export function HineniDisclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-xs text-brand-dark/60 leading-relaxed">
        <Info className="inline size-3.5 mr-1 -mt-0.5 text-brand-primary" />
        {HINENI_DISCLAIMER}
      </p>
    );
  }
  return (
    <div className="rounded-2xl border border-brand-dark/10 bg-brand-soft/60 p-4 sm:p-5 text-sm text-brand-dark/75 leading-relaxed flex gap-3">
      <Info className="size-5 text-brand-primary shrink-0 mt-0.5" />
      <p>{HINENI_DISCLAIMER}</p>
    </div>
  );
}
