CREATE OR REPLACE FUNCTION public.tg_notify_provider_new_interest()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE v_owner uuid; v_name text;
BEGIN
  SELECT user_id, name INTO v_owner, v_name
    FROM public.noticeboard_profiles WHERE id = NEW.profile_id;
  IF v_owner IS NOT NULL THEN
    INSERT INTO public.notifications(user_id, type, title, body, link, related_id)
    VALUES (v_owner, 'interest_received',
      'New person interested in your services',
      COALESCE(split_part(NEW.requester_name,' ',1),'Someone') || ' would like your contact details.',
      '/profile#people-interested', NEW.id);
  END IF;
  RETURN NEW;
END $function$;

UPDATE public.notifications
SET link = '/profile#people-interested'
WHERE type = 'interest_received' AND link = '/profile';