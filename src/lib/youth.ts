// Youth Opportunities Hub — shared constants

export const YOUTH_INTERESTS = [
  { value: "gardening", label: "Gardening" },
  { value: "agriculture", label: "Agriculture / Farming" },
  { value: "animal_care", label: "Animal care" },
  { value: "child_care", label: "Child care" },
  { value: "elderly_care", label: "Elderly care" },
  { value: "hospitality", label: "Hospitality" },
  { value: "retail", label: "Retail" },
  { value: "administration", label: "Administration" },
  { value: "technology", label: "Computers & Technology" },
  { value: "social_media", label: "Social media" },
  { value: "construction", label: "Construction" },
  { value: "painting", label: "Painting & decorating" },
  { value: "cleaning", label: "Cleaning" },
  { value: "mechanical", label: "Mechanical" },
  { value: "electrical", label: "Electrical" },
  { value: "creative_arts", label: "Creative arts" },
  { value: "events_tourism", label: "Events & Tourism" },
  { value: "other", label: "Other" },
] as const;

export const YOUTH_OPPORTUNITY_TYPES = [
  { value: "volunteer", label: "Volunteer" },
  { value: "casual", label: "Casual work" },
  { value: "micro_job", label: "Micro job" },
  { value: "holiday", label: "Holiday work" },
  { value: "part_time", label: "Part-time employment" },
  { value: "full_time", label: "Full-time employment" },
  { value: "internship", label: "Internship" },
  { value: "training", label: "Training programme" },
  { value: "mentorship", label: "Mentorship" },
] as const;

export const YOUTH_AVAILABILITY = [
  { value: "holidays", label: "School holidays only" },
  { value: "weekends", label: "Weekends" },
  { value: "after_school", label: "After school" },
  { value: "part_time", label: "Part-time" },
  { value: "full_time", label: "Full-time" },
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

export const YOUTH_LOCATIONS = [
  { value: "Napier", label: "Napier" },
  { value: "Bredasdorp", label: "Bredasdorp" },
  { value: "Caledon", label: "Caledon" },
  { value: "Hermanus", label: "Hermanus" },
  { value: "Other", label: "Other" },
] as const;

export const YOUTH_PROVIDER_CATEGORIES = [
  { value: "agriculture", label: "Agriculture" },
  { value: "hospitality", label: "Hospitality" },
  { value: "retail", label: "Retail" },
  { value: "administration", label: "Administration" },
  { value: "trades", label: "Trades" },
  { value: "technology", label: "Technology" },
  { value: "care_services", label: "Care services" },
  { value: "tourism", label: "Tourism" },
  { value: "creative", label: "Creative industries" },
  { value: "community", label: "Community projects" },
] as const;

export const YOUTH_COMPENSATION_TYPES = [
  { value: "volunteer", label: "Volunteer (unpaid)" },
  { value: "hourly", label: "Hourly rate" },
  { value: "daily", label: "Daily rate" },
  { value: "fixed", label: "Fixed amount" },
  { value: "monthly_allowance", label: "Monthly allowance" },
] as const;

export const PROVIDER_TYPES = [
  { value: "business", label: "Business" },
  { value: "farm", label: "Farm" },
  { value: "school", label: "School" },
  { value: "ngo", label: "NGO / NPO" },
  { value: "church", label: "Church / Faith organisation" },
  { value: "community", label: "Community organisation" },
  { value: "municipal", label: "Municipal department" },
  { value: "government", label: "Government institution" },
  { value: "private_individual", label: "Private individual (18+ only)" },
] as const;

export const VERIFICATION_DOC_TYPES = [
  { value: "cipc", label: "CIPC Registration" },
  { value: "npc", label: "NPC Registration" },
  { value: "school", label: "School Registration" },
  { value: "municipal", label: "Municipal Verification" },
  { value: "church", label: "Church Letter" },
  { value: "community", label: "Community Organisation Letter" },
  { value: "id_document", label: "ID Document (Private individual)" },
] as const;

export const SAFEGUARDING_FLAGS = [
  { key: "involves_children", label: "Working with children" },
  { key: "involves_vulnerable_adults", label: "Working with vulnerable adults" },
  { key: "involves_home_visits", label: "Home visits" },
  { key: "involves_transport", label: "Transporting young people" },
  { key: "involves_overnight", label: "Overnight stays" },
  { key: "involves_machinery", label: "Use of machinery" },
  { key: "involves_chemicals", label: "Agricultural chemicals" },
  { key: "involves_heights", label: "Working at heights" },
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

export function youthAgeFromDob(dob: string | null | undefined): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

export function youthAgeGroupFromDob(dob: string | null | undefined): "15-17" | "18-25" | null {
  const age = youthAgeFromDob(dob);
  if (age == null) return null;
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
