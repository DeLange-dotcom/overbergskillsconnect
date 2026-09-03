import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import af from "./locales/af.json";

/**
 * Page/feature translation modules.
 *
 * Each file `src/i18n/locales/<lang>/<namespace>.json` is merged into the
 * single "translation" resource under its filename, so a file called
 * `findHelp.json` is used as `t("findHelp.title")`.
 *
 * This keeps every user-facing string centralised while letting each page own
 * its own file (no giant shared JSON that everything has to edit).
 */
type Dict = Record<string, unknown>;

function collect(modules: Record<string, unknown>, langDir: string): Dict {
  const out: Dict = {};
  for (const [path, mod] of Object.entries(modules)) {
    const match = path.match(new RegExp(`/locales/${langDir}/([^/]+)\\.json$`));
    if (!match) continue;
    out[match[1]] = mod as Dict;
  }
  return out;
}

const enModules = import.meta.glob("./locales/en/*.json", {
  eager: true,
  import: "default",
});
const afModules = import.meta.glob("./locales/af/*.json", {
  eager: true,
  import: "default",
});

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "af", label: "Afrikaans", flag: "🇿🇦" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export const STORAGE_KEY = "osc.lang";

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: { ...en, ...collect(enModules, "en") } },
      af: { translation: { ...af, ...collect(afModules, "af") } },
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
  document.documentElement.lang = code;
}

export default i18n;
