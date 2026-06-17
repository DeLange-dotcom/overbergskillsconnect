
-- Extend status enums
ALTER TYPE public.youth_status ADD VALUE IF NOT EXISTS 'awaiting_parent_consent';
ALTER TYPE public.youth_status ADD VALUE IF NOT EXISTS 'suspended';
ALTER TYPE public.youth_opportunity_status ADD VALUE IF NOT EXISTS 'draft';
ALTER TYPE public.youth_opportunity_status ADD VALUE IF NOT EXISTS 'pending_verification';
ALTER TYPE public.youth_opportunity_status ADD VALUE IF NOT EXISTS 'pending_safeguarding_review';
ALTER TYPE public.youth_opportunity_status ADD VALUE IF NOT EXISTS 'archived';

-- youth_profiles extensions
ALTER TABLE public.youth_profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS id_number text,
  ADD COLUMN IF NOT EXISTS physical_address text,
  ADD COLUMN IF NOT EXISTS currently_attending_school boolean,
  ADD COLUMN IF NOT EXISTS school_name text,
  ADD COLUMN IF NOT EXISTS highest_grade text,
  ADD COLUMN IF NOT EXISTS matric_completed boolean,
  ADD COLUMN IF NOT EXISTS further_education text,
  ADD COLUMN IF NOT EXISTS id_document_url text,
  ADD COLUMN IF NOT EXISTS cv_url text,
  ADD COLUMN IF NOT EXISTS pcc_document_url text,
  ADD COLUMN IF NOT EXISTS parent_consent_form_url text,
  ADD COLUMN IF NOT EXISTS parent_full_name text,
  ADD COLUMN IF NOT EXISTS parent_relationship text,
  ADD COLUMN IF NOT EXISTS parent_mobile text,
  ADD COLUMN IF NOT EXISTS parent_email text,
  ADD COLUMN IF NOT EXISTS parent_consent_status text NOT NULL DEFAULT 'not_required'
    CHECK (parent_consent_status IN ('not_required','pending','digital_signed','uploaded','approved')),
  ADD COLUMN IF NOT EXISTS parent_consent_method text
    CHECK (parent_consent_method IN ('digital','uploaded')),
  ADD COLUMN IF NOT EXISTS parent_consent_token uuid UNIQUE,
  ADD COLUMN IF NOT EXISTS parent_consent_signed_at timestamptz,
  ADD COLUMN IF NOT EXISTS parent_consent_signature text,
  ADD COLUMN IF NOT EXISTS applicant_declaration boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS parent_declaration boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS liability_accepted boolean NOT NULL DEFAULT false;

-- youth_opportunities extensions
ALTER TABLE public.youth_opportunities
  ADD COLUMN IF NOT EXISTS provider_type text
    CHECK (provider_type IN ('business','farm','school','ngo','church','community','municipal','government','private_individual')),
  ADD COLUMN IF NOT EXISTS contact_position text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS verification_doc_type text,
  ADD COLUMN IF NOT EXISTS verification_doc_url text,
  ADD COLUMN IF NOT EXISTS positions_available integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS compensation_type text
    CHECK (compensation_type IN ('volunteer','fixed','hourly','daily','monthly_allowance')),
  ADD COLUMN IF NOT EXISTS compensation_amount numeric,
  ADD COLUMN IF NOT EXISTS skills_required text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS experience_required text,
  ADD COLUMN IF NOT EXISTS involves_children boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS involves_vulnerable_adults boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS involves_home_visits boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS involves_transport boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS involves_overnight boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS involves_machinery boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS involves_chemicals boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS involves_heights boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS requires_manual_review boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS private_individual_id_url text,
  ADD COLUMN IF NOT EXISTS private_individual_phone_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS private_individual_address text;

-- youth_applications extensions
ALTER TABLE public.youth_applications
  ADD COLUMN IF NOT EXISTS outcome text
    CHECK (outcome IN ('applied','interview_scheduled','accepted','declined','completed')),
  ADD COLUMN IF NOT EXISTS outcome_updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS outcome_notes text;

-- Mentor interest table
CREATE TABLE IF NOT EXISTS public.mentors_interest (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  mobile text,
  town text,
  skills text[] DEFAULT '{}',
  industry_experience text,
  availability text[] DEFAULT '{}',
  mode text CHECK (mode IN ('in_person','online','both')) DEFAULT 'both',
  motivation text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.mentors_interest TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.mentors_interest TO authenticated;
GRANT ALL ON public.mentors_interest TO service_role;
ALTER TABLE public.mentors_interest ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mentor_interest_insert_public" ON public.mentors_interest;
CREATE POLICY "mentor_interest_insert_public" ON public.mentors_interest
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "mentor_interest_admin_read" ON public.mentors_interest;
CREATE POLICY "mentor_interest_admin_read" ON public.mentors_interest
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "mentor_interest_admin_update" ON public.mentors_interest;
CREATE POLICY "mentor_interest_admin_update" ON public.mentors_interest
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS mentors_interest_set_updated_at ON public.mentors_interest;
CREATE TRIGGER mentors_interest_set_updated_at
  BEFORE UPDATE ON public.mentors_interest
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Trigger: route minors to parent consent
CREATE OR REPLACE FUNCTION public.tg_youth_route_minor_consent()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.dob IS NOT NULL AND (date_part('year', age(NEW.dob))::int) < 18 THEN
    IF NEW.parent_consent_status = 'not_required' THEN
      NEW.parent_consent_status := 'pending';
    END IF;
    IF NEW.parent_consent_token IS NULL THEN
      NEW.parent_consent_token := gen_random_uuid();
    END IF;
    IF NEW.parent_consent_status NOT IN ('digital_signed','uploaded','approved')
       AND NEW.status::text NOT IN ('approved','rejected','suspended') THEN
      NEW.status := 'awaiting_parent_consent'::public.youth_status;
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS tg_youth_route_minor_consent ON public.youth_profiles;
CREATE TRIGGER tg_youth_route_minor_consent
  BEFORE INSERT OR UPDATE ON public.youth_profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_youth_route_minor_consent();

-- Trigger: opportunity safeguarding flag + private individual enforcement
CREATE OR REPLACE FUNCTION public.tg_opp_flag_manual_review()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.requires_manual_review :=
    COALESCE(NEW.involves_children,false)
    OR COALESCE(NEW.involves_vulnerable_adults,false)
    OR COALESCE(NEW.involves_home_visits,false)
    OR COALESCE(NEW.involves_transport,false)
    OR COALESCE(NEW.involves_overnight,false)
    OR COALESCE(NEW.involves_machinery,false)
    OR COALESCE(NEW.involves_chemicals,false)
    OR COALESCE(NEW.involves_heights,false)
    OR NEW.provider_type = 'private_individual';

  IF NEW.provider_type = 'private_individual' THEN
    IF NEW.min_age IS NULL OR NEW.min_age < 18 THEN
      NEW.min_age := 18;
    END IF;
    NEW.prohibited_for_minors := true;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS tg_opp_flag_manual_review ON public.youth_opportunities;
CREATE TRIGGER tg_opp_flag_manual_review
  BEFORE INSERT OR UPDATE ON public.youth_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.tg_opp_flag_manual_review();

-- Trigger: block minor applying to private individual
CREATE OR REPLACE FUNCTION public.tg_block_minor_private_app()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  v_dob date;
  v_provider text;
BEGIN
  SELECT dob INTO v_dob FROM public.youth_profiles WHERE id = NEW.youth_profile_id;
  SELECT provider_type INTO v_provider FROM public.youth_opportunities WHERE id = NEW.opportunity_id;
  IF v_provider = 'private_individual' AND v_dob IS NOT NULL
     AND (date_part('year', age(v_dob))::int) < 18 THEN
    RAISE EXCEPTION 'Applicants under 18 cannot apply to private-individual opportunities.';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS tg_block_minor_private_app ON public.youth_applications;
CREATE TRIGGER tg_block_minor_private_app
  BEFORE INSERT ON public.youth_applications
  FOR EACH ROW EXECUTE FUNCTION public.tg_block_minor_private_app();

-- RPC: lookup parent consent
CREATE OR REPLACE FUNCTION public.lookup_parent_consent(_token uuid)
RETURNS TABLE (
  applicant_first_name text,
  applicant_full_name text,
  parent_full_name text,
  parent_consent_status text,
  parent_consent_signed_at timestamptz
)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT
    COALESCE(yp.first_name, split_part(yp.full_name,' ',1)),
    yp.full_name,
    yp.parent_full_name,
    yp.parent_consent_status,
    yp.parent_consent_signed_at
  FROM public.youth_profiles yp
  WHERE yp.parent_consent_token = _token
$$;

-- RPC: submit parent consent
CREATE OR REPLACE FUNCTION public.submit_parent_consent(
  _token uuid,
  _parent_name text,
  _relationship text,
  _phone text,
  _email text,
  _signature text
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid;
BEGIN
  UPDATE public.youth_profiles
     SET parent_full_name = _parent_name,
         parent_relationship = _relationship,
         parent_mobile = COALESCE(NULLIF(_phone,''), parent_mobile),
         parent_email = COALESCE(NULLIF(_email,''), parent_email),
         parent_consent_signature = _signature,
         parent_consent_signed_at = now(),
         parent_consent_status = 'digital_signed',
         parent_declaration = true,
         status = 'pending'::public.youth_status
   WHERE parent_consent_token = _token
   RETURNING id INTO v_id;
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;
  RETURN v_id;
END $$;

GRANT EXECUTE ON FUNCTION public.lookup_parent_consent(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_parent_consent(uuid,text,text,text,text,text) TO anon, authenticated;
