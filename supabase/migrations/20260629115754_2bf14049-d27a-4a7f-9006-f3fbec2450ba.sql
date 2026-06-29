
CREATE SEQUENCE IF NOT EXISTS public.noticeboard_public_ref_seq START 1;

ALTER TABLE public.noticeboard_profiles
  ADD COLUMN IF NOT EXISTS public_listing_reference text UNIQUE;

CREATE OR REPLACE FUNCTION public.tg_noticeboard_assign_public_ref()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.public_listing_reference IS NULL OR NEW.public_listing_reference = '' THEN
    NEW.public_listing_reference := 'OSC-' || lpad(nextval('public.noticeboard_public_ref_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_noticeboard_assign_public_ref ON public.noticeboard_profiles;
CREATE TRIGGER trg_noticeboard_assign_public_ref
  BEFORE INSERT ON public.noticeboard_profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_noticeboard_assign_public_ref();

-- Backfill existing rows
WITH ordered AS (
  SELECT id, row_number() OVER (ORDER BY created_at, id) AS rn
  FROM public.noticeboard_profiles
  WHERE public_listing_reference IS NULL
)
UPDATE public.noticeboard_profiles p
   SET public_listing_reference = 'OSC-' || lpad(o.rn::text, 4, '0')
  FROM ordered o
 WHERE p.id = o.id;

-- Advance the sequence past any backfilled values
SELECT setval(
  'public.noticeboard_public_ref_seq',
  GREATEST(
    (SELECT COALESCE(MAX(NULLIF(regexp_replace(public_listing_reference, '^OSC-', ''), '')::int), 0)
       FROM public.noticeboard_profiles),
    1
  )
);

-- Recreate the public view to include the reference
DROP VIEW IF EXISTS public.noticeboard_public;
CREATE VIEW public.noticeboard_public
WITH (security_invoker = on)
AS
SELECT
  id,
  public_listing_reference,
  name,
  town,
  skills,
  category,
  years_experience,
  availability,
  description,
  photo_url,
  created_at
FROM public.noticeboard_profiles
WHERE is_hidden = false AND is_suspended = false;

GRANT SELECT ON public.noticeboard_public TO anon, authenticated;
