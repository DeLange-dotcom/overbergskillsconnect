import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import af from "./locales/af.json";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "af", label: "Afrikaans", flag: "🇿🇦" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export const STORAGE_KEY = "osc.lang";

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      af: { translation: af },
    },
    lng: "en", // SSR-safe default; client switches in useEffect
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

export function getStoredLanguage(): LanguageCode | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === "en" || v === "af") return v;
  return null;
}

export function setStoredLanguage(code: LanguageCode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, code);
}

export default i18n;
