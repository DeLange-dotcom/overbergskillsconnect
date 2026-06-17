
ALTER TABLE public.apprenticeship_providers
  ADD COLUMN IF NOT EXISTS verification_doc_path text,
  ADD COLUMN IF NOT EXISTS safeguarding_acknowledged_at timestamptz,
  ADD COLUMN IF NOT EXISTS safeguarding_policy_version text,
  ADD COLUMN IF NOT EXISTS disclaimer_accepted_at timestamptz;
