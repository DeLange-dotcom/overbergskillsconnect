# MVP Refactor — Khulisa Skills Connect Noticeboard

Strip the public surface down to a community noticeboard. **No code or database is deleted** — everything is hidden behind a single feature-flag module and can be re-enabled later.

## 1. Feature flags (one source of truth)

Add `src/lib/features.ts` exporting a `FEATURES` object:

```
youthHub, apprenticeships, volunteer, employerRegistration,
opportunityBoard, vetting, safeguarding, parentConsent,
idUploads, workPermitUploads, references, skillsVerification,
ratingsReviews, adminApprovalWorkflows, comingSoon
```

All default to `false` for MVP. Every change below reads from this file, so re-enabling a module later is a one-line flip.

## 2. Navigation & layout

- `Header.tsx`: NAV reduced to `Home`, `Find Someone`, `Advertise My Skills`. Drop Youth Hub / Apprenticeships / Donate / Request Support pills (gated on flags).
- `Footer.tsx`: links become **Terms of Use · Privacy Policy · Disclaimer · Contact Us**. Hide get-involved column items behind flags. Keep IP/owner lines.
- Routes for hidden modules stay on disk; they are simply unlinked. Direct URL access still works for future re-enablement.

## 3. Home page (`src/routes/index.tsx`)

Replace existing hero/stats/process/donate with a minimal layout:

- Headline: **Connecting Local Skills with Local Opportunities**
- Sub-heading: *Advertise your skills or find someone to help with work in your local community.*
- Two large CTAs:
  - 🟢 **Looking for Work** → `/advertise` (Advertise My Skills)
  - 🔵 **Looking for Someone** → `/find-help` (browse)
- Short trust strip linking to the Disclaimer.
- Remove impact stats, "Hineni Process" steps, and donation appeal section.

## 4. "Advertise My Skills" (`/advertise`)

New thin route that wraps the existing `register-provider` form with a **minimal-field mode** driven by a prop. Fields shown:

Name · Town/Area · Skills · Years of Experience · Availability · Short Description · Optional Photo · Telephone (private)

All vetting/PCC/work-permit/ID/reference/safeguarding fields are hidden via the feature flags. Telephone is stored on the existing column but never exposed in any public query.

Required acknowledgements before submit:

- I am over 18.
- Information is true and accurate.
- I accept the Terms of Use and Privacy Policy.
- I understand Khulisa Skills Connect is a community noticeboard only.

## 5. "Looking for Someone" (`/find-help` + `/directory`)

- Card grid showing: Photo, Name, Town, Skills, Experience, Availability, Description.
- Search by town and skill category (use existing directory filters, trimmed).
- **No phone number, no vetting badges, no ratings** displayed.
- Each card has two buttons:
  - **Request Contact Details** → opens existing contact-request flow (already in DB as `contact_requests`).
  - 🚩 **Report this Profile** → opens report dialog (uses existing `safety_reports` table) with reasons: Spam, Fraud, Offensive Content, False Information, Inappropriate Behaviour.
- Detail page (`/directory/$type/$id`) mirrors the same minimal info + Disclaimer banner.

## 6. Contact-reveal flow

Existing `contact_requests` table already supports this. Wire the worker-facing approve/decline action:

- Worker receives notification (email via existing transactional path if configured; otherwise visible in their profile area on next sign-in — kept simple for MVP).
- On **Share**: requester sees phone number on the request page.
- On **Decline**: requester sees a polite decline message.
- Phone number is never returned by any public list/detail endpoint — only by the authenticated "view approved contact request" endpoint.

## 7. Legal pages

Rewrite content (UI only, constants in `src/lib/brand.ts` kept):

- **`/terms`** — South-African Terms of Use with the full list of "Khulisa is not / does not" statements from the brief.
- **`/privacy`** — POPIA-aligned: what's collected, why, storage, edit/delete rights, phone-number rule.
- **`/disclaimer`** — new route with the exact disclaimer wording from the brief. Banner version shown on registration, footer, and profile pages via a shared `<DisclaimerBanner />` component.
- **`/contact`** — new simple contact page (email + short form posting to existing contact endpoint, or mailto fallback).

## 8. Admin area

Trim `/admin` dashboard to four actions only (others hidden via flags):

- Review reports (`safety_reports`)
- Remove inappropriate profiles (soft-hide via existing `is_published` / status field)
- Suspend abusive users
- Manage platform content

All "approve / verify / certify" controls hidden behind `adminApprovalWorkflows` flag.

## 9. Database

No migrations required. All needed tables (`service_providers`, `contact_requests`, `safety_reports`, `terms_acceptances`) already exist with appropriate columns. We only change what the UI reads/writes.

## Files touched (high level)

- **New**: `src/lib/features.ts`, `src/components/site/DisclaimerBanner.tsx`, `src/components/site/ReportProfileDialog.tsx`, `src/routes/advertise.tsx`, `src/routes/disclaimer.tsx`, `src/routes/contact.tsx`.
- **Edited**: `src/routes/index.tsx`, `src/components/site/Header.tsx`, `src/components/site/Footer.tsx`, `src/routes/register-provider.tsx` (add `minimal` mode), `src/routes/find-help.tsx`, `src/routes/directory.tsx`, `src/routes/directory.$type.$id.tsx`, `src/routes/terms.tsx`, `src/routes/privacy.tsx`, `src/routes/_authenticated/admin/index.tsx`.
- **Untouched but hidden**: youth/*, apprenticeships/*, donate, request-support, safeguarding-policy, all PCC/vetting components, parent consent — kept on disk for future re-enablement.

## Out of scope (for this MVP)

- Email/SMS delivery infrastructure for contact-share notifications beyond what's already wired.
- Re-styling individual hidden modules.
- New analytics or moderation tooling beyond what exists.

Confirm and I'll implement.
