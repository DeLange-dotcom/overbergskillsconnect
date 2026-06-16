
-- Enums
CREATE TYPE public.apprentice_status AS ENUM ('registered','reviewed','interview','matched','active','completed');
CREATE TYPE public.provider_app_status AS ENUM ('pending','approved','rejected');
CREATE TYPE public.opportunity_status AS ENUM ('open','reviewing','filled','closed');
CREATE TYPE public.mentor_status AS ENUM ('pending','approved','active','inactive');
CREATE TYPE public.application_status AS ENUM ('submitted','interview','placed','completed','declined');
CREATE TYPE public.mentor_match_status AS ENUM ('requested','approved','active','completed','declined');

-- 1. apprentices
CREATE TABLE public.apprentices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  dob DATE NOT NULL,
  contact_number TEXT,
  whatsapp_number TEXT,
  email TEXT,
  physical_address TEXT,
  town TEXT NOT NULL,
  transport_available BOOLEAN DEFAULT false,
  drivers_licence BOOLEAN DEFAULT false,
  highest_grade TEXT,
  further_education TEXT,
  qualifications TEXT,
  certificates TEXT,
  career_interests TEXT[] NOT NULL DEFAULT '{}',
  opportunity_types TEXT[] NOT NULL DEFAULT '{}',
  availability TEXT[] NOT NULL DEFAULT '{}',
  why_interested TEXT,
  skills_to_learn TEXT,
  cv_url TEXT,
  status public.apprentice_status NOT NULL DEFAULT 'registered',
  reference_code TEXT NOT NULL DEFAULT 'AP-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,6)),
  terms_accepted_at TIMESTAMPTZ,
  terms_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.apprentices TO authenticated;
GRANT INSERT ON public.apprentices TO anon;
GRANT ALL ON public.apprentices TO service_role;
ALTER TABLE public.apprentices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can register as apprentice" ON public.apprentices FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "owner reads own apprentice" ON public.apprentices FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins read all apprentices" ON public.apprentices FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update apprentices" ON public.apprentices FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER apprentices_updated BEFORE UPDATE ON public.apprentices FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 2. apprenticeship_providers
CREATE TABLE public.apprenticeship_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  provider_type TEXT NOT NULL,
  organisation_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT,
  physical_address TEXT,
  town TEXT NOT NULL,
  status public.provider_app_status NOT NULL DEFAULT 'pending',
  terms_accepted_at TIMESTAMPTZ,
  terms_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.apprenticeship_providers TO authenticated;
GRANT INSERT ON public.apprenticeship_providers TO anon;
GRANT ALL ON public.apprenticeship_providers TO service_role;
ALTER TABLE public.apprenticeship_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can register provider" ON public.apprenticeship_providers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "owner reads own provider" ON public.apprenticeship_providers FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins read providers" ON public.apprenticeship_providers FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update providers" ON public.apprenticeship_providers FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER providers_updated BEFORE UPDATE ON public.apprenticeship_providers FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 3. apprenticeship_opportunities
CREATE TABLE public.apprenticeship_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.apprenticeship_providers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  industry TEXT NOT NULL,
  skills_offered TEXT[] NOT NULL DEFAULT '{}',
  placements_available INT NOT NULL DEFAULT 1,
  paid BOOLEAN NOT NULL DEFAULT false,
  stipend_amount NUMERIC(10,2),
  duration TEXT,
  start_date DATE,
  min_age INT,
  preferred_qualifications TEXT,
  transport_requirements TEXT,
  safety_requirements TEXT,
  description TEXT,
  town TEXT,
  status public.opportunity_status NOT NULL DEFAULT 'open',
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.apprenticeship_opportunities TO authenticated;
GRANT INSERT ON public.apprenticeship_opportunities TO anon;
GRANT ALL ON public.apprenticeship_opportunities TO service_role;
ALTER TABLE public.apprenticeship_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit opportunity" ON public.apprenticeship_opportunities FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "provider owner reads opportunity" ON public.apprenticeship_opportunities FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.apprenticeship_providers p WHERE p.id = provider_id AND p.user_id = auth.uid())
);
CREATE POLICY "admins read opportunities" ON public.apprenticeship_opportunities FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update opportunities" ON public.apprenticeship_opportunities FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER opportunities_updated BEFORE UPDATE ON public.apprenticeship_opportunities FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- public view (safe columns, approved+open only)
CREATE VIEW public.apprenticeship_opportunities_public WITH (security_invoker = true) AS
SELECT id, title, industry, skills_offered, placements_available, paid, stipend_amount,
       duration, start_date, min_age, preferred_qualifications, transport_requirements,
       safety_requirements, description, town, status, created_at
FROM public.apprenticeship_opportunities
WHERE approved = true AND status IN ('open','reviewing');
GRANT SELECT ON public.apprenticeship_opportunities_public TO anon, authenticated;

-- 4. mentors
CREATE TABLE public.mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email TEXT NOT NULL,
  town TEXT,
  categories TEXT[] NOT NULL DEFAULT '{}',
  years_experience INT,
  professional_background TEXT,
  biography TEXT,
  availability TEXT,
  formats TEXT[] NOT NULL DEFAULT '{}',
  is_knowledge_keeper BOOLEAN NOT NULL DEFAULT false,
  knowledge_keeper_categories TEXT[] NOT NULL DEFAULT '{}',
  status public.mentor_status NOT NULL DEFAULT 'pending',
  approved BOOLEAN NOT NULL DEFAULT false,
  terms_accepted_at TIMESTAMPTZ,
  terms_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentors TO authenticated;
GRANT INSERT ON public.mentors TO anon;
GRANT ALL ON public.mentors TO service_role;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can register mentor" ON public.mentors FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "owner reads own mentor" ON public.mentors FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins read mentors" ON public.mentors FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update mentors" ON public.mentors FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER mentors_updated BEFORE UPDATE ON public.mentors FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- public view (safe columns, approved only, no contact info)
CREATE VIEW public.mentors_public WITH (security_invoker = true) AS
SELECT id, full_name, town, categories, years_experience, professional_background, biography,
       availability, formats, is_knowledge_keeper, knowledge_keeper_categories, created_at
FROM public.mentors
WHERE approved = true AND status IN ('approved','active');
GRANT SELECT ON public.mentors_public TO anon, authenticated;

-- 5. apprentice_applications
CREATE TABLE public.apprentice_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apprentice_id UUID NOT NULL REFERENCES public.apprentices(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.apprenticeship_opportunities(id) ON DELETE CASCADE,
  status public.application_status NOT NULL DEFAULT 'submitted',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.apprentice_applications TO authenticated;
GRANT ALL ON public.apprentice_applications TO service_role;
ALTER TABLE public.apprentice_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "apprentice reads own application" ON public.apprentice_applications FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.apprentices a WHERE a.id = apprentice_id AND a.user_id = auth.uid())
);
CREATE POLICY "admins manage applications" ON public.apprentice_applications FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER apprentice_apps_updated BEFORE UPDATE ON public.apprentice_applications FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 6. mentor_matches
CREATE TABLE public.mentor_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apprentice_id UUID REFERENCES public.apprentices(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  status public.mentor_match_status NOT NULL DEFAULT 'requested',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentor_matches TO authenticated;
GRANT ALL ON public.mentor_matches TO service_role;
ALTER TABLE public.mentor_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user reads own match" ON public.mentor_matches FOR SELECT TO authenticated USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.apprentices a WHERE a.id = apprentice_id AND a.user_id = auth.uid())
);
CREATE POLICY "admins manage matches" ON public.mentor_matches FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER mentor_matches_updated BEFORE UPDATE ON public.mentor_matches FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
