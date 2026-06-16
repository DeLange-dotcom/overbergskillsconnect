
-- ============== ENUMS ==============
DO $$ BEGIN
  CREATE TYPE public.pcc_status AS ENUM ('have', 'applied', 'none');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.verification_level AS ENUM ('unverified','bronze','silver','gold');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============== PCC + VERIFICATION COLUMNS ==============
-- Same column set added to service_providers, apprentices, youth_profiles.

ALTER TABLE public.service_providers
  ADD COLUMN IF NOT EXISTS pcc_status public.pcc_status,
  ADD COLUMN IF NOT EXISTS pcc_certificate_path text,
  ADD COLUMN IF NOT EXISTS pcc_issue_date date,
  ADD COLUMN IF NOT EXISTS pcc_number text,
  ADD COLUMN IF NOT EXISTS pcc_wants_assistance boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pcc_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pcc_verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS pcc_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS pcc_admin_notes text,
  ADD COLUMN IF NOT EXISTS pcc_expiry_review_date date,
  ADD COLUMN IF NOT EXISTS identity_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS references_checked boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS interview_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_level public.verification_level NOT NULL DEFAULT 'unverified';

ALTER TABLE public.apprentices
  ADD COLUMN IF NOT EXISTS pcc_status public.pcc_status,
  ADD COLUMN IF NOT EXISTS pcc_certificate_path text,
  ADD COLUMN IF NOT EXISTS pcc_issue_date date,
  ADD COLUMN IF NOT EXISTS pcc_number text,
  ADD COLUMN IF NOT EXISTS pcc_wants_assistance boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pcc_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pcc_verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS pcc_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS pcc_admin_notes text,
  ADD COLUMN IF NOT EXISTS pcc_expiry_review_date date,
  ADD COLUMN IF NOT EXISTS identity_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS references_checked boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS interview_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_level public.verification_level NOT NULL DEFAULT 'unverified';

ALTER TABLE public.youth_profiles
  ADD COLUMN IF NOT EXISTS pcc_status public.pcc_status,
  ADD COLUMN IF NOT EXISTS pcc_certificate_path text,
  ADD COLUMN IF NOT EXISTS pcc_issue_date date,
  ADD COLUMN IF NOT EXISTS pcc_number text,
  ADD COLUMN IF NOT EXISTS pcc_wants_assistance boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pcc_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pcc_verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS pcc_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS pcc_admin_notes text,
  ADD COLUMN IF NOT EXISTS pcc_expiry_review_date date,
  ADD COLUMN IF NOT EXISTS identity_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS references_checked boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS interview_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_level public.verification_level NOT NULL DEFAULT 'unverified';

-- ============== TRIGGERS ==============
-- Compute verification_level + expiry review date automatically.
CREATE OR REPLACE FUNCTION public.tg_compute_pcc_verification()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- expiry review = issue date + 12 months
  IF NEW.pcc_issue_date IS NOT NULL THEN
    NEW.pcc_expiry_review_date := NEW.pcc_issue_date + INTERVAL '12 months';
  ELSE
    NEW.pcc_expiry_review_date := NULL;
  END IF;

  -- verification level derived from admin-set booleans
  IF NEW.identity_verified AND NEW.references_checked AND NEW.interview_completed AND NEW.pcc_verified THEN
    NEW.verification_level := 'gold';
  ELSIF NEW.identity_verified AND NEW.references_checked AND NEW.interview_completed THEN
    NEW.verification_level := 'silver';
  ELSIF NEW.identity_verified AND NEW.references_checked THEN
    NEW.verification_level := 'bronze';
  ELSE
    NEW.verification_level := 'unverified';
  END IF;

  RETURN NEW;
END;
$$;

-- Block non-admins from editing admin-only verification fields.
CREATE OR REPLACE FUNCTION public.tg_protect_admin_pcc_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  NEW.pcc_verified         := OLD.pcc_verified;
  NEW.pcc_verified_by      := OLD.pcc_verified_by;
  NEW.pcc_verified_at      := OLD.pcc_verified_at;
  NEW.pcc_admin_notes      := OLD.pcc_admin_notes;
  NEW.identity_verified    := OLD.identity_verified;
  NEW.references_checked   := OLD.references_checked;
  NEW.interview_completed  := OLD.interview_completed;
  NEW.verification_level   := OLD.verification_level;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_admin_pcc_fields_service_providers ON public.service_providers;
CREATE TRIGGER protect_admin_pcc_fields_service_providers
  BEFORE UPDATE ON public.service_providers
  FOR EACH ROW EXECUTE FUNCTION public.tg_protect_admin_pcc_fields();

DROP TRIGGER IF EXISTS compute_pcc_verification_service_providers ON public.service_providers;
CREATE TRIGGER compute_pcc_verification_service_providers
  BEFORE INSERT OR UPDATE ON public.service_providers
  FOR EACH ROW EXECUTE FUNCTION public.tg_compute_pcc_verification();

DROP TRIGGER IF EXISTS protect_admin_pcc_fields_apprentices ON public.apprentices;
CREATE TRIGGER protect_admin_pcc_fields_apprentices
  BEFORE UPDATE ON public.apprentices
  FOR EACH ROW EXECUTE FUNCTION public.tg_protect_admin_pcc_fields();

DROP TRIGGER IF EXISTS compute_pcc_verification_apprentices ON public.apprentices;
CREATE TRIGGER compute_pcc_verification_apprentices
  BEFORE INSERT OR UPDATE ON public.apprentices
  FOR EACH ROW EXECUTE FUNCTION public.tg_compute_pcc_verification();

DROP TRIGGER IF EXISTS protect_admin_pcc_fields_youth_profiles ON public.youth_profiles;
CREATE TRIGGER protect_admin_pcc_fields_youth_profiles
  BEFORE UPDATE ON public.youth_profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_protect_admin_pcc_fields();

DROP TRIGGER IF EXISTS compute_pcc_verification_youth_profiles ON public.youth_profiles;
CREATE TRIGGER compute_pcc_verification_youth_profiles
  BEFORE INSERT OR UPDATE ON public.youth_profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_compute_pcc_verification();

-- ============== STORAGE POLICIES (pcc-documents) ==============
-- Path convention: {user_id}/{anything}
DROP POLICY IF EXISTS "pcc owner read own"      ON storage.objects;
DROP POLICY IF EXISTS "pcc owner upload own"    ON storage.objects;
DROP POLICY IF EXISTS "pcc owner update own"    ON storage.objects;
DROP POLICY IF EXISTS "pcc owner delete own"    ON storage.objects;
DROP POLICY IF EXISTS "pcc admins manage all"   ON storage.objects;

CREATE POLICY "pcc owner read own"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'pcc-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "pcc owner upload own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'pcc-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "pcc owner update own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'pcc-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "pcc owner delete own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'pcc-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "pcc admins manage all"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'pcc-documents'
    AND public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    bucket_id = 'pcc-documents'
    AND public.has_role(auth.uid(), 'admin')
  );
