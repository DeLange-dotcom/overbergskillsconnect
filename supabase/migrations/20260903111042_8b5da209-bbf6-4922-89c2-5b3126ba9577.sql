-- =====================================================================
-- UAT Pass 4: locations, moderation states, favourites, account deletion,
-- profile/listing consistency, admin RPCs + audit trail
-- =====================================================================

-- ---------------------------------------------------------------
-- 1. STANDARDISED OVERBERG LOCATIONS
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.normalise_town(_town text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT COALESCE((
    SELECT t
    FROM unnest(ARRAY[
      'Napier','Bredasdorp','Arniston / Waenhuiskrans','Struisbaai','L''Agulhas','Elim',
      'Stanford','Gansbaai','Hermanus','Caledon','Greyton','Genadendal','Riviersonderend',
      'Botrivier','Kleinmond','Grabouw','Villiersdorp'
    ]) AS t
    WHERE lower(regexp_replace(t, '[^a-zA-Z]', '', 'g'))
        = lower(regexp_replace(COALESCE(_town, ''), '[^a-zA-Z]', '', 'g'))
    LIMIT 1
  ), _town);
$$;

REVOKE ALL ON FUNCTION public.normalise_town(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.normalise_town(text) TO service_role;

-- Safe, case/spacing-only mapping of existing data. Ambiguous or misspelled
-- values are left untouched on purpose.
UPDATE public.noticeboard_profiles
   SET town = public.normalise_town(town)
 WHERE town IS DISTINCT FROM public.normalise_town(town);

UPDATE public.user_profiles
   SET town = public.normalise_town(town)
 WHERE town IS NOT NULL
   AND town IS DISTINCT FROM public.normalise_town(town);

-- ---------------------------------------------------------------
-- 2. ACCOUNT MODERATION STATE
-- ---------------------------------------------------------------
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS account_status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS status_reason text,
  ADD COLUMN IF NOT EXISTS status_changed_at timestamptz,
  ADD COLUMN IF NOT EXISTS status_changed_by uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_profiles_account_status_chk'
  ) THEN
    ALTER TABLE public.user_profiles
      ADD CONSTRAINT user_profiles_account_status_chk
      CHECK (account_status IN ('active','suspended','removed'));
  END IF;
END $$;

-- ---------------------------------------------------------------
-- 3. PUBLIC READ ACCESS (fixes SECURITY DEFINER view finding)
--    Only non-sensitive columns are granted. phone + manage_token are
--    deliberately NOT granted to anon/authenticated.
-- ---------------------------------------------------------------
GRANT SELECT (
  id, public_listing_reference, name, town, skills, category, years_experience,
  availability, description, photo_url, created_at, updated_at,
  is_hidden, is_suspended, is_archived, user_id
) ON public.noticeboard_profiles TO anon, authenticated;

GRANT SELECT (id, profile_id, skill, experience_level, is_custom, position)
  ON public.noticeboard_profile_skills TO anon, authenticated;

DROP POLICY IF EXISTS "Public can read skills of visible listings" ON public.noticeboard_profile_skills;
CREATE POLICY "Public can read skills of visible listings"
  ON public.noticeboard_profile_skills FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.noticeboard_profiles p
     WHERE p.id = noticeboard_profile_skills.profile_id
       AND p.is_hidden = false AND p.is_suspended = false AND p.is_archived = false
  ));

ALTER VIEW public.noticeboard_public SET (security_invoker = on);

-- ---------------------------------------------------------------
-- 4. ROLE HELPERS
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin(_uid uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
     WHERE user_id = _uid AND role IN ('admin','super_admin','support_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(_uid uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _uid AND role = 'super_admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated, service_role;

-- The first administrator (existing platform owner) becomes super admin.
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'super_admin'::public.app_role
  FROM auth.users u
  JOIN public.user_roles r ON r.user_id = u.id AND r.role = 'admin'
ON CONFLICT (user_id, role) DO NOTHING;

-- ---------------------------------------------------------------
-- 5. AUDIT TRAIL
-- ---------------------------------------------------------------
DROP POLICY IF EXISTS "Admins read audit" ON public.audit_log;
CREATE POLICY "Admins read audit" ON public.audit_log FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.admin_write_audit(
  _action text, _entity_type text, _entity_id uuid, _details jsonb
) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, details)
  VALUES (auth.uid(), _action, _entity_type, _entity_id, _details);
$$;
REVOKE ALL ON FUNCTION public.admin_write_audit(text,text,uuid,jsonb) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_audit_trail(_limit int DEFAULT 100)
RETURNS TABLE(id uuid, created_at timestamptz, admin_email text, action text,
              entity_type text, entity_id uuid, details jsonb)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY
  SELECT a.id, a.created_at, u.email::text, a.action, a.entity_type, a.entity_id, a.details
    FROM public.audit_log a
    LEFT JOIN auth.users u ON u.id = a.actor_id
   ORDER BY a.created_at DESC
   LIMIT GREATEST(1, LEAST(_limit, 500));
END $$;
REVOKE ALL ON FUNCTION public.admin_audit_trail(int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_audit_trail(int) TO authenticated;

-- ---------------------------------------------------------------
-- 6. MY FAVOURITES
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.noticeboard_favourites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  profile_id uuid NOT NULL REFERENCES public.noticeboard_profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, profile_id)
);

GRANT SELECT, INSERT, DELETE ON public.noticeboard_favourites TO authenticated;
GRANT ALL ON public.noticeboard_favourites TO service_role;

ALTER TABLE public.noticeboard_favourites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own favourites" ON public.noticeboard_favourites;
CREATE POLICY "Users manage their own favourites"
  ON public.noticeboard_favourites FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS noticeboard_favourites_user_idx
  ON public.noticeboard_favourites(user_id);

-- Returns only public-safe columns. Never returns a phone number.
CREATE OR REPLACE FUNCTION public.noticeboard_my_favourites()
RETURNS TABLE(profile_id uuid, public_listing_reference text, name text, town text,
              skills text[], description text, photo_url text,
              is_available boolean, saved_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.public_listing_reference, p.name, p.town, p.skills, p.description,
         p.photo_url,
         (p.is_hidden = false AND p.is_suspended = false AND p.is_archived = false),
         f.created_at
    FROM public.noticeboard_favourites f
    JOIN public.noticeboard_profiles p ON p.id = f.profile_id
   WHERE f.user_id = auth.uid()
   ORDER BY f.created_at DESC;
$$;
REVOKE ALL ON FUNCTION public.noticeboard_my_favourites() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.noticeboard_my_favourites() TO authenticated;

-- ---------------------------------------------------------------
-- 7. PROFILE <-> LISTING CONSISTENCY
-- ---------------------------------------------------------------
-- Backfill: personal details captured only on the listing are copied into
-- My Details where My Details is empty. No data is overwritten.
INSERT INTO public.user_profiles (user_id, full_name, town, phone)
SELECT n.user_id, n.name, n.town, n.phone
  FROM public.noticeboard_profiles n
 WHERE n.user_id IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET
  full_name = COALESCE(NULLIF(public.user_profiles.full_name, ''), EXCLUDED.full_name),
  town      = COALESCE(NULLIF(public.user_profiles.town, ''),      EXCLUDED.town),
  phone     = COALESCE(NULLIF(public.user_profiles.phone, ''),     EXCLUDED.phone),
  updated_at = now();

-- Shared helper used by both sides of the sync.
CREATE OR REPLACE FUNCTION public.sync_user_profile_core(
  _uid uuid, _full_name text, _town text, _phone text
) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.user_profiles (user_id, full_name, town, phone)
  VALUES (_uid, NULLIF(_full_name,''), NULLIF(_town,''), NULLIF(_phone,''))
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = COALESCE(NULLIF(EXCLUDED.full_name,''), public.user_profiles.full_name),
    town      = COALESCE(NULLIF(EXCLUDED.town,''),      public.user_profiles.town),
    phone     = COALESCE(NULLIF(EXCLUDED.phone,''),     public.user_profiles.phone),
    updated_at = now();
$$;
REVOKE ALL ON FUNCTION public.sync_user_profile_core(uuid,text,text,text) FROM PUBLIC, anon, authenticated;

-- My Details -> listing
CREATE OR REPLACE FUNCTION public.upsert_my_profile(_full_name text, _town text, _phone text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  INSERT INTO public.user_profiles(user_id, full_name, town, phone)
  VALUES (auth.uid(), NULLIF(_full_name,''), public.normalise_town(NULLIF(_town,'')), NULLIF(_phone,''))
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    town = EXCLUDED.town,
    phone = EXCLUDED.phone,
    updated_at = now();

  -- Keep the public skills listing in step: name / area / phone are shared core data.
  UPDATE public.noticeboard_profiles
     SET name  = COALESCE(NULLIF(_full_name,''), name),
         town  = COALESCE(public.normalise_town(NULLIF(_town,'')), town),
         phone = COALESCE(NULLIF(_phone,''), phone),
         updated_at = now()
   WHERE user_id = auth.uid();
END $$;

-- Listing -> My Details (create)
CREATE OR REPLACE FUNCTION public.noticeboard_my_create(_payload jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
    public.normalise_town(NULLIF(_payload->>'town','')),
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
  PERFORM public.sync_user_profile_core(auth.uid(), v_row.name, v_row.town, v_row.phone);
  RETURN v_row.id;
END $$;

-- Listing -> My Details (update)
CREATE OR REPLACE FUNCTION public.noticeboard_my_update(_payload jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid; v_row public.noticeboard_profiles%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  UPDATE public.noticeboard_profiles SET
    name = COALESCE(NULLIF(_payload->>'name',''), name),
    town = COALESCE(public.normalise_town(NULLIF(_payload->>'town','')), town),
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
  RETURNING * INTO v_row;
  v_id := v_row.id;
  IF v_id IS NULL THEN RAISE EXCEPTION 'listing_not_found'; END IF;
  PERFORM public.noticeboard_sync_skills(v_id, _payload->'skill_experience');
  PERFORM public.sync_user_profile_core(auth.uid(), v_row.name, v_row.town, v_row.phone);
  RETURN v_id;
END $$;

-- ---------------------------------------------------------------
-- 8. PAUSE LISTING (explicit, separate from delete)
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.noticeboard_my_set_paused(_paused boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  UPDATE public.noticeboard_profiles
     SET is_hidden = _paused, updated_at = now()
   WHERE user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'listing_not_found'; END IF;
  RETURN _paused;
END $$;
REVOKE ALL ON FUNCTION public.noticeboard_my_set_paused(boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.noticeboard_my_set_paused(boolean) TO authenticated;

-- ---------------------------------------------------------------
-- 9. DELETE MY ACCOUNT (data side; auth user removed by the server)
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.delete_my_account_data()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  -- Favourites (mine, and anyone who saved my listing)
  DELETE FROM public.noticeboard_favourites WHERE user_id = uid;
  DELETE FROM public.noticeboard_favourites
   WHERE profile_id IN (SELECT id FROM public.noticeboard_profiles WHERE user_id = uid);

  -- Contact requests I sent are retained (they are evidence of consent and of
  -- released contact details) but are de-linked and anonymised.
  UPDATE public.noticeboard_contact_requests
     SET requester_user_id = NULL,
         requester_name = 'Deleted account',
         requester_contact = ''
   WHERE requester_user_id = uid;

  -- Public listing (cascades skills + requests received)
  DELETE FROM public.noticeboard_profiles WHERE user_id = uid;

  DELETE FROM public.notifications WHERE user_id = uid;
  DELETE FROM public.user_roles WHERE user_id = uid;
  DELETE FROM public.user_profiles WHERE user_id = uid;

  RETURN jsonb_build_object('ok', true, 'user_id', uid);
END $$;
REVOKE ALL ON FUNCTION public.delete_my_account_data() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_my_account_data() TO authenticated;

-- ---------------------------------------------------------------
-- 10. ADMIN READ RPCs
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_list_users(_q text DEFAULT NULL)
RETURNS TABLE(user_id uuid, email text, full_name text, town text, phone text,
              account_status text, created_at timestamptz, last_sign_in_at timestamptz,
              roles text[], listing_id uuid, listing_reference text,
              listing_name text, listing_status text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY
  SELECT u.id,
         u.email::text,
         COALESCE(p.full_name, u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
         p.town,
         p.phone,
         COALESCE(p.account_status, 'active'),
         u.created_at,
         u.last_sign_in_at,
         COALESCE((SELECT array_agg(r.role::text ORDER BY r.role::text)
                     FROM public.user_roles r WHERE r.user_id = u.id), '{}'::text[]),
         n.id,
         n.public_listing_reference,
         n.name,
         CASE WHEN n.id IS NULL THEN NULL
              WHEN n.is_suspended THEN 'suspended'
              WHEN n.is_archived THEN 'archived'
              WHEN n.is_hidden THEN 'paused'
              ELSE 'active' END
    FROM auth.users u
    LEFT JOIN public.user_profiles p ON p.user_id = u.id
    LEFT JOIN public.noticeboard_profiles n ON n.user_id = u.id
   WHERE _q IS NULL OR _q = ''
      OR u.email ILIKE '%'||_q||'%'
      OR COALESCE(p.full_name,'') ILIKE '%'||_q||'%'
      OR COALESCE(n.name,'') ILIKE '%'||_q||'%'
      OR COALESCE(n.public_listing_reference,'') ILIKE '%'||_q||'%'
   ORDER BY u.created_at DESC;
END $$;
REVOKE ALL ON FUNCTION public.admin_list_users(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_list_listings(_q text DEFAULT NULL, _status text DEFAULT NULL)
RETURNS TABLE(id uuid, user_id uuid, public_listing_reference text, name text, town text,
              skills text[], phone text, status text, created_at timestamptz,
              updated_at timestamptz, last_activity_at timestamptz, owner_email text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY
  SELECT n.id, n.user_id, n.public_listing_reference, n.name, n.town, n.skills, n.phone,
         CASE WHEN n.is_suspended THEN 'suspended'
              WHEN n.is_archived THEN 'archived'
              WHEN n.is_hidden THEN 'paused'
              ELSE 'active' END,
         n.created_at, n.updated_at, n.last_activity_at, u.email::text
    FROM public.noticeboard_profiles n
    LEFT JOIN auth.users u ON u.id = n.user_id
   WHERE (_q IS NULL OR _q = ''
          OR n.name ILIKE '%'||_q||'%'
          OR n.town ILIKE '%'||_q||'%'
          OR COALESCE(n.public_listing_reference,'') ILIKE '%'||_q||'%'
          OR COALESCE(u.email::text,'') ILIKE '%'||_q||'%')
     AND (_status IS NULL OR _status = '' OR _status =
          CASE WHEN n.is_suspended THEN 'suspended'
               WHEN n.is_archived THEN 'archived'
               WHEN n.is_hidden THEN 'paused'
               ELSE 'active' END)
   ORDER BY n.created_at DESC;
END $$;
REVOKE ALL ON FUNCTION public.admin_list_listings(text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_listings(text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_contact_activity(_q text DEFAULT NULL, _limit int DEFAULT 100)
RETURNS TABLE(id uuid, provider_name text, provider_reference text, requester_name text,
              status text, created_at timestamptz, decided_at timestamptz,
              revoked_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY
  SELECT r.id, p.name, p.public_listing_reference, r.requester_name, r.status,
         r.created_at, r.decided_at, r.revoked_at
    FROM public.noticeboard_contact_requests r
    JOIN public.noticeboard_profiles p ON p.id = r.profile_id
   WHERE _q IS NULL OR _q = ''
      OR p.name ILIKE '%'||_q||'%'
      OR r.requester_name ILIKE '%'||_q||'%'
   ORDER BY r.created_at DESC
   LIMIT GREATEST(1, LEAST(_limit, 500));
END $$;
REVOKE ALL ON FUNCTION public.admin_contact_activity(text,int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_contact_activity(text,int) TO authenticated;

-- ---------------------------------------------------------------
-- 11. ADMIN MODERATION ACTIONS (audited)
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_set_account_state(
  _user_id uuid, _state text, _reason text DEFAULT NULL
) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _state NOT IN ('active','suspended','removed') THEN RAISE EXCEPTION 'invalid_state'; END IF;
  IF _user_id = auth.uid() THEN RAISE EXCEPTION 'cannot_moderate_yourself'; END IF;
  IF public.is_super_admin(_user_id) AND NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  INSERT INTO public.user_profiles (user_id, account_status, status_reason,
                                    status_changed_at, status_changed_by)
  VALUES (_user_id, _state, _reason, now(), auth.uid())
  ON CONFLICT (user_id) DO UPDATE SET
    account_status = EXCLUDED.account_status,
    status_reason = EXCLUDED.status_reason,
    status_changed_at = now(),
    status_changed_by = auth.uid(),
    updated_at = now();

  -- Listing visibility follows the account state. Evidence rows are kept.
  UPDATE public.noticeboard_profiles
     SET is_suspended = (_state <> 'active'),
         is_archived  = CASE WHEN _state = 'removed' THEN true ELSE is_archived END,
         updated_at   = now()
   WHERE user_id = _user_id;

  PERFORM public.admin_write_audit(
    'account_' || _state, 'user', _user_id, jsonb_build_object('reason', _reason));
  RETURN _state;
END $$;
REVOKE ALL ON FUNCTION public.admin_set_account_state(uuid,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_account_state(uuid,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_listing_state(
  _profile_id uuid, _state text, _reason text DEFAULT NULL
) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _state NOT IN ('active','paused','suspended','removed') THEN RAISE EXCEPTION 'invalid_state'; END IF;

  UPDATE public.noticeboard_profiles
     SET is_hidden    = (_state = 'paused'),
         is_suspended = (_state IN ('suspended','removed')),
         is_archived  = CASE WHEN _state = 'removed' THEN true
                             WHEN _state = 'active' THEN false
                             ELSE is_archived END,
         archived_at  = CASE WHEN _state = 'removed' THEN now()
                             WHEN _state = 'active' THEN NULL
                             ELSE archived_at END,
         updated_at   = now()
   WHERE id = _profile_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'listing_not_found'; END IF;

  PERFORM public.admin_write_audit(
    'listing_' || _state, 'listing', _profile_id, jsonb_build_object('reason', _reason));
  RETURN _state;
END $$;
REVOKE ALL ON FUNCTION public.admin_set_listing_state(uuid,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_listing_state(uuid,text,text) TO authenticated;

-- ---------------------------------------------------------------
-- 12. ADMIN ROLE MANAGEMENT (super admin only)
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_set_role(
  _user_id uuid, _role text, _grant boolean
) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _role NOT IN ('admin','support_admin','super_admin') THEN RAISE EXCEPTION 'invalid_role'; END IF;

  IF _grant THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, _role::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    IF _role = 'super_admin'
       AND (SELECT count(*) FROM public.user_roles WHERE role = 'super_admin') <= 1 THEN
      RAISE EXCEPTION 'cannot_remove_last_super_admin';
    END IF;
    DELETE FROM public.user_roles WHERE user_id = _user_id AND role = _role::public.app_role;
  END IF;

  PERFORM public.admin_write_audit(
    CASE WHEN _grant THEN 'role_granted' ELSE 'role_revoked' END,
    'user', _user_id, jsonb_build_object('role', _role));
  RETURN _role;
END $$;
REVOKE ALL ON FUNCTION public.admin_set_role(uuid,text,boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_role(uuid,text,boolean) TO authenticated;

-- ---------------------------------------------------------------
-- 13. Tighten legacy admin policies to the new role helper
-- ---------------------------------------------------------------
DROP POLICY IF EXISTS "Admins read all profiles" ON public.noticeboard_profiles;
CREATE POLICY "Admins read all profiles" ON public.noticeboard_profiles
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins view all profiles" ON public.user_profiles;
CREATE POLICY "Admins view all profiles" ON public.user_profiles
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));