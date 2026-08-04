REVOKE SELECT ON public.noticeboard_profiles FROM anon, authenticated;
REVOKE SELECT (manage_token, phone, user_id, accepted_terms) ON public.noticeboard_profiles FROM anon, authenticated;
GRANT SELECT (
  id, name, town, description, skills, category, years_experience, availability,
  photo_url, is_hidden, is_suspended, is_archived, archived_at, created_at, updated_at,
  last_activity_at, last_login_at, last_contact_request_at, renewal_reminder_sent_at,
  archive_notice_sent_at, deletion_notice_sent_at, public_listing_reference
) ON public.noticeboard_profiles TO anon, authenticated;
GRANT ALL ON public.noticeboard_profiles TO service_role;