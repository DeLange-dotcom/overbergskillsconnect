export const SERVICE_CATEGORIES = [
  { value: "elderly_care", label: "Elderly Care" },
  { value: "childcare", label: "Childcare" },
  { value: "domestic_work", label: "Domestic Work" },
  { value: "gardening", label: "Gardening" },
  { value: "farm_work", label: "Farm Work" },
  { value: "cleaning", label: "Cleaning" },
  { value: "cooking", label: "Cooking" },
  { value: "handyman", label: "Handyman" },
  { value: "painting", label: "Painting" },
  { value: "construction", label: "Construction" },
  { value: "security", label: "Security" },
  { value: "admin", label: "Admin" },
  { value: "tutoring", label: "Tutoring" },
  { value: "computer_skills", label: "Computer Skills" },
  { value: "hospitality", label: "Hospitality" },
  { value: "driving", label: "Driving" },
  { value: "other", label: "Other" },
] as const;

export type ServiceCategoryValue = (typeof SERVICE_CATEGORIES)[number]["value"];

export const DAYS = [
  { value: "mon", label: "Mon" },
  { value: "tue", label: "Tue" },
  { value: "wed", label: "Wed" },
  { value: "thu", label: "Thu" },
  { value: "fri", label: "Fri" },
  { value: "sat", label: "Sat" },
  { value: "sun", label: "Sun" },
] as const;

export const HOURS = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "flexible", label: "Flexible" },
] as const;

export const LOOKING_FOR = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "casual", label: "Casual" },
  { value: "temporary", label: "Temporary" },
] as const;

export const TRAVEL = [
  { value: "own_town", label: "My own town only" },
  { value: "within_20km", label: "Within 20km" },
  { value: "within_50km", label: "Within 50km" },
  { value: "overberg_wide", label: "Anywhere in the Overberg" },
] as const;

export const PROVIDER_STATUS_LABELS: Record<string, string> = {
  pending_review: "Pending Review",
  awaiting_documents: "Awaiting Documents",
  id_checked: "ID Checked",
  references_checked: "References Checked",
  permit_checked: "Permit Checked",
  police_check_requested: "Police Check Requested",
  vetting_result_received: "Vetting Result Received",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
};

export const categoryLabel = (v: string) =>
  SERVICE_CATEGORIES.find((c) => c.value === v)?.label ?? v;

export const travelLabel = (v: string) =>
  TRAVEL.find((t) => t.value === v)?.label ?? v;
