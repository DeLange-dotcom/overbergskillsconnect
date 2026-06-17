
ALTER TABLE public.mentors
  ADD COLUMN IF NOT EXISTS qualifications text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS pcc_path text,
  ADD COLUMN IF NOT EXISTS reference1_name text,
  ADD COLUMN IF NOT EXISTS reference1_relationship text,
  ADD COLUMN IF NOT EXISTS reference1_phone text,
  ADD COLUMN IF NOT EXISTS reference1_email text,
  ADD COLUMN IF NOT EXISTS reference2_name text,
  ADD COLUMN IF NOT EXISTS reference2_relationship text,
  ADD COLUMN IF NOT EXISTS reference2_phone text,
  ADD COLUMN IF NOT EXISTS reference2_email text,
  ADD COLUMN IF NOT EXISTS safeguarding_acknowledged_at timestamptz,
  ADD COLUMN IF NOT EXISTS safeguarding_policy_version text,
  ADD COLUMN IF NOT EXISTS disclaimer_accepted_at timestamptz;
