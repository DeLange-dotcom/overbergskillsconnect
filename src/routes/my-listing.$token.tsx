import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Check, X, Copy } from "lucide-react";

export const Route = createFileRoute("/my-listing/$token")({
  component: MyListing,
});

type Row = {
  profile_id: string;
  name: string;
  is_hidden: boolean;
  request_id: string | null;
  requester_name: string | null;
  requester_contact: string | null;
  message: string | null;
  status: string | null;
  created_at: string | null;
};

function MyListing() {
  const { token } = Route.useParams();
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["my-listing", token],
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase.rpc("noticeboard_owner_view", {
        _manage_token: token,
      });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const { data: publicRef } = useQuery({
    queryKey: ["my-listing-ref", token],
    queryFn: async (): Promise<string | null> => {
      const { data } = await supabase.rpc(
        "noticeboard_owner_get_listing" as never,
        { _manage_token: token } as never,
      );
      const row = Array.isArray(data) ? data[0] : data;
      return ((row as { public_listing_reference: string | null } | null)?.public_listing_reference) ?? null;
    },
  });

  async function decide(requestId: string, decision: "approved" | "declined") {
    const { error } = await supabase.rpc("noticeboard_owner_decide", {
      _manage_token: token,
      _request_id: requestId,
      _decision: decision,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(decision === "approved" ? "Contact details shared." : "Request declined.");
    qc.invalidateQueries({ queryKey: ["my-listing", token] });
  }

  async function toggleHidden(next: boolean) {
    const { error } = await supabase.rpc("noticeboard_owner_set_hidden", {
      _manage_token: token,
      _hidden: next,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(next ? "Listing hidden." : "Listing visible.");
    qc.invalidateQueries({ queryKey: ["my-listing", token] });
  }

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center text-brand-dark/50">
          Loading…
        </div>
      </SiteLayout>
    );
  }
  if (error) {
    return (
      <SiteLayout>
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-heading font-bold mb-2">Invalid link</h1>
          <p className="text-brand-dark/70">{(error as Error).message}</p>
        </div>
      </SiteLayout>
    );
  }

  const first = data?.[0];
  if (!first) {
    return (
      <SiteLayout>
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-heading font-bold mb-2">Listing not found</h1>
        </div>
      </SiteLayout>
    );
  }

  const requests = (data ?? []).filter((r) => r.request_id);

  return (
    <SiteLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-heading font-bold mb-2">My listing</h1>
        <p className="text-brand-dark/70 mb-6">
          Hello {first.name}. Manage contact requests and visibility below.
        </p>

        {publicRef && (
          <div className="p-4 rounded-2xl border border-brand-primary/30 bg-white mb-4">
            <div className="text-xs uppercase tracking-wider text-brand-dark/60 mb-1">
              Your shareable listing link
            </div>
            <div className="flex items-center gap-2">
              <code className="text-sm font-medium break-all flex-1">
                {typeof window !== "undefined" ? window.location.origin : ""}/profile/{publicRef}
              </code>
              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/profile/${publicRef}`;
                  navigator.clipboard.writeText(url);
                  toast.success("Listing link copied");
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-primary text-white text-sm whitespace-nowrap"
              >
                <Copy className="size-4" /> Copy My Listing Link
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between p-4 rounded-2xl border border-brand-dark/10 bg-white mb-6">
          <div>
            <div className="font-medium">Visibility</div>
            <div className="text-sm text-brand-dark/60">
              {first.is_hidden
                ? "Your listing is hidden from the noticeboard."
                : "Your listing is live on the noticeboard."}
            </div>
          </div>
          <button
            onClick={() => toggleHidden(!first.is_hidden)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-dark/15 hover:bg-brand-soft text-sm"
          >
            {first.is_hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            {first.is_hidden ? "Make visible" : "Hide"}
          </button>
        </div>

        <h2 className="text-xl font-heading font-semibold mb-3">Contact requests</h2>
        {requests.length === 0 ? (
          <div className="text-center py-10 text-brand-dark/60 border border-dashed border-brand-dark/15 rounded-2xl">
            No requests yet.
          </div>
        ) : (
          <ul className="space-y-3">
            {requests.map((r) => (
              <li
                key={r.request_id!}
                className="p-4 rounded-2xl border border-brand-dark/10 bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium">{r.requester_name}</div>
                    <div className="text-sm text-brand-dark/60 mt-0.5">{r.requester_contact}</div>
                    {r.message && (
                      <p className="text-sm text-brand-dark/80 mt-2 whitespace-pre-line">
                        {r.message}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={r.status!} />
                </div>
                {r.status === "pending" && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => decide(r.request_id!, "approved")}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm"
                    >
                      <Check className="size-4" /> Share my contact details
                    </button>
                    <button
                      onClick={() => decide(r.request_id!, "declined")}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-brand-dark/15 text-sm"
                    >
                      <X className="size-4" /> Decline
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </SiteLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    declined: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ${styles[status] ?? "bg-brand-soft"}`}
    >
      {status}
    </span>
  );
}
