import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { Clock, CheckCircle2, XCircle, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/my-requests")({
  component: MyRequests,
});

type Row = {
  id: string;
  requester_name: string;
  requester_contact: string | null;
  message: string | null;
  status: "pending" | "approved" | "declined";
  created_at: string;
  decided_at: string | null;
};

function fmtDate(s: string) {
  try {
    return new Date(s).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return s;
  }
}

function firstName(full: string) {
  return (full || "").trim().split(/\s+/)[0] || full;
}

function MyRequests() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["my-incoming-requests"],
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase.rpc("noticeboard_my_incoming_requests");
      if (error) throw error;
      return (data ?? []) as Row[];
    },
    refetchInterval: 30000,
  });

  const decide = useMutation({
    mutationFn: async (vars: { id: string; decision: "approved" | "declined" }) => {
      const { error } = await supabase.rpc("noticeboard_my_decide", {
        _request_id: vars.id,
        _decision: vars.decision,
      });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      toast.success(vars.decision === "approved" ? "Request approved" : "Request declined");
      qc.invalidateQueries({ queryKey: ["my-incoming-requests"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center text-brand-dark/60">
          <Loader2 className="size-6 animate-spin mx-auto mb-3" />
          Loading…
        </div>
      </SiteLayout>
    );
  }

  const rows = data ?? [];

  return (
    <SiteLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-2">
          People Interested In Me
        </h1>
        <p className="text-brand-dark/60 mb-8">
          When someone asks for your contact details, approve the request to share your phone
          number, or decline to keep it private.
        </p>

        {rows.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-brand-dark/15 rounded-2xl">
            <div className="text-5xl mb-3" aria-hidden>📨</div>
            <p className="text-brand-dark/70 mb-4">No one has requested your details yet.</p>
            <Link
              to="/my-advert"
              className="inline-flex px-5 py-3 rounded-xl bg-brand-primary text-white font-medium"
            >
              Manage my listing
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {rows.map((r) => (
              <RequestCard
                key={r.id}
                row={r}
                busy={decide.isPending}
                onDecide={(decision) => decide.mutate({ id: r.id, decision })}
              />
            ))}
          </ul>
        )}
      </div>
    </SiteLayout>
  );
}

function RequestCard({
  row,
  busy,
  onDecide,
}: {
  row: Row;
  busy: boolean;
  onDecide: (decision: "approved" | "declined") => void;
}) {
  const name = firstName(row.requester_name);
  const badge =
    row.status === "approved"
      ? {
          label: "Approved",
          icon: <CheckCircle2 className="size-4" />,
          cls: "bg-emerald-100 text-emerald-800",
        }
      : row.status === "declined"
        ? {
            label: "Declined",
            icon: <XCircle className="size-4" />,
            cls: "bg-red-100 text-red-800",
          }
        : {
            label: "Pending",
            icon: <Clock className="size-4" />,
            cls: "bg-amber-100 text-amber-900",
          };

  return (
    <li className="bg-white rounded-2xl border border-brand-dark/10 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-heading font-semibold text-lg truncate">{name}</div>
          <div className="text-xs text-brand-dark/50 mt-1">
            Requested {fmtDate(row.created_at)}
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${badge.cls}`}
        >
          {badge.icon}
          {badge.label}
        </span>
      </div>

      {row.message && (
        <p className="mt-3 text-sm text-brand-dark/80 whitespace-pre-line">
          “{row.message}”
        </p>
      )}

      {row.status === "pending" && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => onDecide("approved")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-medium disabled:opacity-60"
          >
            <Check className="size-4" /> Approve
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onDecide("declined")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-dark/15 text-brand-dark/80 disabled:opacity-60"
          >
            <X className="size-4" /> Decline
          </button>
        </div>
      )}

      {row.status === "approved" && (
        <p className="mt-3 text-sm text-emerald-700">
          {name} can now see your phone number.
        </p>
      )}
      {row.status === "declined" && (
        <p className="mt-3 text-sm text-brand-dark/60">
          You declined to share your details with {name}.
        </p>
      )}
    </li>
  );
}
