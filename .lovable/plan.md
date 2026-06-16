# Youth Opportunities Hub

A new section of Hineni for young people aged 15–25 to register, discover opportunities, build a digital portfolio, and progress along the pathway: Register → Volunteer → Training → Work Experience → Employment → Mentorship → Community Leadership.

## What users will see

### Public
- **/youth** — Hub landing page. Explains the pathway, the two age groups (15–17 Youth, 18–25 Young Adult), child-safety promise, and CTAs:
  - "Register as a Young Person"
  - "Browse Opportunities"
  - "Post an Opportunity" (for vetted organisations)
- **/youth/opportunities** — Public opportunity board. Filters: category (Paid / Volunteer / Training / Internship / Community Service), type (holiday, weekend, casual, volunteer, job shadow, apprenticeship, learnership, mentorship, training), town, minimum age. Each card shows title, organisation, category, age range, location, closing date, and an "Express interest" button (routed through Hineni — never reveals contact details for under-18 applicants).
- **/youth/register** — Youth registration form (sections: Personal, Education, Guardian & Emergency, Interests, Opportunity Types, Availability, Skills, Consents, Terms). Mandatory parent/guardian consent block appears when DOB makes the applicant under 18. Reuses the existing Terms & Disclaimer component.
- **/youth/post-opportunity** — Form for organisations to submit an opportunity for Hineni vetting. Includes a child-safety declaration when the opportunity is open to under-18s.

### Authenticated youth
- **/youth/portfolio** — Digital portfolio for the signed-in young person:
  - Profile header (name, town, age group, status)
  - Skills, interests, availability
  - Experience timeline (opportunities applied for / completed)
  - Volunteer hours total and log
  - Training courses + certificates
  - References
  - Badges earned (Community Volunteer, First Job Completed, Reliable Worker, Environmental Champion, Hospitality Helper, Digital Skills Learner, Community Leader)
  - Pathway tracker showing current stage
- Youth can also see their own applications and update their availability/skills.

### Admin
- **/admin/youth** — Pending youth registrations, approve / hold / reject, view guardian consent record.
- **/admin/youth-opportunities** — Moderate submitted opportunities, mark `child_safe_reviewed`, approve/reject. Only approved opportunities appear on the public board.
- **/admin/youth/:id** — Full profile with audit access (guardian record, age-group label, opportunities, hours, badges). Award/revoke badges, log completed training, confirm hours.

## Child-safety rules (enforced, not just shown)
- DOB drives `age_group` (15–17 / 18–25). Under 15 or over 25 is rejected at submit.
- Under-18 registrations REQUIRE: guardian full name, guardian relationship, guardian phone, guardian email, `guardian_consent_given = true`, plus the existing Terms & Disclaimer acceptance recorded in the audit log.
- Opportunities are flagged `prohibited_for_minors = true` whenever the organisation selects hazardous work, late-night hours, alcohol service, heavy machinery, or any category restricted under SA labour law. The board hides those from anyone whose age group is 15–17, and admin must explicitly confirm a "not hazardous, not interfering with schooling" check before approval.
- Contact between organisations and under-18 youth is always brokered through Hineni — direct contact details are never exposed publicly.

## Data model (Lovable Cloud)

New tables (all with grants, RLS, and policies in the same migration):

- `youth_profiles` — owner `user_id` (nullable so admin can pre-register from paper forms), full_name, dob, age_group (generated), town, school, education_level, guardian_name, guardian_relationship, guardian_phone, guardian_email, guardian_consent_given, guardian_consent_at, emergency_contact_name, emergency_contact_phone, interests text[], opportunity_types text[], availability text[], skills text[], languages text[], status (pending/approved/on_hold/rejected), terms_accepted_at, terms_version_accepted, application_code, created_at, updated_at.
- `youth_opportunities` — posted_by_user_id, organisation_name, contact_email, contact_phone, title, description, category (paid/volunteer/training/internship/community_service), opportunity_type, min_age, max_age, town, start_date, end_date, closing_date, prohibited_for_minors, child_safe_reviewed, status (pending/approved/rejected/closed), approval_notes, created_at, updated_at.
- `youth_applications` — youth_profile_id, opportunity_id, status (interested/applied/shortlisted/placed/completed/withdrawn), hours_logged, completed_at, notes, created_at, updated_at.
- `youth_training` — youth_profile_id, course_name, provider, completed_at, certificate_url, verified_by_admin.
- `youth_references` — youth_profile_id, reference_name, reference_contact, relationship, opportunity_id (nullable), notes.
- `youth_badges` — youth_profile_id, badge_key (enum of the seven badges), awarded_at, awarded_by, notes. Unique on (profile, badge_key).
- Public view `youth_opportunities_public` (security_invoker) exposing only approved rows with safe columns for the board.

RLS summary:
- Youth can read/update their own `youth_profiles` row and read their applications, training, references, badges.
- Organisations (any authenticated user) can insert `youth_opportunities` and read their own submissions.
- Anonymous visitors can read `youth_opportunities_public` only.
- Admins (existing `has_role(_, 'admin')`) can read/write everything and award badges.
- Audit-log entries written for: youth registration submit, guardian consent, opportunity submission, opportunity approval/rejection, badge award, hours confirmation, admin PDF export.

## Pathway and badges
Pathway stage is derived per profile from data already in the system (volunteer hours, completed applications, training count, mentorship flag) and surfaced on the portfolio as a 6-step progress bar. Badge awards are admin-driven from the admin detail page but the rules are documented in `src/lib/youthBadges.ts` so future automation can mirror them.

## Future "Learning City" hooks
Add nullable fields on `youth_profiles` (`learning_city_interest`, `mentor_match_opt_in`) and on `youth_opportunities` (`linked_programme`) so later integrations with Hineni Learning City, mentorship schemes, and employer partnerships do not require schema rewrites.

## Files I will add/change

New routes:
- `src/routes/youth.tsx` (hub landing)
- `src/routes/youth.opportunities.tsx` (board)
- `src/routes/youth.register.tsx` (registration)
- `src/routes/youth.post-opportunity.tsx` (organisation submission)
- `src/routes/_authenticated/youth.portfolio.tsx`
- `src/routes/_authenticated/admin/youth.index.tsx`
- `src/routes/_authenticated/admin/youth.$id.tsx`
- `src/routes/_authenticated/admin/youth-opportunities.tsx`

New supporting files:
- `src/lib/youth.ts` — constants (interests, opportunity types, availability, skills, badges, hazardous-category list, pathway stages).
- `src/lib/youthBadges.ts` — badge metadata + suggested-award rules.
- `src/components/site/YouthOpportunityCard.tsx`
- `src/components/site/PathwayTracker.tsx`
- `src/components/site/BadgeChip.tsx`

Edits:
- `src/components/site/Header.tsx` and `Footer.tsx` — add "Youth Hub" nav link.
- `src/routes/index.tsx` — add a small "Youth Opportunities Hub" highlight card on the home page.
- One Supabase migration for the tables, view, grants, RLS, and audit-log triggers.

## Out of scope for this step
- Automated badge awarding (admin-driven for now; rules file is the seed).
- Stripe sponsorship of youth programmes (existing donation page already covers giving).
- Direct messaging between youth and organisations (all contact stays brokered through Hineni).
