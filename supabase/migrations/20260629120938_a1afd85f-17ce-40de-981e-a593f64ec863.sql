
-- 1. Drop overly broad public SELECT policies that exposed all columns
DROP POLICY IF EXISTS "directory_public_read_ap" ON public.apprentices;
DROP POLICY IF EXISTS "directory_public_read_sp" ON public.service_providers;
DROP POLICY IF EXISTS "directory_public_read_yp" ON public.youth_profiles;
DROP POLICY IF EXISTS "Public can browse via view" ON public.noticeboard_profiles;
DROP POLICY IF EXISTS "public_can_read_feedback" ON public.feedback_responses;

-- 2. Safe public views (definer-mode: security_invoker=off) exposing only non-PII columns
CREATE OR REPLACE VIEW public.service_providers_public
WITH (security_invoker=off) AS
SELECT id, display_name, full_name, town, category, services, languages,
       short_bio, profile_photo_url, verification_level,
       available_immediately, days_available, years_experience, created_at
FROM public.service_providers
WHERE is_published AND NOT is_suspended AND NOT is_archived;

CREATE OR REPLACE VIEW public.apprentices_public
WITH (security_invoker=off) AS
SELECT id, full_name, town, category, career_interests, languages,
       verification_level, availability, short_bio, profile_photo_url, created_at
FROM public.apprentices
WHERE is_published AND NOT is_suspended AND NOT is_archived;

CREATE OR REPLACE VIEW public.youth_profiles_public
WITH (security_invoker=off) AS
SELECT id, first_name, full_name, town, interests, skills, languages,
       profile_photo_url, verification_level, age_group, created_at
FROM public.youth_profiles
WHERE is_published AND NOT is_suspended AND NOT is_archived;

GRANT SELECT ON public.service_providers_public TO anon, authenticated;
GRANT SELECT ON public.apprentices_public TO anon, authenticated;
GRANT SELECT ON public.youth_profiles_public TO anon, authenticated;

-- 3. Feedback responses: aggregate-friendly view filtered to active applicants only
CREATE OR REPLACE VIEW public.feedback_responses_public
WITH (security_invoker=off) AS
SELECT fr.id, fr.applicant_type, fr.applicant_id,
       fr.reliability, fr.communication, fr.punctuality,
       fr.would_recommend, fr.comment, fr.engaged, fr.created_at
FROM public.feedback_responses fr
WHERE fr.engaged = 'yes'
  AND (
    (fr.applicant_type = 'service_provider' AND EXISTS (
        SELECT 1 FROM public.service_providers sp
        WHERE sp.id = fr.applicant_id
          AND sp.is_published AND NOT sp.is_suspended AND NOT sp.is_archived))
    OR (fr.applicant_type = 'apprentice' AND EXISTS (
        SELECT 1 FROM public.apprentices ap
        WHERE ap.id = fr.applicant_id
          AND ap.is_published AND NOT ap.is_suspended AND NOT ap.is_archived))
    OR (fr.applicant_type = 'youth' AND EXISTS (
        SELECT 1 FROM public.youth_profiles yp
        WHERE yp.id = fr.applicant_id
          AND yp.is_published AND NOT yp.is_suspended AND NOT yp.is_archived))
  );

GRANT SELECT ON public.feedback_responses_public TO anon, authenticated;

-- 4. RPCs for noticeboard so anon never needs SELECT on the base table (which holds manage_token)
CREATE OR REPLACE FUNCTION public.noticeboard_owner_get_listing(_manage_token uuid)
RETURNS TABLE(id uuid, public_listing_reference text, is_hidden boolean, name text)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT id, public_listing_reference, is_hidden, name
  FROM public.noticeboard_profiles
  WHERE manage_token = _manage_token;
$$;

CREATE OR REPLACE FUNCTION public.noticeboard_create_listing(_payload jsonb)
RETURNS TABLE(manage_token uuid, public_listing_reference text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_row public.noticeboard_profiles%ROWTYPE;
BEGIN
  INSERT INTO public.noticeboard_profiles (
    name, town, phone, description, skills, category,
    years_experience, availability, photo_url, accepted_terms
  ) VALUES (
    NULLIF(_payload->>'name',''),
    NULLIF(_payload->>'town',''),
    NULLIF(_payload->>'phone',''),
    NULLIF(_payload->>'description',''),
    COALESCE(
      (SELECT array_agg(value) FROM jsonb_array_elements_text(_payload->'skills')),
      '{}'::text[]
    ),
    NULLIF(_payload->>'category',''),
    NULLIF(_payload->>'years_experience','')::int,
    NULLIF(_payload->>'availability',''),
    NULLIF(_payload->>'photo_url',''),
    COALESCE((_payload->>'accepted_terms')::boolean, false)
  ) RETURNING * INTO v_row;
  RETURN QUERY SELECT v_row.manage_token, v_row.public_listing_reference;
END $$;

REVOKE ALL ON FUNCTION public.noticeboard_create_listing(jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.noticeboard_owner_get_listing(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.noticeboard_create_listing(jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.noticeboard_owner_get_listing(uuid) TO anon, authenticated;

-- 5. Storage: restrict provider-documents uploads to authenticated users uploading under their own folder
DROP POLICY IF EXISTS "Anyone can upload provider docs" ON storage.objects;
CREATE POLICY "Authenticated upload own provider docs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'provider-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
