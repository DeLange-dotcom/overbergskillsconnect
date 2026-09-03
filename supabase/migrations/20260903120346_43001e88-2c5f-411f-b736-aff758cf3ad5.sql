-- Fix EXPOSED_SENSITIVE_DATA: stop exposing full youth_opportunities rows (contact_email,
-- contact_phone, private_individual_* and verification_doc_url) to anon/authenticated.
-- The safe-column view youth_opportunities_public already exists and is what the app reads.

drop policy if exists "Public can read approved opportunities (safe cols)" on public.youth_opportunities;

-- Public reads go through the security-definer view, which exposes only safe columns.
grant select on public.youth_opportunities_public to anon, authenticated;
grant select on public.youth_opportunities_public to service_role;