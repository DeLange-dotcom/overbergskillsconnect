
ALTER TABLE public.noticeboard_contact_requests
  ADD COLUMN IF NOT EXISTS consent_given_at timestamptz,
  ADD COLUMN IF NOT EXISTS revoked_at timestamptz;

ALTER TABLE public.noticeboard_contact_requests
  DROP CONSTRAINT IF EXISTS noticeboard_contact_requests_status_check;
ALTER TABLE public.noticeboard_contact_requests
  ADD CONSTRAINT noticeboard_contact_requests_status_check
  CHECK (status = ANY (ARRAY['pending','approved','declined','revoked']));

DROP FUNCTION IF EXISTS public.noticeboard_create_contact_request(uuid, text, text, text);
DROP FUNCTION IF EXISTS public.noticeboard_my_requests();
DROP FUNCTION IF EXISTS public.noticeboard_view_request(uuid);
DROP FUNCTION IF EXISTS public.noticeboard_my_incoming_requests();

CREATE OR REPLACE FUNCTION public.noticeboard_create_contact_request(
  _profile_id uuid, _requester_name text, _requester_contact text,
  _message text, _consent boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_id uuid; v_recent int;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF _consent IS NOT TRUE THEN RAISE EXCEPTION 'consent_required'; END IF;

  SELECT count(*) INTO v_recent
    FROM public.noticeboard_contact_requests
   WHERE requester_user_id = auth.uid()
     AND created_at > now() - interval '24 hours';
  IF v_recent >= 5 THEN
    RAISE EXCEPTION 'rate_limited: you can send at most 5 contact requests per 24 hours';
  END IF;

  INSERT INTO public.noticeboard_contact_requests
    (profile_id, requester_name, requester_contact, message,
     requester_user_id, consent_given_at)
  VALUES (_profile_id, _requester_name, _requester_contact,
          NULLIF(_message,''), auth.uid(), now())
  RETURNING id INTO v_id;
  RETURN v_id;
END $function$;

CREATE FUNCTION public.noticeboard_my_requests()
RETURNS TABLE(
  id uuid, profile_id uuid, worker_name text, worker_skills text[],
  status text, phone text, created_at timestamptz, decided_at timestamptz,
  expires_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT r.id, p.id, p.name, p.skills, r.status,
         CASE WHEN r.status = 'approved' AND r.decided_at IS NOT NULL
                AND r.decided_at > now() - interval '30 days'
              THEN p.phone ELSE NULL END,
         r.created_at, r.decided_at,
         CASE WHEN r.status = 'approved' AND r.decided_at IS NOT NULL
              THEN r.decided_at + interval '30 days' END
  FROM public.noticeboard_contact_requests r
  JOIN public.noticeboard_profiles p ON p.id = r.profile_id
  WHERE r.requester_user_id = auth.uid()
  ORDER BY r.created_at DESC;
$function$;

CREATE FUNCTION public.noticeboard_view_request(_requester_token uuid)
RETURNS TABLE(
  status text, profile_name text, profile_town text,
  phone text, created_at timestamptz, decided_at timestamptz
)
LANGUAGE sql SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT r.status, p.name, p.town,
         CASE WHEN r.status = 'approved' AND r.decided_at IS NOT NULL
                AND r.decided_at > now() - interval '30 days'
              THEN p.phone ELSE NULL END,
         r.created_at, r.decided_at
  FROM public.noticeboard_contact_requests r
  JOIN public.noticeboard_profiles p ON p.id = r.profile_id
  WHERE r.requester_token = _requester_token;
$function$;

CREATE OR REPLACE FUNCTION public.noticeboard_my_revoke(_request_id uuid)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  UPDATE public.noticeboard_contact_requests r
     SET status = 'revoked', revoked_at = now()
   WHERE r.id = _request_id
     AND r.status = 'approved'
     AND EXISTS (
       SELECT 1 FROM public.noticeboard_profiles p
        WHERE p.id = r.profile_id AND p.user_id = auth.uid()
     );
  IF NOT FOUND THEN RAISE EXCEPTION 'request_not_found_or_not_approved'; END IF;
  RETURN 'revoked';
END $function$;

CREATE FUNCTION public.noticeboard_my_incoming_requests()
RETURNS TABLE(
  id uuid, requester_name text, requester_contact text, message text,
  status text, created_at timestamptz, decided_at timestamptz,
  revoked_at timestamptz, expires_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT r.id, r.requester_name, r.requester_contact, r.message,
         r.status, r.created_at, r.decided_at, r.revoked_at,
         CASE WHEN r.status = 'approved' AND r.decided_at IS NOT NULL
              THEN r.decided_at + interval '30 days' END
  FROM public.noticeboard_contact_requests r
  JOIN public.noticeboard_profiles p ON p.id = r.profile_id
  WHERE p.user_id = auth.uid()
  ORDER BY r.created_at DESC;
$function$;
