import { AlertTriangle } from "lucide-react";
import { LEGAL_DISCLAIMER_TEXT } from "@/lib/safeguarding";

export function LegalDisclaimer({
  checked,
  onChange,
  error,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: string;
}) {
  return (
    <div className="rounded-2xl border border-brand-dark/10 bg-white p-4 sm:p-5">
      <div className="flex gap-3">
        <AlertTriangle className="size-5 text-brand-primary shrink-0 mt-0.5" />
        <p className="text-sm text-brand-dark/80 leading-relaxed">{LEGAL_DISCLAIMER_TEXT}</p>
      </div>
      <label className="mt-4 flex items-start gap-3 text-sm text-brand-dark/85">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          required
          className="mt-1 size-4 accent-brand-primary shrink-0"
        />
        <span>I have read and understood this disclaimer and accept its terms.</span>
      </label>
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
    </div>
  );
}
