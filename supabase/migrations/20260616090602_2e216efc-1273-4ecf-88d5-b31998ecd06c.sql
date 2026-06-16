
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TYPE public.provider_status AS ENUM (
  'pending_review','awaiting_documents','id_checked','references_checked',
  'permit_checked','police_check_requested','vetting_result_received',
  'approved','rejected','suspended'
);

CREATE TYPE public.service_category AS ENUM (
  'elderly_care','childcare','domestic_work','gardening','farm_work',
  'cleaning','cooking','handyman','painting','construction','security',
  'admin','tutoring','computer_skills','hospitality','driving','other'
);

CREATE TYPE public.availability_type AS ENUM ('full_time','part_time','casual','temporary');
CREATE TYPE public.travel_distance AS ENUM ('own_town','within_20km','within_50km','overberg_wide');
CREATE TYPE public.request_status AS ENUM ('new','in_review','matched','contacted','completed','closed');
CREATE TYPE public.donation_frequency AS ENUM ('once_off','monthly');
CREATE TYPE public.donation_purpose AS ENUM ('general','sponsor_vetting');
CREATE TYPE public.payment_status AS ENUM ('pending','succeeded','failed','refunded');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_code TEXT NOT NULL UNIQUE DEFAULT ('HIN-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  full_name TEXT NOT NULL,
  display_name TEXT,
  id_passport_number TEXT NOT NULL,
  nationality TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  mobile_number TEXT NOT NULL,
  whatsapp_number TEXT,
  email TEXT,
  physical_address TEXT NOT NULL,
  town TEXT NOT NULL,
  services public.service_category[] NOT NULL DEFAULT '{}',
  skills_summary TEXT NOT NULL,
  years_experience INT,
  previous_employer TEXT,
  available_immediately BOOLEAN NOT NULL DEFAULT false,
  looking_for public.availability_type[] NOT NULL DEFAULT '{}',
  days_available TEXT[] NOT NULL DEFAULT '{}',
  typical_hours TEXT[] NOT NULL DEFAULT '{}',
  max_travel public.travel_distance NOT NULL DEFAULT 'own_town',
  own_transport BOOLEAN NOT NULL DEFAULT false,
  drivers_licence BOOLEAN NOT NULL DEFAULT false,
  criminal_conviction BOOLEAN NOT NULL DEFAULT false,
  criminal_conviction_details TEXT,
  consent_store_info BOOLEAN NOT NULL DEFAULT false,
  consent_reference_checks BOOLEAN NOT NULL DEFAULT false,
  consent_background_checks BOOLEAN NOT NULL DEFAULT false,
  consent_share_authorities BOOLEAN NOT NULL DEFAULT false,
  consent_no_guarantee BOOLEAN NOT NULL DEFAULT false,
  status public.provider_status NOT NULL DEFAULT 'pending_review',
  admin_notes TEXT,
  rejection_reason TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_providers TO authenticated;
GRANT INSERT ON public.service_providers TO anon;
GRANT ALL ON public.service_providers TO service_role;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit an application" ON public.service_providers
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can read all providers" ON public.service_providers
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update providers" ON public.service_providers
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete providers" ON public.service_providers
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can read their own application" ON public.service_providers
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trg_providers_updated BEFORE UPDATE ON public.service_providers
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE INDEX idx_providers_status ON public.service_providers(status);
CREATE INDEX idx_providers_town ON public.service_providers(town);

CREATE TABLE public.provider_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_name TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.provider_documents TO authenticated;
GRANT INSERT ON public.provider_documents TO anon;
GRANT ALL ON public.provider_documents TO service_role;
ALTER TABLE public.provider_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can attach documents at apply time" ON public.provider_documents
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can read all documents" ON public.provider_documents
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage documents" ON public.provider_documents
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.provider_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  reference_name TEXT NOT NULL,
  reference_contact TEXT NOT NULL,
  relationship TEXT,
  checked BOOLEAN NOT NULL DEFAULT false,
  check_notes TEXT,
  checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.provider_references TO authenticated;
GRANT INSERT ON public.provider_references TO anon;
GRANT ALL ON public.provider_references TO service_role;
ALTER TABLE public.provider_references ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can add references at apply time" ON public.provider_references
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins manage references" ON public.provider_references
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.provider_vetting_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  check_type TEXT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT,
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.provider_vetting_checks TO authenticated;
GRANT ALL ON public.provider_vetting_checks TO service_role;
ALTER TABLE public.provider_vetting_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage vetting checks" ON public.provider_vetting_checks
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email TEXT,
  location TEXT NOT NULL,
  service_needed public.service_category NOT NULL,
  urgency TEXT,
  arrangement public.availability_type,
  preferred_days TEXT[] NOT NULL DEFAULT '{}',
  preferred_times TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  consent_contact BOOLEAN NOT NULL DEFAULT false,
  status public.request_status NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_requests TO authenticated;
GRANT INSERT ON public.service_requests TO anon;
GRANT ALL ON public.service_requests TO service_role;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a request" ON public.service_requests
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins manage requests" ON public.service_requests
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_requests_updated BEFORE UPDATE ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  requester_contact TEXT NOT NULL,
  requester_email TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_requests TO authenticated;
GRANT ALL ON public.contact_requests TO service_role;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit contact request" ON public.contact_requests
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins manage contact requests" ON public.contact_requests
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name TEXT,
  email TEXT,
  phone TEXT,
  amount_cents INT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ZAR',
  frequency public.donation_frequency NOT NULL DEFAULT 'once_off',
  anonymous BOOLEAN NOT NULL DEFAULT false,
  purpose public.donation_purpose NOT NULL DEFAULT 'general',
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  payment_provider TEXT,
  payment_reference TEXT,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.donations TO anon, authenticated;
GRANT SELECT, UPDATE ON public.donations TO authenticated;
GRANT ALL ON public.donations TO service_role;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can record an intent to donate" ON public.donations
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read donations" ON public.donations
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update donations" ON public.donations
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE VIEW public.supporter_wall AS
SELECT
  CASE WHEN anonymous THEN 'Anonymous Supporter' ELSE COALESCE(donor_name, 'Community Supporter') END AS name,
  amount_cents, purpose, created_at
FROM public.donations
WHERE payment_status = 'succeeded';
GRANT SELECT ON public.supporter_wall TO anon, authenticated;

CREATE OR REPLACE VIEW public.approved_providers_public AS
SELECT
  id,
  COALESCE(display_name, split_part(full_name, ' ', 1)) AS display_name,
  town, services, skills_summary, days_available, typical_hours,
  max_travel, own_transport, drivers_licence, available_immediately
FROM public.service_providers
WHERE status = 'approved';
GRANT SELECT ON public.approved_providers_public TO anon, authenticated;

CREATE OR REPLACE VIEW public.impact_stats AS
SELECT
  (SELECT COUNT(*) FROM public.service_providers) AS registered,
  (SELECT COUNT(*) FROM public.service_providers WHERE status = 'approved') AS approved,
  (SELECT COUNT(*) FROM public.service_requests) AS requests,
  (SELECT COUNT(*) FROM public.service_requests WHERE status IN ('matched','contacted','completed')) AS matches,
  (SELECT COUNT(*) FROM public.donations WHERE payment_status = 'succeeded' AND purpose = 'sponsor_vetting') AS sponsored_checks;
GRANT SELECT ON public.impact_stats TO anon, authenticated;

CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read audit" ON public.audit_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert audit" ON public.audit_log
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.vetting_pdf_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  generated_by UUID REFERENCES auth.users(id),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  shared_with TEXT,
  shared_date TIMESTAMPTZ,
  vetting_result_received BOOLEAN NOT NULL DEFAULT false,
  result_date TIMESTAMPTZ,
  notes TEXT
);
GRANT SELECT, INSERT, UPDATE ON public.vetting_pdf_exports TO authenticated;
GRANT ALL ON public.vetting_pdf_exports TO service_role;
ALTER TABLE public.vetting_pdf_exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read pdf exports" ON public.vetting_pdf_exports
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins write pdf exports" ON public.vetting_pdf_exports
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update pdf exports" ON public.vetting_pdf_exports
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Storage policies (bucket created via tool)
CREATE POLICY "Anyone can upload provider docs" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'provider-documents');
CREATE POLICY "Admins read provider docs" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'provider-documents' AND public.has_role(auth.uid(), 'admin'));
