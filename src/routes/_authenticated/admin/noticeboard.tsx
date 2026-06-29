import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Archive,
  ArchiveRestore,
  Ban,
  ExternalLink,
  Eye,
  EyeOff,
  Flag,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/noticeboard")({
  head: () => ({ meta: [{ title: "Noticeboard Admin — Overberg Skills Connect" }] }),
  component: NoticeboardAdmin,
});

type Stats = {
  active_listings: number;
  archived_listings: number;
  awaiting_renewal: number;
  contact_requests: number;
  new_this_month: number;
  most_common_skills: { skill: string; count: number }[];
  most_active_towns: { town: string; count: number }[];
};

type Profile = {
  id: string;
  name: string;
  town: string;
  skills: string[];
  is_hidden: boolean;
  is_suspended: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  last_login_at: string | null;
  last_contact_request_at: string | null;
  archived_at: string | null;
};

type ReportRow = {
  id: string;
  profile_id: string;
  reason: string;
  details: string | null;
  reporter_contact: string | null;
  status: string;
  created_at: string;
};

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function NoticeboardAdmin() {
  const qc = useQueryClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"active" | "archived" | "renewal" | "all">("active");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return setIsAdmin(false);
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!role);
    })();
  }, []);

  const stats = useQuery({
    queryKey: ["nb_admin_stats"],
    enabled: isAdmin === true,
    queryFn: async (): Promise<Stats> => {
      const { data, error } = await supabase.rpc("noticeboard_admin_stats");
      if (error) throw error;
      return data as unknown as Stats;
    },
  });

  const profiles = useQuery({
    queryKey: ["nb_admin_profiles"],
    enabled: isAdmin === true,
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase
        .from("noticeboard_profiles")
        .select(
          "id,name,town,skills,is_hidden,is_suspended,is_archived,created_at,updated_at,last_activity_at,last_login_at,last_contact_request_at,archived_at",
        )
        .order("last_activity_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Profile[];
    },
  });

  const reports = useQuery({
    queryKey: ["nb_admin_reports"],
    enabled: isAdmin === true,
    queryFn: async (): Promise<ReportRow[]> => {
      const { data, error } = await supabase
        .from("noticeboard_reports")
        .select("id,profile_id,reason,details,reporter_contact,status,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ReportRow[];
    },
  });

  async function patchProfile(id: string, patch: Partial<Profile>) {
    const { error } = await supabase
      .from("noticeboard_profiles")
      .update(patch as never)
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    qc.invalidateQueries({ queryKey: ["nb_admin_profiles"] });
    qc.invalidateQueries({ queryKey: ["nb_admin_stats"] });
  }

  async function deleteListing(id: string, name: string) {
    if (!confirm(`Permanently delete "${name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("noticeboard_profiles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Listing deleted");
    qc.invalidateQueries({ queryKey: ["nb_admin_profiles"] });
    qc.invalidateQueries({ queryKey: ["nb_admin_stats"] });
  }

  const filtered = useMemo(() => {
    const list = profiles.data ?? [];
    const now = Date.now();
    const sixtyDays = 60 * 24 * 60 * 60 * 1000;
    const base = list.filter((p) => {
      if (tab === "all") return true;
      if (tab === "archived") return p.is_archived;
      if (tab === "active") return !p.is_archived;
      if (tab === "renewal")
        return !p.is_archived && now - new Date(p.last_activity_at).getTime() > sixtyDays;
      return true;
    });
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.town.toLowerCase().includes(q) ||
        p.skills.join(" ").toLowerCase().includes(q),
    );
  }, [profiles.data, query, tab]);

  if (isAdmin === null) {
    return (
      <SiteLayout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center text-brand-dark/50">
          Loading…
        </div>
      </SiteLayout>
    );
  }
  if (!isAdmin) {
    return (
      <SiteLayout>
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-heading font-bold mb-2">Admin access required</h1>
          <Link to="/" className="text-brand-primary underline">
            Go home
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-heading font-bold">Noticeboard Administration</h1>
          <p className="text-sm text-brand-dark/60 mt-1">
            Platform management — not an endorsement of any worker listed.
          </p>
        </header>

        {/* STATS */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          <StatCard label="Active" value={stats.data?.active_listings} />
          <StatCard label="Archived" value={stats.data?.archived_listings} />
          <StatCard label="Awaiting renewal" value={stats.data?.awaiting_renewal} tone="amber" />
          <StatCard label="Contact requests" value={stats.data?.contact_requests} />
          <StatCard label="New this month" value={stats.data?.new_this_month} tone="emerald" />
        </section>

        <section className="grid sm:grid-cols-2 gap-4 mb-8">
          <RankPanel
            title="Most common skills"
            items={stats.data?.most_common_skills?.map((s) => ({ label: s.skill, count: s.count }))}
          />
          <RankPanel
            title="Most active towns"
            items={stats.data?.most_active_towns?.map((t) => ({ label: t.town, count: t.count }))}
          />
        </section>

        {/* REPORTS */}
        <section className="mb-10">
          <h2 className="text-xl font-heading font-semibold mb-3 flex items-center gap-2">
            <Flag className="size-5" /> Reports
          </h2>
          {!reports.data || reports.data.length === 0 ? (
            <div className="p-5 rounded-2xl border border-dashed border-brand-dark/15 text-sm text-brand-dark/60">
              No reports.
            </div>
          ) : (
            <ul className="space-y-2">
              {reports.data.slice(0, 10).map((r) => (
                <li
                  key={r.id}
                  className="p-3 rounded-xl border border-brand-dark/10 bg-white flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{r.reason}</div>
                    <div className="text-xs text-brand-dark/60">
                      {fmtDate(r.created_at)} ·{" "}
                      <Link
                        to="/profile/$id"
                        params={{ id: r.profile_id }}
                        className="underline inline-flex items-center gap-1"
                      >
                        View profile <ExternalLink className="size-3" />
                      </Link>
                    </div>
                    {r.details && (
                      <p className="text-sm text-brand-dark/80 mt-1 whitespace-pre-line">
                        {r.details}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] uppercase tracking-widest bg-brand-soft px-2 py-1 rounded-full shrink-0">
                    {r.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* LISTINGS */}
        <section>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-3">
            <h2 className="text-xl font-heading font-semibold">Listings</h2>
            <div className="flex gap-2 flex-wrap">
              {(["active", "renewal", "archived", "all"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={
                    "px-3 py-1.5 rounded-full text-xs border " +
                    (tab === t
                      ? "bg-brand-primary text-white border-brand-primary"
                      : "border-brand-dark/15 text-brand-dark/70")
                  }
                >
                  {t === "renewal" ? "Awaiting renewal" : t[0].toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-dark/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, town or skill…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-brand-dark/10 bg-white"
              spellCheck
            />
          </div>

          <div className="overflow-x-auto border border-brand-dark/10 rounded-2xl bg-white">
            <table className="w-full text-sm">
              <thead className="bg-brand-soft text-brand-dark/70 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-3 py-2">Name</th>
                  <th className="text-left px-3 py-2">Town</th>
                  <th className="text-left px-3 py-2">Created</th>
                  <th className="text-left px-3 py-2">Updated</th>
                  <th className="text-left px-3 py-2">Last login</th>
                  <th className="text-left px-3 py-2">Last request</th>
                  <th className="text-left px-3 py-2">Last activity</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-right px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const status = p.is_archived
                    ? { label: "Archived", cls: "text-slate-700" }
                    : p.is_suspended
                      ? { label: "Suspended", cls: "text-red-700" }
                      : p.is_hidden
                        ? { label: "Hidden", cls: "text-amber-700" }
                        : { label: "Live", cls: "text-emerald-700" };
                  return (
                    <tr key={p.id} className="border-t border-brand-dark/5 align-top">
                      <td className="px-3 py-2 font-medium">
                        <Link
                          to="/profile/$id"
                          params={{ id: p.id }}
                          className="hover:underline"
                        >
                          {p.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{p.town}</td>
                      <td className="px-3 py-2 text-brand-dark/60">{fmtDate(p.created_at)}</td>
                      <td className="px-3 py-2 text-brand-dark/60">{fmtDate(p.updated_at)}</td>
                      <td className="px-3 py-2 text-brand-dark/60">{fmtDate(p.last_login_at)}</td>
                      <td className="px-3 py-2 text-brand-dark/60">
                        {fmtDate(p.last_contact_request_at)}
                      </td>
                      <td className="px-3 py-2 text-brand-dark/60">
                        {fmtDate(p.last_activity_at)}
                      </td>
                      <td className="px-3 py-2">
                        <span className={status.cls}>{status.label}</span>
                      </td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        <div className="inline-flex flex-wrap justify-end gap-1">
                          {p.is_hidden ? (
                            <IconBtn
                              onClick={() => patchProfile(p.id, { is_hidden: false })}
                              icon={<Eye className="size-3" />}
                              label="Unhide"
                            />
                          ) : (
                            <IconBtn
                              onClick={() => patchProfile(p.id, { is_hidden: true })}
                              icon={<EyeOff className="size-3" />}
                              label="Hide"
                            />
                          )}
                          {p.is_suspended ? (
                            <IconBtn
                              onClick={() => patchProfile(p.id, { is_suspended: false })}
                              icon={<RotateCcw className="size-3" />}
                              label="Unsuspend"
                            />
                          ) : (
                            <IconBtn
                              onClick={() => patchProfile(p.id, { is_suspended: true })}
                              icon={<Ban className="size-3" />}
                              label="Suspend"
                              tone="red"
                            />
                          )}
                          {p.is_archived ? (
                            <IconBtn
                              onClick={() =>
                                patchProfile(p.id, {
                                  is_archived: false,
                                  archived_at: null,
                                  last_activity_at: new Date().toISOString(),
                                } as Partial<Profile>)
                              }
                              icon={<ArchiveRestore className="size-3" />}
                              label="Restore"
                            />
                          ) : (
                            <IconBtn
                              onClick={() =>
                                patchProfile(p.id, {
                                  is_archived: true,
                                  archived_at: new Date().toISOString(),
                                } as Partial<Profile>)
                              }
                              icon={<Archive className="size-3" />}
                              label="Archive"
                            />
                          )}
                          <IconBtn
                            onClick={() => deleteListing(p.id, p.name)}
                            icon={<Trash2 className="size-3" />}
                            label="Delete"
                            tone="red"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-3 py-8 text-center text-brand-dark/50 text-sm"
                    >
                      No listings match.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | undefined;
  tone?: "amber" | "emerald";
}) {
  const toneCls =
    tone === "amber"
      ? "text-amber-700"
      : tone === "emerald"
        ? "text-emerald-700"
        : "text-brand-dark";
  return (
    <div className="p-4 rounded-2xl border border-brand-dark/10 bg-white">
      <div className="text-xs uppercase tracking-wider text-brand-dark/60">{label}</div>
      <div className={"text-2xl font-heading font-bold mt-1 " + toneCls}>
        {value ?? "—"}
      </div>
    </div>
  );
}

function RankPanel({
  title,
  items,
}: {
  title: string;
  items?: { label: string; count: number }[];
}) {
  return (
    <div className="p-4 rounded-2xl border border-brand-dark/10 bg-white">
      <div className="text-sm font-semibold mb-2">{title}</div>
      {!items || items.length === 0 ? (
        <p className="text-sm text-brand-dark/50">No data yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((i) => (
            <li key={i.label} className="flex justify-between text-sm">
              <span className="truncate">{i.label}</span>
              <span className="text-brand-dark/60">{i.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function IconBtn({
  onClick,
  icon,
  label,
  tone,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  tone?: "red";
}) {
  const cls =
    tone === "red"
      ? "border-red-200 text-red-700 hover:bg-red-50"
      : "border-brand-dark/15 text-brand-dark/80 hover:bg-brand-soft";
  return (
    <button
      type="button"
      onClick={onClick}
      className={"inline-flex items-center gap-1 px-2 py-1 rounded border text-xs " + cls}
    >
      {icon} {label}
    </button>
  );
}
