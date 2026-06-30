import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { Phone, Clock, X, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/request/$token")({
  component: ViewRequest,
});

type Row = {
  status: string;
  profile_name: string;
  profile_town: string;
  phone: string | null;
  created_at: string;
  decided_at: string | null;
};

function ViewRequest() {
  const { token } = Route.useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["view-request", token],
    queryFn: async (): Promise<Row | null> => {
      const { data, error } = await supabase.rpc("noticeboard_view_request", {
        _requester_token: token,
      });
      if (error) throw error;
      return ((data ?? [])[0] as Row | undefined) ?? null;
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="max-w-md mx-auto px-4 py-16 text-center text-brand-dark/50">Loading…</div>
      </SiteLayout>
    );
  }
  if (error || !data) {
    return (
      <SiteLayout>
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-heading font-bold mb-2">Request not found</h1>
          <Link to="/find-help" className="text-brand-primary underline">
            Back to the noticeboard
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="max-w-md mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-heading font-bold mb-1">
          Request to {data.profile_name}
        </h1>
        <p className="text-sm text-brand-dark/60 mb-6">{data.profile_town}</p>

        {data.status === "pending" && (
          <div className="p-5 rounded-2xl border border-amber-300 bg-amber-50 text-amber-900">
            <div className="flex items-center gap-2 font-medium">
              <Clock className="size-5" /> Waiting for a response
            </div>
            <p className="text-sm mt-2">
              {data.profile_name} hasn't responded yet. Check back later — this page updates
              automatically.
            </p>
          </div>
        )}
        {data.status === "declined" && (
          <div className="p-5 rounded-2xl border border-red-300 bg-red-50 text-red-900">
            <div className="flex items-center gap-2 font-medium">
              <X className="size-5" /> Request declined
            </div>
            <p className="text-sm mt-2">
              {data.profile_name} chose not to share their contact details.
            </p>
          </div>
        )}
        {data.status === "approved" && data.phone && (
          <div className="p-5 rounded-2xl border border-emerald-300 bg-emerald-50 text-emerald-900">
            <div className="flex items-center gap-2 font-medium">
              <Phone className="size-5" /> Contact details
            </div>
            <p className="text-sm mt-2">
              {data.profile_name} has shared their phone number:
            </p>
            <a
              href={`tel:${data.phone}`}
              className="block mt-3 text-2xl font-heading font-bold text-emerald-700"
            >
              {data.phone}
            </a>
            <p className="text-xs mt-4 opacity-80">
              Any arrangement you make is entirely between you and {data.profile_name}. Khulisa
              Community does not vet or guarantee anyone on this noticeboard.
            </p>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
