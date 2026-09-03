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
