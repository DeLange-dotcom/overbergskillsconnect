
ALTER TABLE public.apprentices
  ADD COLUMN IF NOT EXISTS nationality text,
  ADD COLUMN IF NOT EXISTS work_permit_status text,
  ADD COLUMN IF NOT EXISTS emergency_contact_name text,
  ADD COLUMN IF NOT EXISTS emergency_contact_relationship text,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone text,
  ADD COLUMN IF NOT EXISTS parent_full_name text,
  ADD COLUMN IF NOT EXISTS parent_relationship text,
  ADD COLUMN IF NOT EXISTS parent_phone text,
  ADD COLUMN IF NOT EXISTS parent_email text,
  ADD COLUMN IF NOT EXISTS parent_consent_uploaded_path text,
  ADD COLUMN IF NOT EXISTS cv_path text,
  ADD COLUMN IF NOT EXISTS location_pref text,
  ADD COLUMN IF NOT EXISTS willing_to_relocate boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS safeguarding_acknowledged_at timestamptz,
  ADD COLUMN IF NOT EXISTS safeguarding_policy_version text,
  ADD COLUMN IF NOT EXISTS disclaimer_accepted_at timestamptz;

ALTER TABLE public.apprenticeship_opportunities
  ADD COLUMN IF NOT EXISTS compensation_type text,
  ADD COLUMN IF NOT EXISTS compensation_amount numeric,
  ADD COLUMN IF NOT EXISTS hours_per_week integer,
  ADD COLUMN IF NOT EXISTS age_min integer,
  ADD COLUMN IF NOT EXISTS age_max integer,
  ADD COLUMN IF NOT EXISTS remote_available boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;

CREATE TABLE IF NOT EXISTS public.apprentice_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apprentice_id uuid NOT NULL REFERENCES public.apprentices(id) ON DELETE CASCADE,
  skill text NOT NULL,
  level text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (apprentice_id, skill)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.apprentice_skills TO authenticated;
GRANT SELECT ON public.apprentice_skills TO anon;
GRANT ALL ON public.apprentice_skills TO service_role;
ALTER TABLE public.apprentice_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Apprentices manage own skills"
  ON public.apprentice_skills FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.apprentices a
            WHERE a.id = apprentice_id AND a.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.apprentices a
            WHERE a.id = apprentice_id AND a.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Public reads skills of active apprentices"
  ON public.apprentice_skills FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (SELECT 1 FROM public.apprentices a
            WHERE a.id = apprentice_id
              AND a.status IN ('matched','active','completed')
              AND COALESCE(a.is_published, false) = true
              AND COALESCE(a.is_archived, false) = false)
  );

CREATE TRIGGER trg_apprentice_skills_updated
  BEFORE UPDATE ON public.apprentice_skills
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE IF NOT EXISTS public.opportunity_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES public.apprenticeship_opportunities(id) ON DELETE CASCADE,
  skill text NOT NULL,
  required boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (opportunity_id, skill)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunity_skills TO authenticated;
GRANT SELECT ON public.opportunity_skills TO anon;
GRANT ALL ON public.opportunity_skills TO service_role;
ALTER TABLE public.opportunity_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers manage own opportunity skills"
  ON public.opportunity_skills FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.apprenticeship_opportunities o
      JOIN public.apprenticeship_providers p ON p.id = o.provider_id
      WHERE o.id = opportunity_id AND p.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.apprenticeship_opportunities o
      JOIN public.apprenticeship_providers p ON p.id = o.provider_id
      WHERE o.id = opportunity_id AND p.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Public reads skills of approved opportunities"
  ON public.opportunity_skills FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (SELECT 1 FROM public.apprenticeship_opportunities o
            WHERE o.id = opportunity_id
              AND COALESCE(o.approved, false) = true
              AND COALESCE(o.is_published, false) = true)
  );

CREATE TRIGGER trg_opportunity_skills_updated
  BEFORE UPDATE ON public.opportunity_skills
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE IF NOT EXISTS public.placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apprentice_id uuid NOT NULL REFERENCES public.apprentices(id) ON DELETE CASCADE,
  opportunity_id uuid NOT NULL REFERENCES public.apprenticeship_opportunities(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES public.apprenticeship_providers(id) ON DELETE SET NULL,
  started_at date,
  ended_at date,
  status text NOT NULL DEFAULT 'active',
  outcome text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.placements TO authenticated;
GRANT ALL ON public.placements TO service_role;
ALTER TABLE public.placements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Involved parties view placements"
  ON public.placements FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.apprentices a
            WHERE a.id = apprentice_id AND a.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.apprenticeship_providers p
               WHERE p.id = provider_id AND p.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins manage placements"
  ON public.placements FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_placements_updated
  BEFORE UPDATE ON public.placements
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE IF NOT EXISTS public.mentorship_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  full_name text NOT NULL,
  email text NOT NULL,
  mobile text,
  career_interests text[] NOT NULL DEFAULT '{}',
  goals text,
  preferred_method text,
  preferred_frequency text,
  preferred_mentor_id uuid REFERENCES public.mentors(id) ON DELETE SET NULL,
  assigned_mentor_id uuid REFERENCES public.mentors(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  safeguarding_acknowledged_at timestamptz,
  safeguarding_policy_version text,
  disclaimer_accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentorship_requests TO authenticated;
GRANT INSERT ON public.mentorship_requests TO anon;
GRANT ALL ON public.mentorship_requests TO service_role;
ALTER TABLE public.mentorship_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a mentorship request"
  ON public.mentorship_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users view own mentorship requests"
  ON public.mentorship_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage mentorship requests"
  ON public.mentorship_requests FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_mentorship_requests_updated
  BEFORE UPDATE ON public.mentorship_requests
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
