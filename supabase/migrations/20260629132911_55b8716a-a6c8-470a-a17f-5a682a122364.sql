
ALTER TABLE public.noticeboard_contact_requests
  ADD COLUMN IF NOT EXISTS requester_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS noticeboard_contact_requests_requester_user_id_idx
  ON public.noticeboard_contact_requests(requester_user_id);

-- Allow signed-in requesters to read their own requests
DROP POLICY IF EXISTS "Requesters read own contact requests" ON public.noticeboard_contact_requests;
CREATE POLICY "Requesters read own contact requests"
  ON public.noticeboard_contact_requests FOR SELECT
  TO authenticated
  USING (requester_user_id = auth.uid());

-- List my outgoing requests
CREATE OR REPLACE FUNCTION public.noticeboard_my_requests()
RETURNS TABLE(
  id uuid,
  profile_id uuid,
  worker_name text,
  worker_skills text[],
  status text,
  phone text,
  created_at timestamptz,
  decided_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id, p.id, p.name, p.skills, r.status,
         CASE WHEN r.status='approved' THEN p.phone ELSE NULL END,
         r.created_at, r.decided_at
  FROM public.noticeboard_contact_requests r
  JOIN public.noticeboard_profiles p ON p.id = r.profile_id
  WHERE r.requester_user_id = auth.uid()
  ORDER BY r.created_at DESC;
$$;

-- List incoming requests for my listing
CREATE OR REPLACE FUNCTION public.noticeboard_my_incoming_requests()
RETURNS TABLE(
  id uuid,
  requester_name text,
  requester_contact text,
  message text,
  status text,
  created_at timestamptz,
  decided_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id, r.requester_name, r.requester_contact, r.message,
         r.status, r.created_at, r.decided_at
  FROM public.noticeboard_contact_requests r
  JOIN public.noticeboard_profiles p ON p.id = r.profile_id
  WHERE p.user_id = auth.uid()
  ORDER BY r.created_at DESC;
$$;

-- Decide as logged in owner
CREATE OR REPLACE FUNCTION public.noticeboard_my_decide(_request_id uuid, _decision text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF _decision NOT IN ('approved','declined') THEN RAISE EXCEPTION 'invalid_decision'; END IF;
  UPDATE public.noticeboard_contact_requests r
     SET status = _decision, decided_at = now()
   WHERE r.id = _request_id
     AND r.status = 'pending'
     AND EXISTS (
       SELECT 1 FROM public.noticeboard_profiles p
        WHERE p.id = r.profile_id AND p.user_id = auth.uid()
     );
  IF NOT FOUND THEN RAISE EXCEPTION 'request_not_found_or_not_pending'; END IF;
  RETURN _decision;
END $$;

-- Create a contact request as logged-in user
CREATE OR REPLACE FUNCTION public.noticeboard_create_contact_request(
  _profile_id uuid,
  _requester_name text,
  _requester_contact text,
  _message text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  INSERT INTO public.noticeboard_contact_requests
    (profile_id, requester_name, requester_contact, message, requester_user_id)
  VALUES (_profile_id, _requester_name, _requester_contact, NULLIF(_message,''), auth.uid())
  RETURNING id INTO v_id;
  RETURN v_id;
END $$;
