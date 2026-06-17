# Apprenticeships & Mentorships Module — Build Plan

This is a large module. I'll deliver it in **5 sequential phases**, each shippable on its own. After you approve the plan I'll start with Phase 1 and check in between phases.

The existing project already has partial scaffolding I'll reuse / extend rather than rebuild:

- `apprentices`, `apprenticeship_opportunities`, `apprenticeship_providers`, `mentors`, `mentors_interest`, `mentor_matches`, `provider_documents`, `provider_references`, `provider_vetting_checks`, `vetting_pdf_exports`, `safety_reports`, `feedback_*` tables exist.
- Routes exist for `apprenticeships.*` (opportunities, register-apprentice, register-provider, mentors, become-mentor, impact).
- Admin routes exist under `_authenticated/admin/` for apprenticeships, providers, apprentices.
- Shared constants in `src/lib/apprenticeships.ts`, terms acceptance, PCC panel, verification badges already exist.

So most of this work is **gap-filling, polish, and the new safeguarding policy + mentorship request flow**, not greenfield.

---

## Phase 1 — Safeguarding Policy + Acknowledgement component

- New route `/safeguarding-policy` (13 sections, last-updated date, Print + Download PDF buttons).
- Constants file `src/lib/safeguarding.ts` (version, last updated).
- New component `<SafeguardingAcknowledgement />` — 4 mandatory checkboxes with links to policy / terms / privacy; reusable across all registration forms.
- New component `<LegalDisclaimer />` with the exact disclaimer copy + mandatory checkbox.
- Migration: add `safeguarding_acknowledged_at`, `safeguarding_policy_version`, `disclaimer_accepted_at` columns to `apprentices`, `mentors`, `apprenticeship_providers`, `apprenticeship_opportunities` (only where missing).

## Phase 2 — Schema extensions for future matching + mentorship requests

Migration only (you approve before it runs):

- New table `mentorship_requests` (full_name, email, mobile, career_interests[], current_situation, goals, preferred_method, preferred_frequency, status, assigned_mentor_id, timestamps). RLS + GRANTs.
- New table `apprentice_skills` and `opportunity_skills` (normalised skill tags) to enable future matching without redesign.
- New table `placements` (apprentice_id, opportunity_id, started_at, ended_at, outcome, status) — the join the brief calls for.
- Add missing columns to `apprentices` (nationality, work_permit_status, emergency_contact_*, parent_consent_uploaded_path, cv_path, location_pref, education fields) and `apprenticeship_opportunities` (compensation_type, compensation_amount, hours_per_week, age_range, remote_available) where not already present.
- Storage bucket `apprenticeship-documents` (private) for CVs, parent consent uploads, mentor PCCs.

## Phase 3 — Apprentice & Provider registration forms (fill the gaps)

- Extend `apprenticeships.register-apprentice.tsx`: add nationality, work permit, emergency contact block, full parent/guardian block with **download + upload Parent Consent Form** (blocks submit if <18 and no upload), CV upload, location preferences. Wire SafeguardingAcknowledgement + LegalDisclaimer.
- Extend `apprenticeships.register-provider.tsx`: add provider type (incl. Individual Household), verification document uploads (ID, registration, proof of address, references), full opportunity details incl. compensation conditional fields, age range, remote available. Wire acknowledgement + disclaimer.
- Generated PDF Parent Consent Form (download endpoint) using pdf-lib at `/api/public/parent-consent.pdf`.

## Phase 4 — Mentor flows

- Extend `apprenticeships.become-mentor.tsx` to the full Mentor Registration Form (expertise multi-select, preferences, availability, bio/qualifications/LinkedIn/website, profile photo upload, PCC upload, two references, safeguarding declaration). Wire acknowledgement + disclaimer.
- Rebuild `apprenticeships.mentors.tsx` as a **searchable directory** with filters (industry, skills, location, online/in-person, language, availability) and mentor cards with "Request Mentorship" button.
- New route `apprenticeships.request-mentorship.$mentorId.tsx` with the mentorship request form → inserts into `mentorship_requests`.
- New route `apprenticeships.request-mentorship.tsx` (general request, no specific mentor).

## Phase 5 — Admin panel + trust badges + polish

- Extend `_authenticated/admin/apprenticeships.tsx` (or split): tabs for Apprentices / Opportunities / Mentors / Mentorship Requests.
  - Apprentices: view / approve / reject / export CSV / export PDF.
  - Opportunities: review / approve / reject / publish / archive.
  - Mentors: review / approve / reject / suspend (blocks approval until PCC + 2 references + safeguarding declaration present).
  - Mentorship Requests: list, assign mentor (dropdown of approved mentors), update status, progress notes.
- Public Trust & Safety badges (`<VerificationBadge />` already exists) shown on approved public mentor & opportunity cards: Identity Verified, References Verified, PCC Submitted, Safeguarding Acknowledged.
- Final pass on `/apprenticeships` landing page to link the new flows cleanly.

---

## Technical notes

- All tables use the existing `tg_set_updated_at` trigger and follow the project's RLS pattern (`has_role(auth.uid(),'admin')` for admin writes, owner-scoped policies for users, narrow `TO anon` SELECT only on approved+published rows).
- File uploads go to existing private buckets where possible (`provider-documents`, `pcc-documents`) plus the new `apprenticeship-documents` bucket for CVs / parent consent.
- Compliance references (Children's Act, POPIA, Sexual Offences Act, BCEA young-worker provisions) live in the policy page copy and in the on-form disclaimer.
- Future matching: `apprentice_skills` + `opportunity_skills` + `placements` give a clean join surface; no schema rewrite needed later to add a matching algorithm.

---

## What I need from you before starting

1. **Approve the plan** (or tell me to drop / reorder phases).
2. **Policy "Last Updated" date** — use today (17 June 2026) or another date?
3. **Hineni contact email for safeguarding reports** — to put in the policy's "Reporting Concerns" section. If you don't have one yet I'll use `safeguarding@hineni.org.za` as a placeholder you can edit.

Once you confirm, I'll start with Phase 1.
