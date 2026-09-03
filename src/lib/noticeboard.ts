export const SKILL_CATEGORIES = [
  "Domestic Worker",
  "Cleaning & housekeeping",
  "Childcare",
  "Eldercare",
  "Cooking",
  "Gardening",
  "Painting",
  "Plumbing",
  "Electrical",
  "Building & handyman",
  "Carpentry",
  "Farm work",
  "Driving",
  "Tutoring",
  "Hairdressing",
  "Sewing",
  "Admin & office",
  "IT & computers",
  "Security",
  "Other",
] as const;

export const EXPERIENCE_LEVELS = [
  { value: "lt1", label: "Less than 1 year" },
  { value: "1_2", label: "1–2 years" },
  { value: "3_5", label: "3–5 years" },
  { value: "6_10", label: "6–10 years" },
  { value: "10plus", label: "10+ years" },
] as const;

export type ExperienceValue = (typeof EXPERIENCE_LEVELS)[number]["value"];

export type SkillExperience = {
  skill: string;
  experience_level: string | null;
  is_custom?: boolean;
};

export function experienceLabel(value?: string | null): string | null {
  if (!value) return null;
  return EXPERIENCE_LEVELS.find((e) => e.value === value)?.label ?? null;
}

export const AVAILABILITY_OPTIONS = [
  "Full-time",
  "Part-time",
  "Weekends",
  "Once-off / project",
  "Flexible",
] as const;


export const REPORT_REASONS = [
  { value: "spam", label: "Spam" },
  { value: "fraud", label: "Fraud" },
  { value: "offensive", label: "Offensive Content" },
  { value: "false_information", label: "False Information" },
  { value: "inappropriate", label: "Inappropriate Behaviour" },
] as const;

export const DISCLAIMER_TEXT =
  "Overberg Skills Connect is a digital community noticeboard. Khulisa does not employ, recruit, recommend, vet, supervise or guarantee any person using this platform. Users are solely responsible for carrying out their own enquiries, obtaining references, requesting police clearance where appropriate, verifying qualifications and entering into any agreements. Khulisa accepts no responsibility for any loss, injury, damage, dispute or claim arising from introductions made through this platform.";

/**
 * One shared, standardised list of Overberg towns/areas.
 * Used by the advertise form, My Listing, My Details and Find Local Help so
 * that the same spelling is stored and searched everywhere.
 */
export const OVERBERG_LOCATIONS = [
  "Napier",
  "Bredasdorp",
  "Arniston / Waenhuiskrans",
  "Struisbaai",
  "L'Agulhas",
  "Elim",
  "Stanford",
  "Gansbaai",
  "Hermanus",
  "Caledon",
  "Greyton",
  "Genadendal",
  "Riviersonderend",
  "Botrivier",
  "Kleinmond",
  "Grabouw",
  "Villiersdorp",
] as const;

export const OTHER_LOCATION_LABEL = "Other Overberg area";

/** True when the stored town is not one of the standard options. */
export function isCustomTown(town: string | null | undefined): boolean {
  if (!town) return false;
  return !OVERBERG_LOCATIONS.some((t) => t.toLowerCase() === town.toLowerCase());
}

/** Short notice used next to forms and search results. */
export const SHORT_DISCLAIMER =
  "This is a community noticeboard. We do not vet or recommend anyone. Please make your own checks.";

/**
 * Support contact details. Set these once the operational support contact is
 * confirmed — every user-facing "contact support" link reads from here.
 */
export const SUPPORT_EMAIL: string | null = null;
export const SUPPORT_PHONE: string | null = null;
