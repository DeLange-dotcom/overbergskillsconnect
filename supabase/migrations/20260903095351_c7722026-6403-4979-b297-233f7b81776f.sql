-- Remove blanket column access for signed-in users on youth_opportunities
REVOKE SELECT ON public.youth_opportunities FROM authenticated;

GRANT SELECT (
  id, posted_by_user_id, organisation_name, title, description, category,
  opportunity_type, min_age, max_age, town, start_date, end_date, closing_date,
  prohibited_for_minors, child_safe_reviewed, hazardous_flag, status,
  linked_programme, created_at, updated_at, provider_type, website,
  positions_available, compensation_type, compensation_amount,
  skills_required, experience_required, involves_children,
  involves_vulnerable_adults, involves_home_visits, involves_transport,
  involves_overnight, involves_machinery, involves_chemicals, involves_heights,
  requires_manual_review, organisation_id
) ON public.youth_opportunities TO authenticated;

GRANT ALL ON public.youth_opportunities TO service_role;

-- Admin (or poster) access to the full row, including contact details
CREATE OR REPLACE FUNCTION public.youth_opportunities_admin_list()
RETURNS SETOF public.youth_opportunities
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.*
  FROM public.youth_opportunities o
  WHERE public.has_role(auth.uid(), 'admin')
     OR o.posted_by_user_id = auth.uid()
  ORDER BY o.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.youth_opportunities_admin_list() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.youth_opportunities_admin_list() TO authenticated;
