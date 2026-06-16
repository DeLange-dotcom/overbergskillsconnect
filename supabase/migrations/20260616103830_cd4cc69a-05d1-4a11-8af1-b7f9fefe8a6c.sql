DO $$
DECLARE
    tbl record;
    has_priv boolean;
BEGIN
    FOR tbl IN
        SELECT c.relname AS table_name
          FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE c.relkind = 'r' AND n.nspname = 'public'
    LOOP
        SELECT EXISTS (
            SELECT 1 FROM information_schema.role_table_grants
             WHERE grantee = 'authenticated' AND table_schema = 'public' AND table_name = tbl.table_name
               AND privilege_type IN ('SELECT','INSERT','UPDATE','DELETE')
        ) INTO has_priv;
        IF NOT has_priv THEN
            EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', tbl.table_name);
        END IF;

        SELECT EXISTS (
            SELECT 1 FROM information_schema.role_table_grants
             WHERE grantee = 'service_role' AND table_schema = 'public' AND table_name = tbl.table_name
               AND privilege_type IN ('SELECT','INSERT','UPDATE','DELETE')
        ) INTO has_priv;
        IF NOT has_priv THEN
            EXECUTE format('GRANT ALL ON public.%I TO service_role', tbl.table_name);
        END IF;
    END LOOP;
END;
$$;

-- Public-submission tables: anon needs INSERT (policies allow with_check true)
GRANT INSERT ON public.service_providers TO anon;
GRANT INSERT ON public.provider_references TO anon;
GRANT INSERT ON public.terms_acceptances TO anon;
GRANT INSERT ON public.provider_documents TO anon;
GRANT INSERT ON public.contact_requests TO anon;
GRANT INSERT ON public.service_requests TO anon;
GRANT INSERT ON public.apprentice_applications TO anon;
GRANT INSERT ON public.youth_applications TO anon;