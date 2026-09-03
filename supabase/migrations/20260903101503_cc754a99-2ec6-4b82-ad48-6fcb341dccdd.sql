CREATE TABLE public.noticeboard_profile_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.noticeboard_profiles(id) ON DELETE CASCADE,
  skill text NOT NULL,
  experience_level text CHECK (experience_level IN ('lt1','1_2','3_5','6_10','10plus')),
  is_custom boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, skill)
);

GRANT SELECT ON public.noticeboard_profile_skills TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.noticeboard_profile_skills TO authenticated;
GRANT ALL ON public.noticeboard_profile_skills TO service_role;

ALTER TABLE public.noticeboard_profile_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view skills of visible listings"
ON public.noticeboard_profile_skills FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.noticeboard_profiles p
  WHERE p.id = profile_id AND p.is_hidden = false AND p.is_suspended = false AND p.is_archived = false
));

CREATE POLICY "Owners manage their own listing skills"
ON public.noticeboard_profile_skills FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.noticeboard_profiles p WHERE p.id = profile_id AND p.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.noticeboard_profiles p WHERE p.id = profile_id AND p.user_id = auth.uid()));

CREATE TRIGGER noticeboard_profile_skills_set_updated_at
BEFORE UPDATE ON public.noticeboard_profile_skills
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE INDEX idx_noticeboard_profile_skills_profile ON public.noticeboard_profile_skills(profile_id);

-- Migrate existing data: keep each listing's existing skills, mapping the single
-- overall years_experience value onto every skill (no invented values).
INSERT INTO public.noticeboard_profile_skills (profile_id, skill, experience_level, position)
SELECT p.id,
       s.skill,
       CASE
         WHEN p.years_experience IS NULL THEN NULL
         WHEN p.years_experience < 1 THEN 'lt1'
         WHEN p.years_experience <= 2 THEN '1_2'
         WHEN p.years_experience <= 5 THEN '3_5'
         WHEN p.years_experience <= 9 THEN '6_10'
         ELSE '10plus'
       END,
       s.ord
FROM public.noticeboard_profiles p
CROSS JOIN LATERAL unnest(p.skills) WITH ORDINALITY AS s(skill, ord)
WHERE p.skills IS NOT NULL
ON CONFLICT (profile_id, skill) DO NOTHING;

-- Public view now exposes per-skill experience
CREATE OR REPLACE VIEW public.noticeboard_public AS
SELECT p.id,
  p.public_listing_reference,
  p.name,
  p.town,
  p.skills,
  p.category,
  p.years_experience,
  p.availability,
  p.description,
  p.photo_url,
  p.created_at,
  COALESCE((
    SELECT jsonb_agg(jsonb_build_object('skill', ps.skill, 'experience_level', ps.experience_level)
                     ORDER BY ps.position, ps.created_at)
    FROM public.noticeboard_profile_skills ps WHERE ps.profile_id = p.id
  ), '[]'::jsonb) AS skill_experience
FROM public.noticeboard_profiles p
WHERE p.is_hidden = false AND p.is_suspended = false AND p.is_archived = false;

-- Owner listing RPC returns per-skill experience too
DROP FUNCTION IF EXISTS public.noticeboard_my_listing();
CREATE OR REPLACE FUNCTION public.noticeboard_my_listing()
RETURNS TABLE(id uuid, name text, town text, phone text, description text, skills text[], category text, years_experience integer, availability text, photo_url text, is_hidden boolean, is_archived boolean, archived_at timestamptz, last_activity_at timestamptz, last_login_at timestamptz, last_contact_request_at timestamptz, public_listing_reference text, created_at timestamptz, updated_at timestamptz, skill_experience jsonb)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT p.id, p.name, p.town, p.phone, p.description, p.skills, p.category,
         p.years_experience, p.availability, p.photo_url, p.is_hidden, p.is_archived,
         p.archived_at, p.last_activity_at, p.last_login_at, p.last_contact_request_at,
         p.public_listing_reference, p.created_at, p.updated_at,
         COALESCE((
           SELECT jsonb_agg(jsonb_build_object('skill', ps.skill, 'experience_level', ps.experience_level, 'is_custom', ps.is_custom)
                            ORDER BY ps.position, ps.created_at)
           FROM public.noticeboard_profile_skills ps WHERE ps.profile_id = p.id
         ), '[]'::jsonb)
  FROM public.noticeboard_profiles p
  WHERE p.user_id = auth.uid()
  LIMIT 1;
$function$;

REVOKE ALL ON FUNCTION public.noticeboard_my_listing() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.noticeboard_my_listing() TO authenticated;

-- Shared helper: replace the skill rows for a listing from a jsonb array
CREATE OR REPLACE FUNCTION public.noticeboard_sync_skills(_profile_id uuid, _skill_experience jsonb)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF _skill_experience IS NULL OR jsonb_typeof(_skill_experience) <> 'array' THEN RETURN; END IF;

  DELETE FROM public.noticeboard_profile_skills ps
  WHERE ps.profile_id = _profile_id
    AND ps.skill NOT IN (
      SELECT NULLIF(trim(e->>'skill'),'') FROM jsonb_array_elements(_skill_experience) e
      WHERE NULLIF(trim(e->>'skill'),'') IS NOT NULL
    );

  INSERT INTO public.noticeboard_profile_skills (profile_id, skill, experience_level, is_custom, position)
  SELECT _profile_id,
         trim(e.value->>'skill'),
         NULLIF(e.value->>'experience_level',''),
         COALESCE((e.value->>'is_custom')::boolean, false),
         e.ord::int
  FROM jsonb_array_elements(_skill_experience) WITH ORDINALITY AS e(value, ord)
  WHERE NULLIF(trim(e.value->>'skill'),'') IS NOT NULL
  ON CONFLICT (profile_id, skill) DO UPDATE
    SET experience_level = EXCLUDED.experience_level,
        is_custom = EXCLUDED.is_custom,
        position = EXCLUDED.position,
        updated_at = now();
END $function$;

REVOKE ALL ON FUNCTION public.noticeboard_sync_skills(uuid, jsonb) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.noticeboard_my_create(_payload jsonb)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
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
  PERFORM public.noticeboard_sync_skills(v_row.id, _payload->'skill_experience');
  RETURN v_row.id;
END $function$;

CREATE OR REPLACE FUNCTION public.noticeboard_my_update(_payload jsonb)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
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
  PERFORM public.noticeboard_sync_skills(v_id, _payload->'skill_experience');
  RETURN v_id;
END $function$;