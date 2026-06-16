
-- Terms acceptance log
CREATE TABLE public.terms_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  context text NOT NULL CHECK (context IN ('provider_registration','service_request','contact_request','general')),
  reference_table text,
  reference_id uuid,
  acceptance_text text NOT NULL,
  terms_version text NOT NULL,
  ip_address text,
  user_agent text,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.terms_acceptances TO authenticated;
GRANT INSERT ON public.terms_acceptances TO anon;
GRANT ALL ON public.terms_acceptances TO service_role;

ALTER TABLE public.terms_acceptances ENABLE ROW LEVEL SECURITY;

-- Anyone (incl. anon) may insert their own acceptance record
CREATE POLICY "Anyone can record terms acceptance"
  ON public.terms_acceptances FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read acceptance records
CREATE POLICY "Admins can view all terms acceptances"
  ON public.terms_acceptances FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_terms_acceptances_ref ON public.terms_acceptances(reference_table, reference_id);
CREATE INDEX idx_terms_acceptances_user ON public.terms_acceptances(user_id);

-- Add columns to existing tables to mark acceptance inline (denormalised for fast queries)
ALTER TABLE public.service_providers
  ADD COLUMN terms_accepted_at timestamptz,
  ADD COLUMN terms_version_accepted text;

ALTER TABLE public.service_requests
  ADD COLUMN terms_accepted_at timestamptz,
  ADD COLUMN terms_version_accepted text;

ALTER TABLE public.contact_requests
  ADD COLUMN terms_accepted_at timestamptz,
  ADD COLUMN terms_version_accepted text;
