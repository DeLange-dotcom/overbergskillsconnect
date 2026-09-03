import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

export function DisclaimerBanner({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-amber-300/60 bg-amber-50 p-4 text-amber-900 flex gap-3">
      <AlertTriangle className="size-5 shrink-0 mt-0.5" />
      <p className={compact ? "text-xs leading-relaxed" : "text-sm leading-relaxed"}>
        {t("legal.disclaimerText")}
      </p>
    </div>
  );
}
