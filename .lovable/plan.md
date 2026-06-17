# Hineni Youth Opportunities Hub — Enhancement Plan

This plan delivers three connected workflows: (1) a richer multi-step youth registration with parent consent for under-18s, (2) a searchable Opportunity Board fed only by approved posts, and (3) a comprehensive "Post an Opportunity" form with safeguarding review. A Mentor placeholder is added for the future pathway.

Hineni's role is reinforced throughout as **facilitator only** — not an employment agency.

---

## 1. Database changes (single migration)

### `youth_profiles` — extend
Add columns the new registration captures:
- `first_name`, `last_name`, `gender`, `id_number`
- `currently_attending_school` (bool), `school_name`, `highest_grade`, `matric_completed` (bool), `further_education`
- `availability` (text[]) — multi
- `id_document_url`, `cv_url`, `pcc_url`, `parent_consent_form_url`
- `parent_full_name`, `parent_relationship`, `parent_mobile`, `parent_email`, `emergency_contact`
- `parent_consent_status` (enum: `not_required` | `pending` | `digital_signed` | `uploaded` | `approved`)
- `parent_consent_token` (uuid, unique) — secure link
- `parent_consent_signed_at`, `parent_consent_signature` (text)
- `applicant_declaration` (bool), `parent_declaration` (bool), `liability_accepted` (bool)
- Extend `status` enum / check to allow `pending_review`, `awaiting_parent_consent`, `approved`, `rejected`, `suspended`

### `youth_opportunities` — extend
- `provider_type` (enum)
- `position`, `website`
- `verification_doc_type`, `verification_doc_url`
- `positions_available` (int)
- `compensation_type` (enum), `compensation_amount` (numeric), `compensation_currency` default `ZAR`
- `skills_required` (text[]), `experience_required`
- Safeguarding flags: `involves_children`, `involves_vulnerable_adults`, `involves_home_visits`, `involves_transport`, `involves_overnight`, `involves_machinery`, `involves_chemicals`, `involves_heights`
- `requires_manual_review` (bool, auto-set by trigger when any flag true)
- `private_individual_id_url`, `private_individual_phone_verified`, `private_individual_address`
- Extend `status` to: `draft`, `pending_verification`, `pending_safeguarding_review`, `approved`, `rejected`, `archived`

### `youth_applications` — extend
- `outcome` (enum: `applied`, `interview_scheduled`, `accepted`, `declined`, `completed`)
- `outcome_updated_at`, `outcome_notes`

### New: `mentors_interest` (placeholder)
- `full_name`, `email`, `mobile`, `skills` (text[]), `industry_experience`, `availability` (text[]), `mode` (`in_person` | `online` | `both`), `status` (`pending` | `approved` | `rejected`)
- Standard RLS: anyone can insert, only admins read/update.

### Triggers
- Auto-set `youth_profiles.parent_consent_status = 'pending'` and `status = 'awaiting_parent_consent'` when DOB < 18 at insert.
- Auto-set `youth_opportunities.requires_manual_review = true` when any safeguarding flag is true or `provider_type = 'private_individual'`.
- Auto-enforce: applications from minors (15-17) cannot be inserted against opportunities where `provider_type = 'private_individual'`.

### RPCs
- `submit_parent_consent(_token, _name, _relationship, _signature, _phone, _email)` — security definer, marks consent signed & flips profile status to `pending_review`.
- `lookup_parent_consent(_token)` — returns applicant first name + status.

### Storage
- New private bucket `youth-documents` for ID / CV / PCC / parent consent uploads.
- New private bucket `opportunity-documents` for verification docs and private-individual ID.

### Grants
Standard GRANTs to `anon` (insert registration / opportunity / mentor interest), `authenticated`, `service_role` per project convention.

---

## 2. Frontend — Youth Registration (`/youth/register`)

Rebuild as 8-step wizard with progress indicator. Steps match spec sections:

1. Personal Details (auto-calc age from DOB)
2. Education
3. Skills & Interests (extended list per spec)
4. Availability (multi-select)
5. Documents (uploads to `youth-documents`)
6. Parent / Guardian — **only renders if age < 18**
7. Parent Consent method — **only if under 18**: choose Digital (email link auto-sent) OR Downloadable PDF
8. Declarations (applicant + parent if minor + liability)

On submit:
- Insert into `youth_profiles`.
- If under 18 + digital consent chosen → server fn emails parent (using existing Lovable email infra if configured; otherwise queue & display "Parent will receive email shortly"). Generate `parent_consent_token`.
- If under 18 + downloadable chosen → show PDF download link + upload field on a follow-up screen.
- Status display screen: "Awaiting Parent Consent" / "Pending Review".

New public route: `/youth/parent-consent/$token` — parent lookup + sign form (digital signature = typed full name + checkbox + timestamp).

Downloadable PDF: simple `public/parent-consent-form.pdf` placeholder generated at build (static doc with fields).

---

## 3. Frontend — Opportunity Board (`/youth/opportunities`)

Replace existing filters with the full spec:
- Opportunity Type (10 options)
- Age Group (15-17 / 18-25 — filters by overlap with min/max age)
- Location (Napier, Bredasdorp, Caledon, Hermanus, Other)
- Category (10 options)
- Compensation Type

Cards show: title, organisation, location, type, age range, closing date, compensation type.

"Apply" CTA:
- If signed-in + approved youth → insert into `youth_applications`.
- Else → redirect to `/youth/register` with `?returnTo=` param.

Update home/youth landing page: replace "Browse Opportunities" button to point at the board (already does — confirm wiring).

---

## 4. Frontend — Post an Opportunity (`/youth/post-opportunity`)

Rebuild as sectioned form:
1. Provider Type (9 options incl. Private Individual)
2. Organisation Details
3. Verification Documents (upload — required, at least one)
4. Opportunity Details
5. Opportunity Type (with inline definitions for Casual / Micro Job)
6. Eligibility (min/max age, skills, experience)
7. Safeguarding checklist (8 flags) — any checked = banner "This opportunity will require manual safeguarding review"
8. Compensation
9. If Private Individual: extra ID upload + phone + address + notice "applicants aged 18-25 only" (forces min_age ≥ 18)

On submit: status set to `pending_verification` (or `pending_safeguarding_review` if any flag true).

---

## 5. Admin

Extend `/admin` youth + opportunities lists to surface the new statuses and a safeguarding-review queue. Allow admins to:
- Approve / reject / suspend youth profiles
- Approve / reject opportunities
- Update application outcomes (also exposed to providers later — out of scope for this pass; admin-only now)

---

## 6. Mentor placeholder

- Card on Youth Hub: "Become a Mentor — coming soon. Register your interest."
- Public form at `/mentors/interest` → inserts into `mentors_interest`.
- Admin list view of submissions.

---

## 7. Disclaimer

Render the existing `HineniDisclaimer` component on registration, opportunity board, posting form, and parent consent page.

---

## Technical notes (for engineers)

- Server fn `sendParentConsentEmail` (createServerFn) — uses existing email infra if scaffolded, otherwise no-op + log so build doesn't fail.
- Public route `/youth/parent-consent/$token` — SSR-safe; calls RPC `lookup_parent_consent`.
- File uploads via `supabase.storage` from the browser to private buckets; store returned paths.
- Age computed client-side AND enforced server-side via trigger.
- Minor → private-individual application block enforced via trigger raising `exception`.
- All new tables/cols ship with GRANTs + RLS in one migration.

---

## Out of scope (call out for the user)

- Real email delivery for parent consent requires the email-infrastructure setup tool to be run first; this plan wires the call site but will degrade gracefully if email isn't configured yet. I'll flag this on completion.
- Provider self-service application outcome updates (spec mentions it) — added DB column + admin UI now; provider-side UI in a follow-up.
- Phone verification for Private Individuals — DB flag added, real OTP integration is a follow-up (manual admin verification for now).

Reply "go" to build, or tell me what to adjust.