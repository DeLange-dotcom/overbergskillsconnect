-- Fix youth_badges public read: restrict to admins and owning youth profile user
DROP POLICY IF EXISTS "Public can read badges" ON public.youth_badges;

CREATE POLICY "Owners and admins read badges" ON public.youth_badges
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.youth_profiles yp
    WHERE yp.id = youth_badges.youth_profile_id
      AND yp.user_id = auth.uid()
  )
);

-- Add owner-scoped UPDATE and DELETE policies for provider-documents storage bucket
CREATE POLICY "Owners update own provider docs" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'provider-documents' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'provider-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owners delete own provider docs" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'provider-documents' AND (storage.foldername(name))[1] = auth.uid()::text);