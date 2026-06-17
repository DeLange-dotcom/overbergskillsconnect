# Post-Approval Workflow Plan

This is a large, multi-part build. I'll ship it in **4 phases** so we can review and adjust as we go. Each phase ends in a usable state.

---

## Phase 1 — Public Profiles & Directory (Steps 4–5)

**Database**
- Add to `service_providers`, `apprentices`, `youth_profiles`:
  - `is_published` (bool, auto `true` when admin approves)
  - `is_suspended`, `is_archived` (bool, default false)
  - `work_permit_verified` (bool) + extend Gold rule to require it where applicable
  - `short_bio`, `languages` (text[]), `category` (enum)
  - `profile_photo_url` (re-use existing if present)
- View `public.directory_profiles` unioning the 3 tables, exposing only safe columns. `TO anon` SELECT policy, filtered to `is_published AND NOT is_suspended AND NOT is_archived`.
- Update verification trigger: Gold now needs PCC **and** work-permit (when role requires it).

**Frontend**
- New route `/directory` — search + filters (category, location, availability, verification level, languages, skills).
- New route `/directory/$id` — public profile page with verification badge, bio, photo, "Request Contact" button.
- `VerificationBadge` shown on every card + profile page.
- Persistent disclaimer banner in footer + on profile pages.

## Phase 2 — Contact Request System (Steps 6–7)

**Database**
- Extend existing `contact_requests`: `visitor_name`, `visitor_email`, `visitor_phone`, `reason`, `applicant_type`, `applicant_id`, `category`, `status` (`new` | `contact_shared` | `closed`), `disclaimer_accepted_at`.

**Backend**
- Public server route `/api/public/contact-request` (no auth) — validates with Zod, inserts row, then sends 2 emails via Lovable Emails:
  1. To visitor → applicant's contact details
  2. To applicant → visitor's contact details
- Set status to `contact_shared` after emails enqueue.
- Requires Lovable Emails infrastructure + 2 new templates (`contact-applicant-details`, `contact-visitor-details`). I'll set up email infra in this phase.

**Frontend**
- `RequestContactDialog` with form + disclaimer checkbox, posts to the route above.

## Phase 3 — Admin Dashboard & Suspension (Steps 8, 10)

**Frontend**
- New `/admin` dashboard index with 5 sections (counts + drill-in tables):
  - Pending Applications (Awaiting Review / References / PCC / Work Permit)
  - Approved Applicants (Bronze / Silver / Gold)
  - Contact Requests
  - PCC Assistance Requests (filter on existing `pcc_wants_assistance`)
  - Safety Reports
- New `safety_reports` table (applicant ref, complaint_type, description, resolution_status, admin notes).
- On each applicant admin page: Suspend / Archive / Reinstate buttons (admin only via RLS + `has_role`).

## Phase 4 — Feedback & Reputation (Step 9)

**Database**
- `feedback_requests` (contact_request_id, scheduled_for, sent_at, token, completed_at)
- `feedback_responses` (engaged enum, reliability/communication/punctuality 1–5, would_recommend bool, comment)
- pg_cron job (every hour) → finds contact_requests >= 30 days old without a feedback_request, enqueues email with unique token.
- Computed view: per-applicant review count, avg rating, recommendation %.

**Frontend**
- Public `/feedback/$token` route — form.
- Reviews section on public profile page.
- New email template `feedback-request`.

---

## Notes
- Hineni's "introductions only" disclaimer will appear on the directory, profile pages, contact dialog, and emails.
- All public reads go through narrow `TO anon` policies and projected views — no PII leaks.
- Lovable Emails (built-in) used throughout; no third-party provider needed.

---

**Ready to start with Phase 1?** Or would you like me to adjust scope/order first (e.g. skip feedback for now, or do contact requests before the public directory)?