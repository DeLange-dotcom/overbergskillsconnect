import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

export function LegalDisclaimer({
  checked,
  onChange,
  error,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-brand-dark/10 bg-white p-4 sm:p-5">
      <div className="flex gap-3">
        <AlertTriangle className="size-5 text-brand-primary shrink-0 mt-0.5" />
        <p className="text-sm text-brand-dark/80 leading-relaxed">{t("legal.legalDisclaimerText")}</p>
      </div>
      <label className="mt-4 flex items-start gap-3 text-sm text-brand-dark/85">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          required
          className="mt-1 size-4 accent-brand-primary shrink-0"
        />
        <span>{t("legal.legalDisclaimerAckLabel")}</span>
      </label>
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
    </div>
  );
}
