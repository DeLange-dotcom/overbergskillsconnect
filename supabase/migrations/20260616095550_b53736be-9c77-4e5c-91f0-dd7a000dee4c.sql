
-- =========================
-- Youth Opportunities Hub
-- =========================

-- Enums
DO $$ BEGIN
  CREATE TYPE public.youth_status AS ENUM ('pending','approved','on_hold','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.youth_opportunity_category AS ENUM ('paid','volunteer','training','internship','community_service');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.youth_opportunity_status AS ENUM ('pending','approved','rejected','closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.youth_application_status AS ENUM ('interested','applied','shortlisted','placed','completed','withdrawn');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.youth_badge_key AS ENUM (
    'community_volunteer','first_job_completed','reliable_worker',
    'environmental_champion','hospitality_helper','digital_skills_learner','community_leader'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Helpers
CREATE OR REPLACE FUNCTION public.youth_age_group(_dob date)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE
    WHEN _dob IS NULL THEN NULL
    WHEN (date_part('year', age(_dob))::int) BETWEEN 15 AND 17 THEN '15-17'
    WHEN (date_part('year', age(_dob))::int) BETWEEN 18 AND 25 THEN '18-25'
    ELSE NULL
  END
$$;

-- =========================
-- youth_profiles
-- =========================
CREATE TABLE public.youth_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  application_code text NOT NULL DEFAULT ('YTH-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,6))),
  full_name text NOT NULL,
  dob date NOT NULL,
  age_group text GENERATED ALWAYS AS (public.youth_age_group(dob)) STORED,
  town text NOT NULL,
  school text,
  education_level text,
  guardian_name text,
  guardian_relationship text,
  guardian_phone text,
  guardian_email text,
  guardian_consent_given boolean NOT NULL DEFAULT false,
  guardian_consent_at timestamptz,
  emergency_contact_name text,
  emergency_contact_phone text,
  mobile_number text,
  email text,
  interests text[] NOT NULL DEFAULT '{}',
  opportunity_types text[] NOT NULL DEFAULT '{}',
  availability text[] NOT NULL DEFAULT '{}',
  skills text[] NOT NULL DEFAULT '{}',
  languages text[] NOT NULL DEFAULT '{}',
  status public.youth_status NOT NULL DEFAULT 'pending',
  terms_accepted_at timestamptz,
  terms_version_accepted text,
  learning_city_interest boolean NOT NULL DEFAULT false,
  mentor_match_opt_in boolean NOT NULL DEFAULT false,
  notes_admin text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT youth_profiles_age_chk CHECK (public.youth_age_group(dob) IS NOT NULL)
);

GRANT SELECT, INSERT, UPDATE ON public.youth_profiles TO authenticated;
GRANT INSERT ON public.youth_profiles TO anon; -- anonymous registration allowed
GRANT ALL ON public.youth_profiles TO service_role;

ALTER TABLE public.youth_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can register a youth profile"
ON public.youth_profiles FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Youth can view own profile"
ON public.youth_profiles FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Youth can update own profile"
ON public.youth_profiles FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admins delete youth profiles"
ON public.youth_profiles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_youth_profiles_updated
BEFORE UPDATE ON public.youth_profiles
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================
-- youth_opportunities
-- =========================
CREATE TABLE public.youth_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  posted_by_user_id uuid,
  organisation_name text NOT NULL,
  contact_name text,
  contact_email text,
  contact_phone text,
  title text NOT NULL,
  description text NOT NULL,
  category public.youth_opportunity_category NOT NULL,
  opportunity_type text NOT NULL,
  min_age int NOT NULL DEFAULT 15,
  max_age int NOT NULL DEFAULT 25,
  town text NOT NULL,
  start_date date,
  end_date date,
  closing_date date,
  prohibited_for_minors boolean NOT NULL DEFAULT false,
  child_safe_reviewed boolean NOT NULL DEFAULT false,
  hazardous_flag boolean NOT NULL DEFAULT false,
  status public.youth_opportunity_status NOT NULL DEFAULT 'pending',
  approval_notes text,
  linked_programme text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.youth_opportunities TO authenticated;
GRANT INSERT ON public.youth_opportunities TO anon;
GRANT ALL ON public.youth_opportunities TO service_role;

ALTER TABLE public.youth_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an opportunity"
ON public.youth_opportunities FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Posters and admins can view their opportunities"
ON public.youth_opportunities FOR SELECT TO authenticated
USING (posted_by_user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admins can update opportunities"
ON public.youth_opportunities FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(),'admin'))
WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admins can delete opportunities"
ON public.youth_opportunities FOR DELETE TO authenticated
USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_youth_opps_updated
BEFORE UPDATE ON public.youth_opportunities
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Public, safe-column view of approved opportunities
CREATE OR REPLACE VIEW public.youth_opportunities_public
WITH (security_invoker = on) AS
SELECT id, organisation_name, title, description, category, opportunity_type,
       min_age, max_age, town, start_date, end_date, closing_date,
       prohibited_for_minors, linked_programme, created_at
FROM public.youth_opportunities
WHERE status = 'approved';

GRANT SELECT ON public.youth_opportunities_public TO anon, authenticated;

-- We need RLS to allow anon SELECT on approved rows for the view to work.
CREATE POLICY "Public can read approved opportunities"
ON public.youth_opportunities FOR SELECT TO anon, authenticated
USING (status = 'approved');

-- =========================
-- youth_applications
-- =========================
CREATE TABLE public.youth_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  youth_profile_id uuid NOT NULL REFERENCES public.youth_profiles(id) ON DELETE CASCADE,
  opportunity_id uuid REFERENCES public.youth_opportunities(id) ON DELETE SET NULL,
  status public.youth_application_status NOT NULL DEFAULT 'interested',
  hours_logged numeric(6,2) NOT NULL DEFAULT 0,
  completed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.youth_applications TO authenticated;
GRANT INSERT ON public.youth_applications TO anon;
GRANT ALL ON public.youth_applications TO service_role;

ALTER TABLE public.youth_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Youth and admins can read applications"
ON public.youth_applications FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(),'admin') OR
  EXISTS (SELECT 1 FROM public.youth_profiles yp WHERE yp.id = youth_profile_id AND yp.user_id = auth.uid())
);

CREATE POLICY "Anyone can express interest"
ON public.youth_applications FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins update applications"
ON public.youth_applications FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(),'admin'))
WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_youth_apps_updated
BEFORE UPDATE ON public.youth_applications
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================
-- youth_training
-- =========================
CREATE TABLE public.youth_training (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  youth_profile_id uuid NOT NULL REFERENCES public.youth_profiles(id) ON DELETE CASCADE,
  course_name text NOT NULL,
  provider text,
  completed_at date,
  certificate_url text,
  verified_by_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.youth_training TO authenticated;
GRANT ALL ON public.youth_training TO service_role;

ALTER TABLE public.youth_training ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read own training or admin"
ON public.youth_training FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(),'admin') OR
  EXISTS (SELECT 1 FROM public.youth_profiles yp WHERE yp.id = youth_profile_id AND yp.user_id = auth.uid())
);

CREATE POLICY "Admins write training"
ON public.youth_training FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin'))
WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_youth_training_updated
BEFORE UPDATE ON public.youth_training
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================
-- youth_references
-- =========================
CREATE TABLE public.youth_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  youth_profile_id uuid NOT NULL REFERENCES public.youth_profiles(id) ON DELETE CASCADE,
  reference_name text NOT NULL,
  reference_contact text NOT NULL,
  relationship text,
  opportunity_id uuid REFERENCES public.youth_opportunities(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.youth_references TO authenticated;
GRANT ALL ON public.youth_references TO service_role;

ALTER TABLE public.youth_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read own references or admin"
ON public.youth_references FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(),'admin') OR
  EXISTS (SELECT 1 FROM public.youth_profiles yp WHERE yp.id = youth_profile_id AND yp.user_id = auth.uid())
);

CREATE POLICY "Admins write references"
ON public.youth_references FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin'))
WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_youth_refs_updated
BEFORE UPDATE ON public.youth_references
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================
-- youth_badges
-- =========================
CREATE TABLE public.youth_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  youth_profile_id uuid NOT NULL REFERENCES public.youth_profiles(id) ON DELETE CASCADE,
  badge_key public.youth_badge_key NOT NULL,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  awarded_by uuid,
  notes text,
  UNIQUE (youth_profile_id, badge_key)
);

GRANT SELECT ON public.youth_badges TO authenticated, anon;
GRANT ALL ON public.youth_badges TO service_role;
GRANT INSERT, DELETE ON public.youth_badges TO authenticated;

ALTER TABLE public.youth_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read badges"
ON public.youth_badges FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins manage badges"
ON public.youth_badges FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin'))
WITH CHECK (public.has_role(auth.uid(),'admin'));
