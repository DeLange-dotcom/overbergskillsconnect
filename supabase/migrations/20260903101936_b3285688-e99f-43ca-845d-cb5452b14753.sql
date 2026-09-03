REVOKE ALL ON public.noticeboard_profile_skills FROM anon, authenticated;
GRANT ALL ON public.noticeboard_profile_skills TO service_role;

DROP POLICY IF EXISTS "Public can view skills of visible listings" ON public.noticeboard_profile_skills;
DROP POLICY IF EXISTS "Owners manage their own listing skills" ON public.noticeboard_profile_skills;