import { useTranslation } from "react-i18next";
import { SKILL_CATEGORIES, AVAILABILITY_OPTIONS } from "@/lib/noticeboard";

/**
 * Display-only translation helpers.
 *
 * IMPORTANT: these translate LABELS ONLY. The stored value (English skill
 * name, experience code, town name, user-typed custom skill) is never changed.
 * Anything that is not a system-defined option is returned exactly as stored,
 * so user-generated content is never translated.
 */
export function useLabels() {
  const { t } = useTranslation();

  const skillLabel = (value: string | null | undefined) => {
    if (!value) return "";
    const known = (SKILL_CATEGORIES as readonly string[]).includes(value);
    return known ? t(`labels.skills.${value}`, { defaultValue: value }) : value;
  };

  const experienceLabel = (code: string | null | undefined) =>
    code ? t(`labels.experience.${code}`, { defaultValue: code }) : null;

  const availabilityLabel = (value: string | null | undefined) => {
    if (!value) return "";
    const known = (AVAILABILITY_OPTIONS as readonly string[]).includes(value);
    return known ? t(`labels.availability.${value}`, { defaultValue: value }) : value;
  };

  const listingStatusLabel = (value: string | null | undefined) =>
    value ? t(`labels.listingStatus.${value}`, { defaultValue: value }) : "";

  const requestStatusLabel = (value: string | null | undefined) =>
    value ? t(`labels.requestStatus.${value}`, { defaultValue: value }) : "";

  return { skillLabel, experienceLabel, availabilityLabel, listingStatusLabel, requestStatusLabel };
}
