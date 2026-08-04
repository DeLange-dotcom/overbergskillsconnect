-- Pre-live hardening for the public noticeboard.
-- Keep the free/manual WhatsApp flow, but reduce anonymous write surfaces.

ALTER TABLE public.noticeboard_reports
  ADD COLUMN IF NOT EXISTS reporter_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid();

DROP POLICY IF EXISTS "Anyone can submit a contact request" ON public.noticeboard_contact_requests;
DROP POLICY IF EXISTS "Signed-in users can submit own contact requests" ON public.noticeboard_contact_requests;
CREATE POLICY "Signed-in users can submit own contact requests"
  ON public.noticeboard_contact_requests FOR INSERT
  TO authenticated
  WITH CHECK (requester_user_id = auth.uid());

DROP POLICY IF EXISTS "Anyone can submit a report" ON public.noticeboard_reports;
DROP POLICY IF EXISTS "Signed-in users can submit reports" ON public.noticeboard_reports;
CREATE POLICY "Signed-in users can submit reports"
  ON public.noticeboard_reports FOR INSERT
  TO authenticated
  WITH CHECK (reporter_user_id = auth.uid());

REVOKE SELECT, INSERT, UPDATE ON public.noticeboard_contact_requests FROM anon;
REVOKE SELECT, INSERT, UPDATE ON public.noticeboard_reports FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.noticeboard_contact_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.noticeboard_reports TO authenticated;

CREATE OR REPLACE FUNCTION public.tg_notify_requester_decision()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_provider text;
BEGIN
  IF NEW.status = OLD.status OR NEW.requester_user_id IS NULL THEN RETURN NEW; END IF;
  SELECT name INTO v_provider FROM public.noticeboard_profiles WHERE id = NEW.profile_id;
  IF NEW.status = 'approved' THEN
    INSERT INTO public.notifications(user_id, type, title, body, link, related_id)
    VALUES (NEW.requester_user_id, 'request_accepted',
      'Your service request was accepted',
      COALESCE(v_provider,'The service provider') || ' has shared their contact details with you.',
      '/profile', NEW.id);
  ELSIF NEW.status = 'declined' THEN
    INSERT INTO public.notifications(user_id, type, title, body, link, related_id)
    VALUES (NEW.requester_user_id, 'request_declined',
      'Your service request was declined',
      COALESCE(v_provider,'The service provider') || ' is not available for this request.',
      '/profile', NEW.id);
  END IF;
  RETURN NEW;
END $$;

UPDATE public.notifications
SET link = '/profile'
WHERE link = '/profile/service-requests'
  AND type IN ('request_accepted', 'request_declined');

CREATE OR REPLACE FUNCTION public.noticeboard_privacy_cleanup()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contact_count integer := 0;
  v_report_count integer := 0;
BEGIN
  DELETE FROM public.noticeboard_contact_requests
  WHERE (
      status IN ('pending', 'declined')
      AND created_at < now() - interval '180 days'
    )
    OR (
      status = 'approved'
      AND COALESCE(decided_at, created_at) < now() - interval '180 days'
    );
  GET DIAGNOSTICS v_contact_count = ROW_COUNT;

  DELETE FROM public.noticeboard_reports
  WHERE status IN ('reviewed', 'dismissed')
    AND created_at < now() - interval '365 days';
  GET DIAGNOSTICS v_report_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'deleted_contact_requests', v_contact_count,
    'deleted_reports', v_report_count
  );
END $$;

REVOKE ALL ON FUNCTION public.noticeboard_privacy_cleanup() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.noticeboard_privacy_cleanup() TO service_role;
