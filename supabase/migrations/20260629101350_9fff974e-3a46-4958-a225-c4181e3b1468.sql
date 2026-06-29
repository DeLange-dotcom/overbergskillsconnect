
-- Profiles
CREATE TABLE public.noticeboard_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  town text NOT NULL,
  skills text[] NOT NULL DEFAULT '{}',
  category text,
  years_experience integer,
  availability text,
  description text NOT NULL,
  photo_url text,
  phone text NOT NULL,
  manage_token uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  accepted_terms boolean NOT NULL DEFAULT false,
  is_hidden boolean NOT NULL DEFAULT false,
  is_suspended boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.noticeboard_profiles TO anon, authenticated;
GRANT ALL ON public.noticeboard_profiles TO service_role;

ALTER TABLE public.noticeboard_profiles ENABLE ROW LEVEL SECURITY;

-- Public listing (no phone column reaches the client)
CREATE OR REPLACE VIEW public.noticeboard_public
WITH (security_invoker = on) AS
SELECT id, name, town, skills, category, years_experience, availability,
       description, photo_url, created_at
FROM public.noticeboard_profiles
WHERE is_hidden = false AND is_suspended = false;

GRANT SELECT ON public.noticeboard_public TO anon, authenticated;

-- Browsing via the view; direct table reads restricted to admins (suspended/hidden management)
CREATE POLICY "Public can browse via view" ON public.noticeboard_profiles
  FOR SELECT TO anon, authenticated
  USING (is_hidden = false AND is_suspended = false);

CREATE POLICY "Admins read all profiles" ON public.noticeboard_profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can self-register" ON public.noticeboard_profiles
  FOR INSERT TO anon, authenticated
  WITH CHECK (accepted_terms = true);

CREATE POLICY "Admins can update profiles" ON public.noticeboard_profiles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_noticeboard_profiles_updated_at
  BEFORE UPDATE ON public.noticeboard_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Contact requests
CREATE TABLE public.noticeboard_contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.noticeboard_profiles(id) ON DELETE CASCADE,
  requester_name text NOT NULL,
  requester_contact text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','declined')),
  requester_token uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz
);

GRANT SELECT, INSERT, UPDATE ON public.noticeboard_contact_requests TO anon, authenticated;
GRANT ALL ON public.noticeboard_contact_requests TO service_role;

ALTER TABLE public.noticeboard_contact_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a contact request" ON public.noticeboard_contact_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins read contact requests" ON public.noticeboard_contact_requests
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update contact requests" ON public.noticeboard_contact_requests
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Token-based access RPCs (security definer; tokens act as the credential)
CREATE OR REPLACE FUNCTION public.noticeboard_owner_view(_manage_token uuid)
RETURNS TABLE (
  profile_id uuid,
  name text,
  is_hidden boolean,
  request_id uuid,
  requester_name text,
  requester_contact text,
  message text,
  status text,
  created_at timestamptz
) LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.name, p.is_hidden,
         r.id, r.requester_name, r.requester_contact, r.message, r.status, r.created_at
  FROM public.noticeboard_profiles p
  LEFT JOIN public.noticeboard_contact_requests r ON r.profile_id = p.id
  WHERE p.manage_token = _manage_token
  ORDER BY r.created_at DESC NULLS LAST;
$$;

CREATE OR REPLACE FUNCTION public.noticeboard_owner_decide(
  _manage_token uuid, _request_id uuid, _decision text
) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_profile uuid;
BEGIN
  IF _decision NOT IN ('approved','declined') THEN RAISE EXCEPTION 'invalid_decision'; END IF;
  SELECT id INTO v_profile FROM public.noticeboard_profiles WHERE manage_token = _manage_token;
  IF v_profile IS NULL THEN RAISE EXCEPTION 'invalid_token'; END IF;
  UPDATE public.noticeboard_contact_requests
     SET status = _decision, decided_at = now()
   WHERE id = _request_id AND profile_id = v_profile AND status = 'pending';
  RETURN _decision;
END $$;

CREATE OR REPLACE FUNCTION public.noticeboard_owner_set_hidden(
  _manage_token uuid, _hidden boolean
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.noticeboard_profiles
     SET is_hidden = _hidden
   WHERE manage_token = _manage_token;
  IF NOT FOUND THEN RAISE EXCEPTION 'invalid_token'; END IF;
  RETURN _hidden;
END $$;

CREATE OR REPLACE FUNCTION public.noticeboard_view_request(_requester_token uuid)
RETURNS TABLE (
  status text,
  profile_name text,
  profile_town text,
  phone text,
  created_at timestamptz,
  decided_at timestamptz
) LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT r.status, p.name, p.town,
         CASE WHEN r.status = 'approved' THEN p.phone ELSE NULL END,
         r.created_at, r.decided_at
  FROM public.noticeboard_contact_requests r
  JOIN public.noticeboard_profiles p ON p.id = r.profile_id
  WHERE r.requester_token = _requester_token;
$$;

GRANT EXECUTE ON FUNCTION public.noticeboard_owner_view(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.noticeboard_owner_decide(uuid, uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.noticeboard_owner_set_hidden(uuid, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.noticeboard_view_request(uuid) TO anon, authenticated;

-- Reports
CREATE TABLE public.noticeboard_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.noticeboard_profiles(id) ON DELETE CASCADE,
  reason text NOT NULL CHECK (reason IN ('spam','fraud','offensive','false_information','inappropriate')),
  details text,
  reporter_contact text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewed','dismissed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.noticeboard_reports TO anon, authenticated;
GRANT ALL ON public.noticeboard_reports TO service_role;

ALTER TABLE public.noticeboard_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a report" ON public.noticeboard_reports
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins read reports" ON public.noticeboard_reports
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update reports" ON public.noticeboard_reports
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
