
DROP FUNCTION IF EXISTS public.noticeboard_my_listing();

ALTER TABLE public.noticeboard_profiles
  ADD COLUMN IF NOT EXISTS last_login_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_contact_request_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_activity_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS renewal_reminder_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS archive_notice_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS deletion_notice_sent_at timestamptz;

CREATE INDEX IF NOT EXISTS noticeboard_profiles_last_activity_idx
  ON public.noticeboard_profiles(last_activity_at);
CREATE INDEX IF NOT EXISTS noticeboard_profiles_is_archived_idx
  ON public.noticeboard_profiles(is_archived);

CREATE OR REPLACE FUNCTION public.tg_noticeboard_touch_activity()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF (TG_OP = 'INSERT') OR
     NEW.name IS DISTINCT FROM OLD.name OR
     NEW.town IS DISTINCT FROM OLD.town OR
     NEW.skills IS DISTINCT FROM OLD.skills OR
     NEW.category IS DISTINCT FROM OLD.category OR
     NEW.description IS DISTINCT FROM OLD.description OR
     NEW.phone IS DISTINCT FROM OLD.phone OR
     NEW.photo_url IS DISTINCT FROM OLD.photo_url OR
     NEW.availability IS DISTINCT FROM OLD.availability OR
     NEW.years_experience IS DISTINCT FROM OLD.years_experience OR
     NEW.is_hidden IS DISTINCT FROM OLD.is_hidden THEN
    NEW.last_activity_at := now();
    NEW.renewal_reminder_sent_at := NULL;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS noticeboard_touch_activity ON public.noticeboard_profiles;
CREATE TRIGGER noticeboard_touch_activity
  BEFORE UPDATE ON public.noticeboard_profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_noticeboard_touch_activity();

CREATE OR REPLACE FUNCTION public.tg_noticeboard_request_touch_owner()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  UPDATE public.noticeboard_profiles
     SET last_contact_request_at = now(), last_activity_at = now(),
         renewal_reminder_sent_at = NULL
   WHERE id = NEW.profile_id;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS noticeboard_request_touch_owner ON public.noticeboard_contact_requests;
CREATE TRIGGER noticeboard_request_touch_owner
  AFTER INSERT ON public.noticeboard_contact_requests
  FOR EACH ROW EXECUTE FUNCTION public.tg_noticeboard_request_touch_owner();

DROP VIEW IF EXISTS public.noticeboard_public;
CREATE VIEW public.noticeboard_public
WITH (security_invoker=on) AS
  SELECT id, public_listing_reference, name, town, skills, category,
         years_experience, availability, description, photo_url, created_at
  FROM public.noticeboard_profiles
  WHERE is_hidden = false AND is_suspended = false AND is_archived = false;
GRANT SELECT ON public.noticeboard_public TO anon, authenticated;

CREATE TABLE IF NOT EXISTS public.noticeboard_lifecycle_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.noticeboard_profiles(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL CHECK (event_type IN (
    'renewal_reminder','archive_notice','deletion_notice','auto_archived','auto_deleted'
  )),
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.noticeboard_lifecycle_events TO authenticated;
GRANT ALL ON public.noticeboard_lifecycle_events TO service_role;
ALTER TABLE public.noticeboard_lifecycle_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins read lifecycle events" ON public.noticeboard_lifecycle_events;
CREATE POLICY "Admins read lifecycle events"
  ON public.noticeboard_lifecycle_events FOR SELECT
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX IF NOT EXISTS noticeboard_lifecycle_events_profile_idx
  ON public.noticeboard_lifecycle_events(profile_id);
CREATE INDEX IF NOT EXISTS noticeboard_lifecycle_events_created_idx
  ON public.noticeboard_lifecycle_events(created_at DESC);

CREATE OR REPLACE FUNCTION public.noticeboard_my_archive()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  UPDATE public.noticeboard_profiles
     SET is_archived = true, archived_at = now(), updated_at = now()
   WHERE user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'listing_not_found'; END IF;
  RETURN true;
END $$;

CREATE OR REPLACE FUNCTION public.noticeboard_my_reactivate()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  UPDATE public.noticeboard_profiles
     SET is_archived = false, archived_at = NULL,
         last_activity_at = now(), renewal_reminder_sent_at = NULL,
         archive_notice_sent_at = NULL, deletion_notice_sent_at = NULL,
         updated_at = now()
   WHERE user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'listing_not_found'; END IF;
  RETURN true;
END $$;

CREATE OR REPLACE FUNCTION public.noticeboard_touch_login()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;
  UPDATE public.noticeboard_profiles
     SET last_login_at = now(), last_activity_at = now(),
         renewal_reminder_sent_at = NULL
   WHERE user_id = auth.uid();
END $$;

CREATE OR REPLACE FUNCTION public.noticeboard_my_listing()
RETURNS TABLE(
  id uuid, name text, town text, phone text, description text, skills text[],
  category text, years_experience integer, availability text, photo_url text,
  is_hidden boolean, is_archived boolean, archived_at timestamptz,
  last_activity_at timestamptz, last_login_at timestamptz,
  last_contact_request_at timestamptz,
  public_listing_reference text, created_at timestamptz, updated_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT id, name, town, phone, description, skills, category,
         years_experience, availability, photo_url, is_hidden, is_archived,
         archived_at, last_activity_at, last_login_at, last_contact_request_at,
         public_listing_reference, created_at, updated_at
  FROM public.noticeboard_profiles
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.noticeboard_admin_stats()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE v_result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT jsonb_build_object(
    'active_listings', (SELECT count(*) FROM public.noticeboard_profiles
                         WHERE NOT is_archived AND NOT is_suspended AND NOT is_hidden),
    'archived_listings', (SELECT count(*) FROM public.noticeboard_profiles WHERE is_archived),
    'awaiting_renewal', (SELECT count(*) FROM public.noticeboard_profiles
                         WHERE NOT is_archived AND last_activity_at < now() - interval '60 days'),
    'contact_requests', (SELECT count(*) FROM public.noticeboard_contact_requests),
    'new_this_month', (SELECT count(*) FROM public.noticeboard_profiles
                       WHERE created_at >= date_trunc('month', now())),
    'most_common_skills', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('skill', skill, 'count', c)), '[]'::jsonb)
      FROM (SELECT unnest(skills) AS skill, count(*)::int AS c
              FROM public.noticeboard_profiles WHERE NOT is_archived
              GROUP BY 1 ORDER BY 2 DESC LIMIT 8) s
    ),
    'most_active_towns', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('town', town, 'count', c)), '[]'::jsonb)
      FROM (SELECT town, count(*)::int AS c FROM public.noticeboard_profiles
              WHERE NOT is_archived GROUP BY 1 ORDER BY 2 DESC LIMIT 8) t
    )
  ) INTO v_result;
  RETURN v_result;
END $$;

CREATE OR REPLACE FUNCTION public.noticeboard_run_lifecycle_maintenance()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_reminded int := 0; v_archived int := 0; v_deleted int := 0; v_rec record;
BEGIN
  FOR v_rec IN
    SELECT id, user_id FROM public.noticeboard_profiles
     WHERE NOT is_archived AND last_activity_at < now() - interval '60 days'
       AND (renewal_reminder_sent_at IS NULL OR renewal_reminder_sent_at < last_activity_at)
  LOOP
    UPDATE public.noticeboard_profiles SET renewal_reminder_sent_at = now() WHERE id = v_rec.id;
    INSERT INTO public.noticeboard_lifecycle_events(profile_id, user_id, event_type)
      VALUES (v_rec.id, v_rec.user_id, 'renewal_reminder');
    v_reminded := v_reminded + 1;
  END LOOP;

  FOR v_rec IN
    SELECT id, user_id FROM public.noticeboard_profiles
     WHERE NOT is_archived AND last_activity_at < now() - interval '90 days'
  LOOP
    UPDATE public.noticeboard_profiles
       SET is_archived = true, archived_at = now(), archive_notice_sent_at = now()
     WHERE id = v_rec.id;
    INSERT INTO public.noticeboard_lifecycle_events(profile_id, user_id, event_type)
      VALUES (v_rec.id, v_rec.user_id, 'auto_archived');
    INSERT INTO public.noticeboard_lifecycle_events(profile_id, user_id, event_type)
      VALUES (v_rec.id, v_rec.user_id, 'archive_notice');
    v_archived := v_archived + 1;
  END LOOP;

  FOR v_rec IN
    SELECT id, user_id FROM public.noticeboard_profiles
     WHERE is_archived AND archived_at < now() - interval '23 days'
       AND deletion_notice_sent_at IS NULL
  LOOP
    UPDATE public.noticeboard_profiles SET deletion_notice_sent_at = now() WHERE id = v_rec.id;
    INSERT INTO public.noticeboard_lifecycle_events(profile_id, user_id, event_type)
      VALUES (v_rec.id, v_rec.user_id, 'deletion_notice');
  END LOOP;

  FOR v_rec IN
    SELECT id, user_id FROM public.noticeboard_profiles
     WHERE is_archived AND archived_at < now() - interval '30 days'
  LOOP
    INSERT INTO public.noticeboard_lifecycle_events(profile_id, user_id, event_type, details)
      VALUES (NULL, v_rec.user_id, 'auto_deleted',
              jsonb_build_object('deleted_profile_id', v_rec.id));
    DELETE FROM public.noticeboard_profiles WHERE id = v_rec.id;
    v_deleted := v_deleted + 1;
  END LOOP;

  RETURN jsonb_build_object('reminded', v_reminded, 'archived', v_archived,
                            'deleted', v_deleted, 'ran_at', now());
END $$;

CREATE EXTENSION IF NOT EXISTS pg_cron;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname='noticeboard-lifecycle-daily') THEN
    PERFORM cron.unschedule('noticeboard-lifecycle-daily');
  END IF;
  PERFORM cron.schedule(
    'noticeboard-lifecycle-daily',
    '15 3 * * *',
    'SELECT public.noticeboard_run_lifecycle_maintenance();'
  );
END $$;
