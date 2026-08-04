DROP FUNCTION IF EXISTS public.noticeboard_owner_get_listing(uuid);

CREATE OR REPLACE FUNCTION public.noticeboard_owner_get_listing(_manage_token uuid)
RETURNS TABLE(id uuid, public_listing_reference text, is_hidden boolean, name text, phone text)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT id, public_listing_reference, is_hidden, name, phone
  FROM public.noticeboard_profiles
  WHERE manage_token = _manage_token;
$$;

REVOKE ALL ON FUNCTION public.noticeboard_owner_get_listing(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.noticeboard_owner_get_listing(uuid) TO anon, authenticated;
