-- The public listing view orders skills by position and creation time, so the
-- whole (non-sensitive) skills row must be readable. Row visibility is still
-- restricted by the existing policy to publicly visible listings only.
GRANT SELECT ON public.noticeboard_profile_skills TO anon, authenticated;