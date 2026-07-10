
-- ============ user_profiles ============
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  town text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own profile"
  ON public.user_profiles FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view all profiles"
  ON public.user_profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_user_profiles_updated
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ notifications ============
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  related_id uuid,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON public.notifications(user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view all notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ Helpers ============
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS TABLE(user_id uuid, email text, full_name text, town text, phone text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    u.id,
    u.email::text,
    COALESCE(p.full_name, u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
    p.town,
    p.phone
  FROM auth.users u
  LEFT JOIN public.user_profiles p ON p.user_id = u.id
  WHERE u.id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.upsert_my_profile(
  _full_name text, _town text, _phone text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  INSERT INTO public.user_profiles(user_id, full_name, town, phone)
  VALUES (auth.uid(), NULLIF(_full_name,''), NULLIF(_town,''), NULLIF(_phone,''))
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    town = EXCLUDED.town,
    phone = EXCLUDED.phone,
    updated_at = now();
END $$;

CREATE OR REPLACE FUNCTION public.notifications_unread_count()
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(count(*)::int, 0) FROM public.notifications
  WHERE user_id = auth.uid() AND read_at IS NULL;
$$;

CREATE OR REPLACE FUNCTION public.notifications_mark_all_read()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  UPDATE public.notifications SET read_at = now()
  WHERE user_id = auth.uid() AND read_at IS NULL;
$$;

-- ============ Notification triggers on contact requests ============
CREATE OR REPLACE FUNCTION public.tg_notify_provider_new_interest()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_owner uuid; v_name text;
BEGIN
  SELECT user_id, name INTO v_owner, v_name
    FROM public.noticeboard_profiles WHERE id = NEW.profile_id;
  IF v_owner IS NOT NULL THEN
    INSERT INTO public.notifications(user_id, type, title, body, link, related_id)
    VALUES (v_owner, 'interest_received',
      'New person interested in your services',
      COALESCE(split_part(NEW.requester_name,' ',1),'Someone') || ' would like your contact details.',
      '/profile', NEW.id);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_provider_new_interest ON public.noticeboard_contact_requests;
CREATE TRIGGER trg_notify_provider_new_interest
  AFTER INSERT ON public.noticeboard_contact_requests
  FOR EACH ROW EXECUTE FUNCTION public.tg_notify_provider_new_interest();

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
      '/profile/service-requests', NEW.id);
  ELSIF NEW.status = 'declined' THEN
    INSERT INTO public.notifications(user_id, type, title, body, link, related_id)
    VALUES (NEW.requester_user_id, 'request_declined',
      'Your service request was declined',
      COALESCE(v_provider,'The service provider') || ' is not available for this request.',
      '/profile/service-requests', NEW.id);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_requester_decision ON public.noticeboard_contact_requests;
CREATE TRIGGER trg_notify_requester_decision
  AFTER UPDATE OF status ON public.noticeboard_contact_requests
  FOR EACH ROW EXECUTE FUNCTION public.tg_notify_requester_decision();

-- ============ Back-fill notifications for historical requests ============
INSERT INTO public.notifications(user_id, type, title, body, link, related_id, created_at)
SELECT p.user_id, 'interest_received',
       'New person interested in your services',
       COALESCE(split_part(r.requester_name,' ',1),'Someone') || ' would like your contact details.',
       '/profile', r.id, r.created_at
FROM public.noticeboard_contact_requests r
JOIN public.noticeboard_profiles p ON p.id = r.profile_id
WHERE p.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.notifications n
    WHERE n.related_id = r.id AND n.type = 'interest_received'
  );

INSERT INTO public.notifications(user_id, type, title, body, link, related_id, created_at)
SELECT r.requester_user_id, 'request_accepted',
       'Your service request was accepted',
       COALESCE(p.name,'The service provider') || ' has shared their contact details with you.',
       '/profile/service-requests', r.id, COALESCE(r.decided_at, r.created_at)
FROM public.noticeboard_contact_requests r
JOIN public.noticeboard_profiles p ON p.id = r.profile_id
WHERE r.status = 'approved' AND r.requester_user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.notifications n
    WHERE n.related_id = r.id AND n.type = 'request_accepted'
  );

INSERT INTO public.notifications(user_id, type, title, body, link, related_id, created_at)
SELECT r.requester_user_id, 'request_declined',
       'Your service request was declined',
       COALESCE(p.name,'The service provider') || ' is not available for this request.',
       '/profile/service-requests', r.id, COALESCE(r.decided_at, r.created_at)
FROM public.noticeboard_contact_requests r
JOIN public.noticeboard_profiles p ON p.id = r.profile_id
WHERE r.status = 'declined' AND r.requester_user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.notifications n
    WHERE n.related_id = r.id AND n.type = 'request_declined'
  );
