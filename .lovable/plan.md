# Apprenticeships & Mentorships Hub

A new top-level section integrated alongside the Skills Register and Youth Hub, supporting four pathways: seek apprenticeship, offer apprenticeship, find mentor, become mentor. Includes a special "Master Craftspeople & Knowledge Keepers" mentor flag, an admin matching dashboard, and a public impact dashboard.

## Navigation

- Add **Apprenticeships** to `Header.tsx` main nav and `Footer.tsx`.
- Keep Youth Hub as the trailing CTA button.

## Routes (`src/routes/`)

Public:
- `apprenticeships.tsx` — Hub homepage with 4 pathway cards, learning pathway visual, impact stats.
- `apprenticeships.register-apprentice.tsx` — Apprentice registration form.
- `apprenticeships.register-provider.tsx` — Provider + opportunity registration form.
- `apprenticeships.opportunities.tsx` — Public board of open opportunities (status = Open).
- `apprenticeships.mentors.tsx` — Searchable list of approved mentors (filter by category/location/format).
- `apprenticeships.become-mentor.tsx` — Mentor registration (includes "Master Craftsperson / Knowledge Keeper" toggle + traditional-skill categories).
- `apprenticeships.impact.tsx` — Public impact dashboard.

Authenticated (under `_authenticated/admin/`):
- `apprenticeships.index.tsx` — Admin overview: apprentices, providers, mentors, opportunities, matches.
- `apprenticeships.matching.tsx` — Matching dashboard (apprentice↔opportunity, apprentice↔mentor) with status tracking.

## Database (single migration)

New tables (all RLS-enabled, GRANTs included, `updated_at` trigger via existing `tg_set_updated_at`):

1. **`apprentices`** — personal details, education, career_interests text[], opportunity_types text[], availability text[], why/skills text, cv_url, status enum (`registered|reviewed|interview|matched|active|completed`), user_id (nullable for guest), terms_acceptance_id.
2. **`apprenticeship_providers`** — provider_type, org details, user_id, status (`pending|approved|rejected`).
3. **`apprenticeship_opportunities`** — provider_id FK, title, industry, skills_offered text[], placements_available int, paid bool, stipend numeric, duration, start_date, min_age, qualifications, transport_req, safety_req, status (`open|reviewing|filled|closed`).
4. **`mentors`** — name, contact, categories text[], years_experience, background, biography, availability text, formats text[] (in_person/online/phone/group), is_knowledge_keeper bool, knowledge_keeper_categories text[], status (`pending|approved|active|inactive`), user_id.
5. **`apprentice_applications`** — apprentice_id, opportunity_id, status (`submitted|interview|placed|completed|declined`), notes.
6. **`mentor_matches`** — apprentice_id (or user_id), mentor_id, status (`requested|approved|active|completed|declined`), notes.

RLS:
- Apprentices/providers/mentors: insert allowed for anyone (anon + authenticated) for self-registration; select own row by user_id; admins via `has_role(auth.uid(),'admin')` can select/update all.
- Opportunities & approved mentors: public SELECT only via security_invoker views (`apprenticeship_opportunities_public`, `mentors_public`) limited to approved/open rows + safe columns.
- Applications/matches: admin-only via `has_role`; the apprentice may select their own.

All contact brokered through Hineni — no contact info exposed in public views.

## Library files

- `src/lib/apprenticeships.ts` — constants: `CAREER_INTERESTS`, `OPPORTUNITY_TYPES`, `AVAILABILITY`, `PROVIDER_TYPES`, `MENTOR_CATEGORIES`, `MENTOR_FORMATS`, `KNOWLEDGE_KEEPER_CATEGORIES`, `LEARNING_PATHWAY` (8 stages), status labels/colors.
- `src/components/site/LearningPathway.tsx` — 8-step horizontal pathway visual (Register → Volunteer → Holiday Work → Apprenticeship → Skills Training → Employment → Mentor → Community Leader).
- `src/components/site/PathwayCard.tsx` — reusable card for the 4 hub pathways.
- `src/components/site/OpportunityCard.tsx` — apprenticeship opportunity card.
- `src/components/site/MentorCard.tsx` — mentor profile card with knowledge-keeper badge.

## Integration

- Hub homepage links into existing Youth Hub, Skills Register, Volunteer programme.
- Impact dashboard runs aggregate counts via a public server fn using `supabaseAdmin` (counts only, no PII).
- Terms & Disclaimer acceptance reused on all three registration forms via existing `TermsAcceptance` component.
- All forms validated with `zod`; mobile-first layout, large tap targets, minimal text fields per step.

## Out of scope

- Direct messaging (all contact brokered).
- Automated matching algorithm (admins match manually for now).
- CV file upload UI beyond a simple Supabase Storage upload to existing patterns (use `provider-documents` bucket or skip CV upload in v1 — TBD; default: text "CV URL" field, file upload deferred).
