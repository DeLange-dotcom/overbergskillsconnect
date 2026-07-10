
-- ============================================================
-- Fix 1: noticeboard_public — remove SECURITY DEFINER view behavior
-- ============================================================
ALTER VIEW public.noticeboard_public SET (security_invoker = on);

-- Restrict base-table column reads so anon/authenticated cannot read phone or manage_token
REVOKE SELECT ON public.noticeboard_profiles FROM anon;
REVOKE SELECT ON public.noticeboard_profiles FROM authenticated;

GRANT SELECT (
  id, public_listing_reference, name, town, skills, category,
  years_experience, availability, description, photo_url, created_at,
  updated_at, is_hidden, is_suspended, is_archived, archived_at,
  last_activity_at, last_login_at, last_contact_request_at,
  renewal_reminder_sent_at, archive_notice_sent_at, deletion_notice_sent_at
) ON public.noticeboard_profiles TO anon;

GRANT SELECT (
  id, public_listing_reference, name, town, skills, category,
  years_experience, availability, description, photo_url, created_at,
  updated_at, is_hidden, is_suspended, is_archived, archived_at,
  last_activity_at, last_login_at, last_contact_request_at,
  renewal_reminder_sent_at, archive_notice_sent_at, deletion_notice_sent_at
) ON public.noticeboard_profiles TO authenticated;

-- Public browse policy: only visible rows via base table (invoker view uses this)
DROP POLICY IF EXISTS "Public can browse visible listings" ON public.noticeboard_profiles;
CREATE POLICY "Public can browse visible listings"
ON public.noticeboard_profiles
FOR SELECT
TO anon, authenticated
USING (is_hidden = false AND is_suspended = false AND is_archived = false);

-- Ensure view remains readable
GRANT SELECT ON public.noticeboard_public TO anon, authenticated;

-- ============================================================
-- Fix 2: youth_opportunities — stop leaking contact/ID/address to anon
-- ============================================================

-- Remove the overly broad public policy
DROP POLICY IF EXISTS "Public can read approved opportunities" ON public.youth_opportunities;

-- Rebuild the public view with the extra fields the app needs, invoker mode
DROP VIEW IF EXISTS public.youth_opportunities_public;
CREATE VIEW public.youth_opportunities_public
WITH (security_invoker = on) AS
SELECT
  id, organisation_name, title, description, category, opportunity_type,
  min_age, max_age, town, start_date, end_date, closing_date,
  prohibited_for_minors, linked_programme, compensation_type,
  compensation_amount, provider_type, created_at
FROM public.youth_opportunities
WHERE status = 'approved'::public.youth_opportunity_status;

GRANT SELECT ON public.youth_opportunities_public TO anon, authenticated;

-- Restrict anon column access on the base table to a safe subset
REVOKE SELECT ON public.youth_opportunities FROM anon;
GRANT SELECT (
  id, organisation_name, title, description, category, opportunity_type,
  min_age, max_age, town, start_date, end_date, closing_date,
  prohibited_for_minors, linked_programme, compensation_type,
  compensation_amount, provider_type, status, created_at
) ON public.youth_opportunities TO anon;

-- Re-add a public row policy so the invoker view returns approved rows to anon
CREATE POLICY "Public can read approved opportunities (safe cols)"
ON public.youth_opportunities
FOR SELECT
TO anon, authenticated
USING (status = 'approved'::public.youth_opportunity_status);
