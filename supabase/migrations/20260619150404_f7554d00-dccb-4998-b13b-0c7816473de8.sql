
-- 1. Organisation kind enum
DO $$ BEGIN
  CREATE TYPE public.organisation_kind AS ENUM (
    'programme', 'municipality', 'school', 'npo', 'community', 'government', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. organisations table
CREATE TABLE IF NOT EXISTS public.organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  kind public.organisation_kind NOT NULL DEFAULT 'programme',
  short_description TEXT,
  website_url TEXT,
  contact_email TEXT,
  region TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.organisations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organisations TO authenticated;
GRANT ALL ON public.organisations TO service_role;

ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active organisations are viewable by everyone" ON public.organisations;
CREATE POLICY "Active organisations are viewable by everyone"
  ON public.organisations FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can insert organisations" ON public.organisations;
CREATE POLICY "Only admins can insert organisations"
  ON public.organisations FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can update organisations" ON public.organisations;
CREATE POLICY "Only admins can update organisations"
  ON public.organisations FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can delete organisations" ON public.organisations;
CREATE POLICY "Only admins can delete organisations"
  ON public.organisations FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger (reuse function if it already exists, else create)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_organisations_updated_at ON public.organisations;
CREATE TRIGGER update_organisations_updated_at
  BEFORE UPDATE ON public.organisations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Seed the Hineni Programme as the first organisation
INSERT INTO public.organisations (slug, name, kind, short_description, region)
VALUES (
  'hineni',
  'Hineni Programme',
  'programme',
  'Community skills, mentorship and apprenticeship programme delivered through the Khulisa Skills Platform in the Overberg.',
  'Overberg, Western Cape'
)
ON CONFLICT (slug) DO NOTHING;

-- 4. Add nullable organisation_id to participating tables
ALTER TABLE public.service_providers       ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES public.organisations(id) ON DELETE SET NULL;
ALTER TABLE public.service_requests        ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES public.organisations(id) ON DELETE SET NULL;
ALTER TABLE public.apprenticeship_providers     ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES public.organisations(id) ON DELETE SET NULL;
ALTER TABLE public.apprenticeship_opportunities ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES public.organisations(id) ON DELETE SET NULL;
ALTER TABLE public.apprentices             ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES public.organisations(id) ON DELETE SET NULL;
ALTER TABLE public.mentors                 ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES public.organisations(id) ON DELETE SET NULL;
ALTER TABLE public.mentorship_requests     ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES public.organisations(id) ON DELETE SET NULL;
ALTER TABLE public.placements              ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES public.organisations(id) ON DELETE SET NULL;
ALTER TABLE public.youth_profiles          ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES public.organisations(id) ON DELETE SET NULL;
ALTER TABLE public.youth_opportunities     ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES public.organisations(id) ON DELETE SET NULL;
ALTER TABLE public.youth_applications      ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES public.organisations(id) ON DELETE SET NULL;
ALTER TABLE public.contact_requests        ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES public.organisations(id) ON DELETE SET NULL;
ALTER TABLE public.donations               ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES public.organisations(id) ON DELETE SET NULL;

-- 5. Helpful indexes
CREATE INDEX IF NOT EXISTS idx_service_providers_org       ON public.service_providers(organisation_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_org        ON public.service_requests(organisation_id);
CREATE INDEX IF NOT EXISTS idx_app_providers_org           ON public.apprenticeship_providers(organisation_id);
CREATE INDEX IF NOT EXISTS idx_app_opportunities_org       ON public.apprenticeship_opportunities(organisation_id);
CREATE INDEX IF NOT EXISTS idx_apprentices_org             ON public.apprentices(organisation_id);
CREATE INDEX IF NOT EXISTS idx_mentors_org                 ON public.mentors(organisation_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_org     ON public.mentorship_requests(organisation_id);
CREATE INDEX IF NOT EXISTS idx_placements_org              ON public.placements(organisation_id);
CREATE INDEX IF NOT EXISTS idx_youth_profiles_org          ON public.youth_profiles(organisation_id);
CREATE INDEX IF NOT EXISTS idx_youth_opportunities_org     ON public.youth_opportunities(organisation_id);
CREATE INDEX IF NOT EXISTS idx_youth_applications_org      ON public.youth_applications(organisation_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_org        ON public.contact_requests(organisation_id);
CREATE INDEX IF NOT EXISTS idx_donations_org               ON public.donations(organisation_id);
