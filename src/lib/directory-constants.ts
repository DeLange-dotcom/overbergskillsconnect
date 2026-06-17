export const DIRECTORY_CATEGORIES = [
  { value: "domestic_worker", label: "Domestic Worker" },
  { value: "gardener", label: "Gardener" },
  { value: "carer", label: "Carer" },
  { value: "childcare", label: "Childcare" },
  { value: "handyman", label: "Handyman" },
  { value: "driver", label: "Driver" },
  { value: "hospitality", label: "Hospitality" },
  { value: "apprentice", label: "Apprentice" },
  { value: "holiday_worker", label: "Holiday Worker" },
  { value: "tutor", label: "Tutor" },
  { value: "administrative_assistant", label: "Administrative Assistant" },
  { value: "general_worker", label: "General Worker" },
] as const;

export type DirectoryCategoryValue = (typeof DIRECTORY_CATEGORIES)[number]["value"];

export const directoryCategoryLabel = (v: string | null | undefined) =>
  DIRECTORY_CATEGORIES.find((c) => c.value === v)?.label ?? v ?? "—";

export const COMMON_LANGUAGES = [
  "Afrikaans",
  "English",
  "isiXhosa",
  "isiZulu",
  "Sesotho",
  "Setswana",
  "Sepedi",
  "Xitsonga",
  "Tshivenda",
  "siSwati",
  "isiNdebele",
  "Portuguese",
  "French",
  "German",
] as const;

export const VERIFICATION_LEVELS = [
  { value: "bronze", label: "Bronze" },
  { value: "silver", label: "Silver" },
  { value: "gold", label: "Gold" },
] as const;

export const COMPLAINT_TYPES = [
  { value: "safety", label: "Safety concern" },
  { value: "misrepresentation", label: "Misrepresentation" },
  { value: "harassment", label: "Harassment / abusive behaviour" },
  { value: "fraud", label: "Suspected fraud or theft" },
  { value: "no_show", label: "No-show / unreliability" },
  { value: "other", label: "Other" },
] as const;

export const HINENI_DISCLAIMER =
  "Hineni facilitates introductions between community members. While Hineni may verify certain information supplied by applicants, Hineni does not guarantee suitability, performance, conduct, qualifications, availability, or outcomes. Users remain responsible for conducting their own due diligence and making their own employment, engagement, and contracting decisions.";
