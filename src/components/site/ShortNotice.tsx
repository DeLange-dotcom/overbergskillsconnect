import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

/** One-line safety notice with a link to the full disclaimer. */
export function ShortNotice({ className = "" }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <p className={`flex items-start gap-2 text-xs text-brand-dark/70 leading-relaxed ${className}`}>
      <ShieldAlert className="size-4 text-amber-600 shrink-0 mt-px" aria-hidden />
      <span>
        {t("findHelp.shortNotice.text")}{" "}
        <Link to="/disclaimer" className="underline hover:text-brand-primary">
          {t("findHelp.shortNotice.readMore")}
        </Link>
        .
      </span>
    </p>
  );
}
