-- Restore public browsing of the noticeboard directory.
-- The noticeboard_public view was set to security_invoker=on, which
-- required each caller to satisfy RLS on the underlying table. Only
-- listing owners and admins have SELECT policies on
-- noticeboard_profiles, so anonymous visitors (and any signed-in user
-- looking at someone else's listing) got an empty result — nobody could
-- browse the public directory.
--
-- Fix: run the view as its (privileged) owner so it can read the base
-- table on behalf of the public, while still projecting only the safe,
-- non-sensitive columns (no phone, manage_token, or contact metadata).
-- The base table's RLS stays restrictive (owner + admin only), so direct
-- reads of sensitive columns remain blocked.

ALTER VIEW public.noticeboard_public SET (security_invoker = off);

-- Make sure anon/authenticated can query the view.
GRANT SELECT ON public.noticeboard_public TO anon, authenticated;