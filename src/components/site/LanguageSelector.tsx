import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import {
  SUPPORTED_LANGUAGES,
  setStoredLanguage,
  type LanguageCode,
} from "@/i18n";

export function LanguageSelector({ className = "" }: { className?: string }) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const current =
    SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) ??
    SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const onDocClick = () => setOpen(false);
    if (open) document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  const change = (code: LanguageCode) => {
    i18n.changeLanguage(code);
    setStoredLanguage(code);
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("nav.language")}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-brand-dark/10 text-sm text-brand-dark hover:bg-brand-soft transition"
      >
        <Globe className="size-4" />
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden sm:inline">{current.code.toUpperCase()}</span>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 mt-2 min-w-[10rem] rounded-xl border border-brand-dark/10 bg-white shadow-lg z-50 overflow-hidden"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <li key={lang.code}>
              <button
                type="button"
                onClick={() => change(lang.code)}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-brand-soft ${
                  lang.code === current.code
                    ? "text-brand-primary font-semibold"
                    : "text-brand-dark"
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
