
-- 1. Convert SECURITY DEFINER views to SECURITY INVOKER
ALTER VIEW public.service_providers_public SET (security_invoker = on);
ALTER VIEW public.feedback_responses_public SET (security_invoker = on);
ALTER VIEW public.apprentices_public SET (security_invoker = on);
ALTER VIEW public.youth_profiles_public SET (security_invoker = on);

-- 2. Restrict anon access on youth_opportunities to non-contact columns only
REVOKE SELECT ON public.youth_opportunities FROM anon;
GRANT SELECT (
  id, organisation_name, title, description, category, opportunity_type,
  min_age, max_age, town, start_date, end_date, closing_date,
  prohibited_for_minors, child_safe_reviewed, hazardous_flag, status,
  linked_programme, created_at, updated_at, provider_type, website,
  verification_doc_type, positions_available, compensation_type,
  compensation_amount, skills_required, experience_required,
  involves_children, involves_vulnerable_adults, involves_home_visits,
  involves_transport, involves_overnight, involves_machinery,
  involves_chemicals, involves_heights, requires_manual_review,
  organisation_id
) ON public.youth_opportunities TO anon;

-- 3. Allow service providers to read their own uploaded provider-documents
CREATE POLICY "Owners read own provider docs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'provider-documents'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);
