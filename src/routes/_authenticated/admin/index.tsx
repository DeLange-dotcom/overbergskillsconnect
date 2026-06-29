import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Flag, EyeOff, Eye, Ban, RotateCcw, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { REPORT_REASONS } from "@/lib/noticeboard";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin — Overberg Skills Connect" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data.user?.email ?? null);
      if (data.user) {
        const { data: role } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .eq("role", "admin")
          .maybeSingle();
        setIsAdmin(!!role);
      } else setIsAdmin(false);
    })();
  }, []);

  const reports = useQuery({
    queryKey: ["admin_nb_reports"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("noticeboard_reports")
        .select("id, profile_id, reason, details, reporter_contact, status, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const profiles = useQuery({
    queryKey: ["admin_nb_profiles"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("noticeboard_profiles")
        .select("id, name, town, is_hidden, is_suspended, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function setProfile(id: string, patch: { is_hidden?: boolean; is_suspended?: boolean }) {
    const { error } = await supabase.from("noticeboard_profiles").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    qc.invalidateQueries({ queryKey: ["admin_nb_profiles"] });
  }

  async function setReportStatus(id: string, status: "reviewed" | "dismissed") {
    const { error } = await supabase.from("noticeboard_reports").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin_nb_reports"] });
  }

  if (isAdmin === null) {
    return (
      <SiteLayout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center text-brand-dark/50">Loading…</div>
      </SiteLayout>
    );
  }

  if (!isAdmin) {
    return (
      <SiteLayout>
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-heading font-bold mb-3">Admin access required</h1>
          <p className="text-brand-dark/60 mb-4">Signed in as {userEmail ?? "—"}</p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/auth" });
            }}
            className="px-4 py-2 rounded-lg border border-brand-dark/15"
          >
            Sign out
          </button>
        </div>
      </SiteLayout>
    );
  }

  const reasonLabel = (v: string) =>
    REPORT_REASONS.find((r) => r.value === v)?.label ?? v;

  return (
    <SiteLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-heading font-bold">Admin</h1>
            <p className="text-sm text-brand-dark/60">{userEmail}</p>
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/" });
            }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-brand-dark/15 text-sm"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>

        <div className="mb-8 p-4 rounded-2xl border border-brand-primary/30 bg-brand-soft/40 flex items-center justify-between gap-3">
          <div className="text-sm">
            <div className="font-medium">Noticeboard administration</div>
            <div className="text-brand-dark/60">
              Lifecycle, stats, search, archive & delete listings.
            </div>
          </div>
          <Link
            to="/admin/noticeboard"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-primary text-white text-sm whitespace-nowrap"
          >
            Open dashboard
          </Link>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-heading font-semibold mb-3 flex items-center gap-2">
            <Flag className="size-5" /> Reports
          </h2>
          {reports.isLoading ? (
            <p className="text-brand-dark/50">Loading…</p>
          ) : !reports.data || reports.data.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-brand-dark/15 text-brand-dark/60 text-sm">
              No reports yet.
            </div>
          ) : (
            <ul className="space-y-3">
              {reports.data.map((r) => (
                <li key={r.id} className="p-4 rounded-2xl border border-brand-dark/10 bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{reasonLabel(r.reason)}</div>
                      <div className="text-xs text-brand-dark/60 mt-0.5">
                        {new Date(r.created_at).toLocaleString()} ·{" "}
                        <Link
                          to="/profile/$id"
                          params={{ id: r.profile_id }}
                          className="inline-flex items-center gap-1 underline"
                        >
                          View profile <ExternalLink className="size-3" />
                        </Link>
                      </div>
                      {r.details && (
                        <p className="text-sm text-brand-dark/80 mt-2 whitespace-pre-line">
                          {r.details}
                        </p>
                      )}
                      {r.reporter_contact && (
                        <div className="text-xs text-brand-dark/60 mt-2">
                          Reporter: {r.reporter_contact}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] uppercase tracking-widest bg-brand-soft px-2 py-1 rounded-full">
                      {r.status}
                    </span>
                  </div>
                  {r.status === "open" && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => setProfile(r.profile_id, { is_hidden: true })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs"
                      >
                        <EyeOff className="size-3.5" /> Hide profile
                      </button>
                      <button
                        onClick={() => setProfile(r.profile_id, { is_suspended: true })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs"
                      >
                        <Ban className="size-3.5" /> Suspend
                      </button>
                      <button
                        onClick={() => setReportStatus(r.id, "reviewed")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-dark/15 text-xs"
                      >
                        Mark reviewed
                      </button>
                      <button
                        onClick={() => setReportStatus(r.id, "dismissed")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-dark/15 text-xs"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-xl font-heading font-semibold mb-3">All profiles</h2>
          {profiles.isLoading ? (
            <p className="text-brand-dark/50">Loading…</p>
          ) : (
            <div className="overflow-x-auto border border-brand-dark/10 rounded-2xl bg-white">
              <table className="w-full text-sm">
                <thead className="bg-brand-soft text-brand-dark/70 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-4 py-2">Name</th>
                    <th className="text-left px-4 py-2">Town</th>
                    <th className="text-left px-4 py-2">Posted</th>
                    <th className="text-left px-4 py-2">Status</th>
                    <th className="text-right px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(profiles.data ?? []).map((p) => (
                    <tr key={p.id} className="border-t border-brand-dark/5">
                      <td className="px-4 py-2">
                        <Link
                          to="/profile/$id"
                          params={{ id: p.id }}
                          className="hover:underline"
                        >
                          {p.name}
                        </Link>
                      </td>
                      <td className="px-4 py-2">{p.town}</td>
                      <td className="px-4 py-2 text-brand-dark/60">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">
                        {p.is_suspended ? (
                          <span className="text-red-700">Suspended</span>
                        ) : p.is_hidden ? (
                          <span className="text-amber-700">Hidden</span>
                        ) : (
                          <span className="text-emerald-700">Live</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right space-x-1">
                        {p.is_hidden ? (
                          <button
                            onClick={() => setProfile(p.id, { is_hidden: false })}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-brand-dark/15 text-xs"
                          >
                            <Eye className="size-3" /> Unhide
                          </button>
                        ) : (
                          <button
                            onClick={() => setProfile(p.id, { is_hidden: true })}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-brand-dark/15 text-xs"
                          >
                            <EyeOff className="size-3" /> Hide
                          </button>
                        )}
                        {p.is_suspended ? (
                          <button
                            onClick={() => setProfile(p.id, { is_suspended: false })}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-brand-dark/15 text-xs"
                          >
                            <RotateCcw className="size-3" /> Reinstate
                          </button>
                        ) : (
                          <button
                            onClick={() => setProfile(p.id, { is_suspended: true })}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-600 text-white text-xs"
                          >
                            <Ban className="size-3" /> Suspend
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </SiteLayout>
  );
}
