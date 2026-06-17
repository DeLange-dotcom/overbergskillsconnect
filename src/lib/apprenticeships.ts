// Apprenticeships & Mentorships — shared constants

export const CAREER_INTERESTS = [
  "Carpentry","Plumbing","Electrical","Construction","Welding","Farming",
  "Horticulture","Conservation","Tourism","Hospitality","Cooking",
  "Administration","Retail","Mechanics","Digital Marketing","Social Media",
  "Graphic Design","Information Technology","Childcare","Elderly Care",
  "Environmental Projects","Other",
] as const;

export const OPPORTUNITY_TYPES = [
  "Apprenticeship","Internship","Learnership","Job Shadowing",
  "Volunteer Placement","Work Experience","Holiday Work",
] as const;

export const AVAILABILITY = [
  "Full Time","Part Time","School Holidays","Weekends","After School","Flexible",
] as const;

export const PROVIDER_TYPES = [
  "Business","Farm","Tradesperson","Artisan","NPO","Community Organisation",
  "Government Programme","Educational Institution","Individual / Household",
] as const;

export const COMPENSATION_TYPES = [
  "Unpaid","Stipend","Minimum wage","Negotiable",
] as const;

export const NATIONALITIES = [
  "South African","SADC (work permit)","Other (work permit)","Refugee / Asylum seeker",
] as const;

export const WORK_PERMIT_STATUSES = [
  "Not required","Valid work permit","Pending","Not yet applied",
] as const;

export const MENTOR_CATEGORIES = [
  "Business","Agriculture","Horticulture","Conservation","Tourism","Hospitality",
  "Trades","Construction","Healthcare","Education","Technology","Finance",
  "Marketing","Community Leadership","Entrepreneurship","Other",
] as const;

export const MENTOR_FORMATS = [
  "In Person","Online","Telephone","Group Sessions",
] as const;

export const KNOWLEDGE_KEEPER_CATEGORIES = [
  "Farming","Horticulture","Indigenous Plants","Conservation","Carpentry",
  "Welding","Building Restoration","Sewing","Cooking","Food Preservation",
  "Traditional Skills","Beekeeping","Tourism","Community Leadership",
] as const;

export const LEARNING_PATHWAY = [
  "Register","Volunteer","Holiday Work","Apprenticeship",
  "Skills Training","Employment","Mentor","Community Leader",
] as const;

export const APPRENTICE_STATUSES = [
  "registered","reviewed","interview","matched","active","completed",
] as const;

export const OPPORTUNITY_STATUSES = ["open","reviewing","filled","closed"] as const;
export const MENTOR_STATUSES = ["pending","approved","active","inactive"] as const;
