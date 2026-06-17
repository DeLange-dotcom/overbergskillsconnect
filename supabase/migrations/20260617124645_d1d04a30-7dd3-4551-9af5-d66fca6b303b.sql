
-- contact_requests enhancements
ALTER TABLE public.contact_requests
  ADD COLUMN IF NOT EXISTS visitor_phone text,
  ADD COLUMN IF NOT EXISTS reason text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS applicant_type text NOT NULL DEFAULT 'service_provider',
  ADD COLUMN IF NOT EXISTS applicant_id uuid,
  ADD COLUMN IF NOT EXISTS disclaimer_accepted_at timestamptz;

-- Backfill applicant_id from existing column
UPDATE public.contact_requests
   SET applicant_id = service_provider_id
 WHERE applicant_id IS NULL AND service_provider_id IS NOT NULL;

-- service_provider_id stays as legacy FK; allow public insertion (anon) for new contact requests
DROP POLICY IF EXISTS "anyone_can_submit_contact_request" ON public.contact_requests;
CREATE POLICY "anyone_can_submit_contact_request" ON public.contact_requests
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ====== safety_reports ======
CREATE TABLE IF NOT EXISTS public.safety_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_type text NOT NULL,
  applicant_id uuid NOT NULL,
  complaint_type text NOT NULL,
  description text NOT NULL,
  reporter_name text,
  reporter_email text,
  reporter_phone text,
  resolution_status text NOT NULL DEFAULT 'open',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.safety_reports TO authenticated;
GRANT INSERT ON public.safety_reports TO anon;
GRANT ALL ON public.safety_reports TO service_role;

ALTER TABLE public.safety_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_can_submit_safety_report" ON public.safety_reports
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins_manage_safety_reports" ON public.safety_reports
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER tg_safety_reports_updated_at
  BEFORE UPDATE ON public.safety_reports
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ====== feedback_requests ======
CREATE TABLE IF NOT EXISTS public.feedback_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_request_id uuid NOT NULL REFERENCES public.contact_requests(id) ON DELETE CASCADE,
  applicant_type text NOT NULL,
  applicant_id uuid NOT NULL,
  visitor_email text NOT NULL,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  scheduled_for timestamptz NOT NULL,
  sent_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.feedback_requests TO anon, authenticated;
GRANT ALL ON public.feedback_requests TO service_role;
ALTER TABLE public.feedback_requests ENABLE ROW LEVEL SECURITY;
-- Allow token-based lookup only via narrow function below; deny default reads
CREATE POLICY "admins_manage_feedback_requests" ON public.feedback_requests
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ====== feedback_responses ======
CREATE TABLE IF NOT EXISTS public.feedback_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_request_id uuid NOT NULL UNIQUE REFERENCES public.feedback_requests(id) ON DELETE CASCADE,
  applicant_type text NOT NULL,
  applicant_id uuid NOT NULL,
  engaged text NOT NULL CHECK (engaged IN ('yes','no','prefer_not')),
  reliability smallint CHECK (reliability BETWEEN 1 AND 5),
  communication smallint CHECK (communication BETWEEN 1 AND 5),
  punctuality smallint CHECK (punctuality BETWEEN 1 AND 5),
  would_recommend boolean,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.feedback_responses TO anon, authenticated;
GRANT INSERT ON public.feedback_responses TO anon, authenticated;
GRANT ALL ON public.feedback_responses TO service_role;
ALTER TABLE public.feedback_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_can_read_feedback" ON public.feedback_responses
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins_manage_feedback" ON public.feedback_responses
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
-- Inserts validated through a SECURITY DEFINER RPC below
CREATE POLICY "anon_no_direct_insert" ON public.feedback_responses
  FOR INSERT TO anon, authenticated WITH CHECK (false);

-- RPC: submit feedback by token
CREATE OR REPLACE FUNCTION public.submit_feedback(
  _token text,
  _engaged text,
  _reliability int,
  _communication int,
  _punctuality int,
  _would_recommend boolean,
  _comment text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  fr public.feedback_requests%ROWTYPE;
  new_id uuid;
BEGIN
  SELECT * INTO fr FROM public.feedback_requests WHERE token = _token;
  IF NOT FOUND THEN RAISE EXCEPTION 'invalid_token'; END IF;
  IF fr.completed_at IS NOT NULL THEN RAISE EXCEPTION 'already_submitted'; END IF;

  INSERT INTO public.feedback_responses
    (feedback_request_id, applicant_type, applicant_id, engaged,
     reliability, communication, punctuality, would_recommend, comment)
  VALUES
    (fr.id, fr.applicant_type, fr.applicant_id, _engaged,
     CASE WHEN _engaged = 'yes' THEN _reliability END,
     CASE WHEN _engaged = 'yes' THEN _communication END,
     CASE WHEN _engaged = 'yes' THEN _punctuality END,
     CASE WHEN _engaged = 'yes' THEN _would_recommend END,
     _comment)
  RETURNING id INTO new_id;

  UPDATE public.feedback_requests SET completed_at = now() WHERE id = fr.id;
  RETURN new_id;
END; $$;

GRANT EXECUTE ON FUNCTION public.submit_feedback(text, text, int, int, int, boolean, text) TO anon, authenticated;

-- RPC: lookup feedback request by token (anon safe — returns minimal info)
CREATE OR REPLACE FUNCTION public.lookup_feedback_request(_token text)
RETURNS TABLE (
  id uuid, applicant_type text, applicant_id uuid,
  completed_at timestamptz, applicant_name text
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT fr.id, fr.applicant_type, fr.applicant_id, fr.completed_at,
    CASE fr.applicant_type
      WHEN 'service_provider' THEN (SELECT split_part(coalesce(display_name, full_name),' ',1) FROM service_providers WHERE service_providers.id = fr.applicant_id)
      WHEN 'apprentice' THEN (SELECT split_part(full_name,' ',1) FROM apprentices WHERE apprentices.id = fr.applicant_id)
      WHEN 'youth' THEN (SELECT split_part(full_name,' ',1) FROM youth_profiles WHERE youth_profiles.id = fr.applicant_id)
    END
  FROM public.feedback_requests fr WHERE fr.token = _token;
END; $$;
GRANT EXECUTE ON FUNCTION public.lookup_feedback_request(text) TO anon, authenticated;

-- View: per-applicant rating aggregates
CREATE OR REPLACE VIEW public.applicant_reputation
WITH (security_invoker = true) AS
SELECT
  applicant_type, applicant_id,
  count(*) FILTER (WHERE engaged = 'yes') AS review_count,
  round(avg(((coalesce(reliability,0)+coalesce(communication,0)+coalesce(punctuality,0))::numeric / 3)) FILTER (WHERE engaged='yes'), 2) AS avg_rating,
  round(100.0 * count(*) FILTER (WHERE would_recommend = true) / NULLIF(count(*) FILTER (WHERE engaged='yes'),0), 0) AS recommend_pct
FROM public.feedback_responses
GROUP BY applicant_type, applicant_id;

GRANT SELECT ON public.applicant_reputation TO anon, authenticated;
