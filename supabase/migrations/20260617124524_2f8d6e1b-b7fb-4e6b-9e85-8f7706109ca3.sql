
ALTER TABLE public.service_providers
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_suspended boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_archived  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS short_bio text,
  ADD COLUMN IF NOT EXISTS profile_photo_url text,
  ADD COLUMN IF NOT EXISTS languages text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS work_permit_required boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS work_permit_verified boolean NOT NULL DEFAULT false;

ALTER TABLE public.apprentices
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_suspended boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_archived  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS short_bio text,
  ADD COLUMN IF NOT EXISTS profile_photo_url text,
  ADD COLUMN IF NOT EXISTS languages text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS work_permit_required boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS work_permit_verified boolean NOT NULL DEFAULT false;

ALTER TABLE public.youth_profiles
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_suspended boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_archived  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS short_bio text,
  ADD COLUMN IF NOT EXISTS profile_photo_url text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS work_permit_required boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS work_permit_verified boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.tg_compute_pcc_verification()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE wp_ok boolean;
BEGIN
  IF NEW.pcc_issue_date IS NOT NULL THEN
    NEW.pcc_expiry_review_date := NEW.pcc_issue_date + INTERVAL '12 months';
  ELSE
    NEW.pcc_expiry_review_date := NULL;
  END IF;
  wp_ok := (NOT COALESCE(NEW.work_permit_required, false)) OR COALESCE(NEW.work_permit_verified, false);
  IF NEW.identity_verified AND NEW.references_checked AND NEW.interview_completed AND NEW.pcc_verified AND wp_ok THEN
    NEW.verification_level := 'gold';
  ELSIF NEW.identity_verified AND NEW.references_checked AND NEW.interview_completed THEN
    NEW.verification_level := 'silver';
  ELSIF NEW.identity_verified AND NEW.references_checked THEN
    NEW.verification_level := 'bronze';
  ELSE
    NEW.verification_level := 'unverified';
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.tg_auto_publish_on_approve()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.status::text = 'approved' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    NEW.is_published := true;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS tg_sp_autopublish ON public.service_providers;
CREATE TRIGGER tg_sp_autopublish BEFORE UPDATE ON public.service_providers
  FOR EACH ROW EXECUTE FUNCTION public.tg_auto_publish_on_approve();
DROP TRIGGER IF EXISTS tg_ap_autopublish ON public.apprentices;
CREATE TRIGGER tg_ap_autopublish BEFORE UPDATE ON public.apprentices
  FOR EACH ROW EXECUTE FUNCTION public.tg_auto_publish_on_approve();
DROP TRIGGER IF EXISTS tg_yp_autopublish ON public.youth_profiles;
CREATE TRIGGER tg_yp_autopublish BEFORE UPDATE ON public.youth_profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_auto_publish_on_approve();

CREATE OR REPLACE VIEW public.directory_profiles
WITH (security_invoker = true) AS
SELECT
  'service_provider'::text AS applicant_type,
  sp.id,
  split_part(coalesce(sp.display_name, sp.full_name), ' ', 1) AS first_name,
  sp.town AS area,
  sp.category,
  (sp.services)::text[] AS skills,
  sp.languages,
  sp.short_bio,
  sp.profile_photo_url,
  sp.verification_level::text AS verification_level,
  sp.available_immediately AS available_now,
  (sp.days_available)::text[] AS availability,
  sp.created_at
FROM public.service_providers sp
WHERE sp.is_published AND NOT sp.is_suspended AND NOT sp.is_archived
UNION ALL
SELECT
  'apprentice'::text, ap.id,
  split_part(ap.full_name, ' ', 1), ap.town, ap.category,
  (ap.career_interests)::text[], ap.languages,
  null::text, null::text,
  ap.verification_level::text,
  null::boolean, (ap.availability)::text[], ap.created_at
FROM public.apprentices ap
WHERE ap.is_published AND NOT ap.is_suspended AND NOT ap.is_archived
UNION ALL
SELECT
  'youth'::text, yp.id,
  split_part(yp.full_name, ' ', 1), yp.town, yp.category,
  (yp.skills)::text[], yp.languages,
  yp.short_bio, yp.profile_photo_url,
  yp.verification_level::text,
  null::boolean, (yp.availability)::text[], yp.created_at
FROM public.youth_profiles yp
WHERE yp.is_published AND NOT yp.is_suspended AND NOT yp.is_archived;

GRANT SELECT ON public.directory_profiles TO anon, authenticated;

DROP POLICY IF EXISTS "directory_public_read_sp" ON public.service_providers;
CREATE POLICY "directory_public_read_sp" ON public.service_providers
  FOR SELECT TO anon, authenticated
  USING (is_published AND NOT is_suspended AND NOT is_archived);

DROP POLICY IF EXISTS "directory_public_read_ap" ON public.apprentices;
CREATE POLICY "directory_public_read_ap" ON public.apprentices
  FOR SELECT TO anon, authenticated
  USING (is_published AND NOT is_suspended AND NOT is_archived);

DROP POLICY IF EXISTS "directory_public_read_yp" ON public.youth_profiles;
CREATE POLICY "directory_public_read_yp" ON public.youth_profiles
  FOR SELECT TO anon, authenticated
  USING (is_published AND NOT is_suspended AND NOT is_archived);
