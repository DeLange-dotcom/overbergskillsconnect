
-- Link noticeboard listings to user accounts (one listing per user)
ALTER TABLE public.noticeboard_profiles
  ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX noticeboard_profiles_user_id_unique
  ON public.noticeboard_profiles(user_id)
  WHERE user_id IS NOT NULL;

-- Allow authenticated users to view their own listing row (RLS-scoped)
CREATE POLICY "users_select_own_listing"
  ON public.noticeboard_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

GRANT SELECT ON public.noticeboard_profiles TO authenticated;

-- Get the current user's listing (or none)
CREATE OR REPLACE FUNCTION public.noticeboard_my_listing()
RETURNS TABLE(
  id uuid, name text, town text, phone text, description text,
  skills text[], category text, years_experience int,
  availability text, photo_url text, is_hidden boolean,
  public_listing_reference text, created_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id, name, town, phone, description, skills, category,
         years_experience, availability, photo_url, is_hidden,
         public_listing_reference, created_at
  FROM public.noticeboard_profiles
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- Update the current user's listing
CREATE OR REPLACE FUNCTION public.noticeboard_my_update(_payload jsonb)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  UPDATE public.noticeboard_profiles SET
    name = COALESCE(NULLIF(_payload->>'name',''), name),
    town = COALESCE(NULLIF(_payload->>'town',''), town),
    phone = COALESCE(NULLIF(_payload->>'phone',''), phone),
    description = COALESCE(NULLIF(_payload->>'description',''), description),
    skills = COALESCE(
      (SELECT array_agg(value) FROM jsonb_array_elements_text(_payload->'skills')),
      skills
    ),
    category = COALESCE(NULLIF(_payload->>'category',''), category),
    years_experience = COALESCE(NULLIF(_payload->>'years_experience','')::int, years_experience),
    availability = CASE WHEN _payload ? 'availability' THEN NULLIF(_payload->>'availability','') ELSE availability END,
    photo_url = CASE WHEN _payload ? 'photo_url' THEN NULLIF(_payload->>'photo_url','') ELSE photo_url END,
    is_hidden = COALESCE((_payload->>'is_hidden')::boolean, is_hidden),
    updated_at = now()
  WHERE user_id = auth.uid()
  RETURNING id INTO v_id;
  IF v_id IS NULL THEN RAISE EXCEPTION 'listing_not_found'; END IF;
  RETURN v_id;
END $$;

-- Delete the current user's listing
CREATE OR REPLACE FUNCTION public.noticeboard_my_delete()
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  DELETE FROM public.noticeboard_profiles WHERE user_id = auth.uid();
  RETURN FOUND;
END $$;

-- Authenticated create: same as anon create but attaches user_id and enforces one-per-user
CREATE OR REPLACE FUNCTION public.noticeboard_my_create(_payload jsonb)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_row public.noticeboard_profiles%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF EXISTS (SELECT 1 FROM public.noticeboard_profiles WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'listing_already_exists';
  END IF;
  INSERT INTO public.noticeboard_profiles (
    name, town, phone, description, skills, category,
    years_experience, availability, photo_url, accepted_terms, user_id
  ) VALUES (
    NULLIF(_payload->>'name',''),
    NULLIF(_payload->>'town',''),
    NULLIF(_payload->>'phone',''),
    NULLIF(_payload->>'description',''),
    COALESCE((SELECT array_agg(value) FROM jsonb_array_elements_text(_payload->'skills')), '{}'::text[]),
    NULLIF(_payload->>'category',''),
    NULLIF(_payload->>'years_experience','')::int,
    NULLIF(_payload->>'availability',''),
    NULLIF(_payload->>'photo_url',''),
    COALESCE((_payload->>'accepted_terms')::boolean, false),
    auth.uid()
  ) RETURNING * INTO v_row;
  RETURN v_row.id;
END $$;

-- Claim an existing anonymous listing via its manage token (one-time link to account)
CREATE OR REPLACE FUNCTION public.noticeboard_claim_listing(_manage_token uuid)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF EXISTS (SELECT 1 FROM public.noticeboard_profiles WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'already_have_listing';
  END IF;
  UPDATE public.noticeboard_profiles
     SET user_id = auth.uid(), updated_at = now()
   WHERE manage_token = _manage_token AND user_id IS NULL
   RETURNING id INTO v_id;
  IF v_id IS NULL THEN RAISE EXCEPTION 'invalid_or_claimed'; END IF;
  RETURN v_id;
END $$;

GRANT EXECUTE ON FUNCTION public.noticeboard_my_listing() TO authenticated;
GRANT EXECUTE ON FUNCTION public.noticeboard_my_update(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.noticeboard_my_delete() TO authenticated;
GRANT EXECUTE ON FUNCTION public.noticeboard_my_create(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.noticeboard_claim_listing(uuid) TO authenticated;
