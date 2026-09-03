import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ShieldAlert } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

/**
 * Administration area gate.
 *
 * The authenticated layout above already requires a signed-in user. This layer
 * additionally requires an administrator role. The check is only a convenience
 * for the interface — every administration action is a database function that
 * re-checks the caller's role server-side, so knowing the URL grants nothing.
 */
function AdminLayout() {
  const { data, isLoading } = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("is_admin");
      if (error) throw error;
      return data === true;
    },
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center text-brand-dark/50">
          <Loader2 className="size-6 animate-spin mx-auto" />
        </div>
      </SiteLayout>
    );
  }

  if (!data) {
    return (
      <SiteLayout>
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <ShieldAlert className="size-10 text-amber-600 mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-bold mb-2">Access denied</h1>
          <p className="text-brand-dark/70 mb-6">
            This area is for authorised administrators only.
          </p>
          <Link
            to="/profile"
            className="inline-flex px-5 py-3 rounded-xl bg-brand-primary text-white font-medium"
          >
            Go to My Profile
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return <Outlet />;
}
