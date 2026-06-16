// Youth Opportunities Hub — shared constants

export const YOUTH_INTERESTS = [
  { value: "gardening", label: "Gardening" },
  { value: "conservation", label: "Conservation" },
  { value: "tourism", label: "Tourism" },
  { value: "hospitality", label: "Hospitality" },
  { value: "administration", label: "Administration" },
  { value: "childcare", label: "Childcare" },
  { value: "elderly_support", label: "Elderly support" },
  { value: "retail", label: "Retail" },
  { value: "events", label: "Events" },
  { value: "technology", label: "Technology" },
  { value: "social_media", label: "Social media" },
  { value: "construction", label: "Construction" },
  { value: "farming", label: "Farming" },
  { value: "arts_culture", label: "Arts and culture" },
  { value: "environment", label: "Environmental projects" },
  { value: "other", label: "Other" },
] as const;

export const YOUTH_OPPORTUNITY_TYPES = [
  { value: "school_holiday", label: "School holiday work" },
  { value: "weekend", label: "Weekend work" },
  { value: "casual", label: "Casual work" },
  { value: "volunteer", label: "Volunteer" },
  { value: "job_shadow", label: "Job shadowing" },
  { value: "apprenticeship", label: "Apprenticeship" },
  { value: "learnership", label: "Learnership" },
  { value: "mentorship", label: "Mentorship" },
  { value: "training", label: "Skills training" },
] as const;

export const YOUTH_AVAILABILITY = [
  { value: "holidays", label: "School holidays only" },
  { value: "weekends", label: "Weekends" },
  { value: "after_school", label: "Afternoons after school" },
  { value: "flexible", label: "Flexible" },
] as const;

export const YOUTH_SKILLS = [
  { value: "computer", label: "Computer skills" },
  { value: "social_media", label: "Social media" },
  { value: "gardening", label: "Gardening" },
  { value: "languages", label: "Languages" },
  { value: "sports_coaching", label: "Sports coaching" },
  { value: "photography", label: "Photography" },
  { value: "administration", label: "Administration" },
  { value: "other", label: "Other" },
] as const;

export const YOUTH_EDUCATION_LEVELS = [
  "Primary school",
  "Grade 8–9",
  "Grade 10–11",
  "Matric (Grade 12)",
  "TVET / college",
  "University",
  "Not currently studying",
];

export const YOUTH_OPPORTUNITY_CATEGORIES = [
  { value: "paid", label: "Paid" },
  { value: "volunteer", label: "Volunteer" },
  { value: "training", label: "Training" },
  { value: "internship", label: "Internship" },
  { value: "community_service", label: "Community service" },
] as const;

export const YOUTH_BADGES = [
  { key: "community_volunteer", label: "Community Volunteer", desc: "Volunteered hours in the community." },
  { key: "first_job_completed", label: "First Job Completed", desc: "Completed a first paid opportunity." },
  { key: "reliable_worker", label: "Reliable Worker", desc: "Consistently dependable on placements." },
  { key: "environmental_champion", label: "Environmental Champion", desc: "Active in conservation or environmental projects." },
  { key: "hospitality_helper", label: "Hospitality Helper", desc: "Helped at events or in hospitality." },
  { key: "digital_skills_learner", label: "Digital Skills Learner", desc: "Completed digital skills training." },
  { key: "community_leader", label: "Community Leader", desc: "Took on a leadership role." },
] as const;

export type YouthBadgeKey = (typeof YOUTH_BADGES)[number]["key"];

export const PATHWAY_STAGES = [
  "Register",
  "Volunteer",
  "Training",
  "Work Experience",
  "Employment",
  "Mentorship",
  "Community Leadership",
] as const;

export function youthAgeGroupFromDob(dob: string | null | undefined): "15-17" | "18-25" | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  if (age >= 15 && age <= 17) return "15-17";
  if (age >= 18 && age <= 25) return "18-25";
  return null;
}

export function labelFromList(
  list: readonly { value: string; label: string }[],
  v: string,
): string {
  return list.find((x) => x.value === v)?.label ?? v;
}
