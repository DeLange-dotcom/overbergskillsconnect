// Feature flags for the MVP noticeboard launch.
// Set any of these to true to re-enable a hidden module without restoring code.
export const FEATURES = {
  youthHub: false,
  apprenticeships: false,
  volunteer: false,
  employerRegistration: false,
  opportunityBoard: false,
  vetting: false,
  safeguarding: false,
  parentConsent: false,
  idUploads: false,
  workPermitUploads: false,
  references: false,
  skillsVerification: false,
  ratingsReviews: false,
  adminApprovalWorkflows: false,
  donations: false,
  legacyDirectory: false,
  comingSoon: false,
} as const;

export type Feature = keyof typeof FEATURES;
export const isEnabled = (f: Feature) => FEATURES[f];
