import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { Phone, Copy, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/my-requests")({
  component: MyRequests,
});

type Row = {
  id: string;
  profile_id: string;
  worker_name: string;
  worker_skills: string[] | null;
  status: "pending" | "approved" | "declined";
  phone: string | null;
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

function MyRequests() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-requests"],
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase.rpc("noticeboard_my_requests");
      if (error) throw error;
      return (data ?? []) as Row[];
    },
    refetchInterval: 30000,
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
          My Contact Requests
        </h1>
        <p className="text-brand-dark/60 mb-8">
          When a worker approves your request, their phone number appears here.
        </p>

        {rows.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-brand-dark/15 rounded-2xl">
            <div className="text-5xl mb-3" aria-hidden>📨</div>
            <p className="text-brand-dark/70 mb-4">You haven't sent any requests yet.</p>
            <Link
              to="/find-help"
              className="inline-flex px-5 py-3 rounded-xl bg-brand-primary text-white font-medium"
            >
              Browse skills
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {rows.map((r) => (
              <RequestCard key={r.id} row={r} />
            ))}
          </ul>
        )}
      </div>
    </SiteLayout>
  );
}

function RequestCard({ row }: { row: Row }) {
  const primarySkill = row.worker_skills?.[0];
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
            label: "Pending Approval",
            icon: <Clock className="size-4" />,
            cls: "bg-amber-100 text-amber-900",
          };

  function copy() {
    if (!row.phone) return;
    navigator.clipboard.writeText(row.phone);
    toast.success("Number copied");
  }

  return (
    <li className="bg-white rounded-2xl border border-brand-dark/10 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-heading font-semibold text-lg truncate">{row.worker_name}</div>
          {primarySkill && (
            <div className="text-sm text-brand-dark/60 truncate">{primarySkill}</div>
          )}
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

      {row.status === "approved" && row.phone && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
          <div className="text-xs uppercase tracking-wider text-emerald-800/70 mb-1">
            Phone number
          </div>
          <div className="text-2xl font-heading font-bold text-emerald-800 mb-3">
            {row.phone}
          </div>
          <div className="flex gap-2">
            <a
              href={`tel:${row.phone}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-medium"
            >
              <Phone className="size-4" /> Call
            </a>
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-300 text-emerald-800"
            >
              <Copy className="size-4" /> Copy Number
            </button>
          </div>
        </div>
      )}

      {row.status === "pending" && (
        <p className="mt-3 text-sm text-brand-dark/60">
          Waiting for {row.worker_name} to respond.
        </p>
      )}
      {row.status === "declined" && (
        <p className="mt-3 text-sm text-brand-dark/60">
          {row.worker_name} chose not to share their contact details.
        </p>
      )}
    </li>
  );
}
