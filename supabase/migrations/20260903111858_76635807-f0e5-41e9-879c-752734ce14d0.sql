CREATE OR REPLACE FUNCTION public.admin_pending_contact_reminders()
RETURNS TABLE(
  id uuid,
  requester_name text,
  created_at timestamptz,
  profile_id uuid,
  profile_name text,
  profile_phone text,
  public_listing_reference text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id,
         r.requester_name,
         r.created_at,
         p.id,
         p.name,
         p.phone,
         p.public_listing_reference
  FROM public.noticeboard_contact_requests r
  JOIN public.noticeboard_profiles p ON p.id = r.profile_id
  WHERE r.status = 'pending'
    AND public.is_admin(auth.uid())
  ORDER BY r.created_at DESC
$$;

REVOKE ALL ON FUNCTION public.admin_pending_contact_reminders() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_pending_contact_reminders() TO authenticated;