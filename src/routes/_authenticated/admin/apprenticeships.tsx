import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/apprenticeships")({
  component: AdminApp,
});

type Row = { id: string; created_at: string; [k: string]: unknown };

function AdminApp() {
  const [tab, setTab] = useState<"apprentices" | "providers" | "opportunities" | "mentors" | "mentorship_requests" | "placements">("apprentices");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const table =
        tab === "apprentices" ? "apprentices"
        : tab === "providers" ? "apprenticeship_providers"
        : tab === "opportunities" ? "apprenticeship_opportunities"
        : tab === "mentorship_requests" ? "mentorship_requests"
        : tab === "placements" ? "placements"
        : "mentors";
      const { data } = await supabase.from(table as never).select("*").order("created_at", { ascending: false }).limit(100);
      setRows((data as Row[] | null) ?? []);
      setLoading(false);
    })();
  }, [tab]);

  async function approve(table: string, id: string) {
    await supabase.from(table as never).update({ approved: true, status: "approved" } as never).eq("id", id);
    setRows((r) => r.map((x) => (x.id === id ? { ...x, approved: true } : x)));
  }

  async function approveOpportunity(id: string) {
    await supabase.from("apprenticeship_opportunities").update({ approved: true } as never).eq("id", id);
    setRows((r) => r.map((x) => (x.id === id ? { ...x, approved: true } : x)));
  }

  return (
    <SiteLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-heading font-bold">Apprenticeships Admin</h1>
          <Link to="/admin" className="text-sm text-brand-primary underline">← Admin home</Link>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {(["apprentices","providers","opportunities","mentors","mentorship_requests","placements"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-sm capitalize ${tab === t ? "bg-brand-primary text-white" : "bg-white border border-brand-dark/10 hover:bg-brand-soft"}`}>
              {t.replace("_", " ")}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center text-brand-dark/50"><Loader2 className="size-6 animate-spin inline" /></div>
        ) : rows.length === 0 ? (
          <div className="bg-brand-soft/50 rounded-2xl p-10 text-center text-brand-dark/70">No records.</div>
        ) : (
          <div className="bg-white rounded-2xl border border-brand-dark/10 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-soft/50 text-brand-dark/70">
                <tr>
                  <th className="text-left px-3 py-2">Name / Title</th>
                  <th className="text-left px-3 py-2">Detail</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-left px-3 py-2">Created</th>
                  <th className="text-left px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-brand-dark/5">
                    <td className="px-3 py-2 font-medium">
                      {(r.full_name as string) ?? (r.organisation_name as string) ?? (r.title as string) ?? r.id.slice(0,8)}
                    </td>
                    <td className="px-3 py-2 text-brand-dark/70">
                      {(r.town as string) ?? (r.industry as string) ?? (r.email as string) ?? "—"}
                    </td>
                    <td className="px-3 py-2">
                      {String(r.status ?? "—")}
                      {r.approved ? <span className="ml-2 text-brand-primary text-xs">✓ approved</span> : null}
                    </td>
                    <td className="px-3 py-2 text-brand-dark/60">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="px-3 py-2">
                      {tab === "apprentices" && (
                        <Link
                          to="/admin/apprentices/$id"
                          params={{ id: r.id }}
                          className="text-brand-primary text-xs font-medium hover:underline mr-3"
                        >
                          Open
                        </Link>
                      )}
                      {tab === "mentors" && !r.approved && (
                        <button onClick={() => approve("mentors", r.id)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-brand-primary text-white">
                          <CheckCircle className="size-3" /> Approve
                        </button>
                      )}
                      {tab === "providers" && !r.approved && r.status !== "approved" && (
                        <button onClick={() => approve("apprenticeship_providers", r.id)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-brand-primary text-white">
                          <CheckCircle className="size-3" /> Approve
                        </button>
                      )}
                      {tab === "opportunities" && !r.approved && (
                        <button onClick={() => approveOpportunity(r.id)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-brand-primary text-white">
                          <CheckCircle className="size-3" /> Publish
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
