
CREATE POLICY "Users read own apprenticeship docs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'apprenticeship-documents'
         AND (auth.uid()::text = (storage.foldername(name))[1]
              OR public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Users upload own apprenticeship docs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'apprenticeship-documents'
              AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own apprenticeship docs"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'apprenticeship-documents'
         AND (auth.uid()::text = (storage.foldername(name))[1]
              OR public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Users delete own apprenticeship docs"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'apprenticeship-documents'
         AND (auth.uid()::text = (storage.foldername(name))[1]
              OR public.has_role(auth.uid(), 'admin')));
