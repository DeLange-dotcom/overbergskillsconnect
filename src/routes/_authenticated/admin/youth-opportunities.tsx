import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/youth-opportunities")({
  head: () => ({ meta: [{ title: "Admin · Youth opportunities — Hineni" }] }),
  component: AdminYouthOpportunities,
});

function AdminYouthOpportunities() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin_youth_opps"],
    queryFn: async () => {
      const { data } = await supabase
        .from("youth_opportunities")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  async function setStatus(id: string, status: "approved" | "rejected" | "closed" | "pending") {
    const { error } = await supabase
      .from("youth_opportunities")
      .update({ status, child_safe_reviewed: status === "approved" ? true : undefined })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Status: ${status}`);
    qc.invalidateQueries({ queryKey: ["admin_youth_opps"] });
  }

  return (
    <SiteLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-heading font-bold">Youth opportunities</h1>
            <p className="text-sm text-brand-dark/60">Review and approve organisations' postings.</p>
          </div>
          <Link to="/admin/youth" className="px-4 py-2 rounded-xl border border-brand-dark/10 text-sm hover:bg-brand-soft">
            ← Youth registrations
          </Link>
        </div>

        <div className="space-y-3">
          {(q.data ?? []).map((o) => (
            <article key={o.id} className="bg-white border border-brand-dark/5 rounded-2xl p-5">
              <div className="flex justify-between gap-3 flex-wrap mb-2">
                <div>
                  <h3 className="font-heading text-lg font-semibold">{o.title}</h3>
                  <div className="text-sm text-brand-dark/60">
                    {o.organisation_name} · {o.town} · ages {o.min_age}–{o.max_age} · {o.category}
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-brand-soft self-start">{o.status}</span>
              </div>
              <p className="text-sm text-brand-dark/70 my-3">{o.description}</p>
              <div className="text-xs text-brand-dark/60 mb-3 flex flex-wrap gap-3">
                <span>Contact: {o.contact_name} · {o.contact_email} {o.contact_phone ? `· ${o.contact_phone}` : ""}</span>
                {o.hazardous_flag && <span className="text-amber-700">⚠ hazardous</span>}
                {o.prohibited_for_minors && <span className="text-amber-700">18+ only</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {(["approved", "rejected", "closed", "pending"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(o.id, s)}
                    className={`px-3 py-1.5 text-xs rounded-full ${
                      o.status === s
                        ? "bg-brand-primary text-white"
                        : "border border-brand-dark/10 hover:bg-brand-soft"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </article>
          ))}
          {q.data?.length === 0 && (
            <div className="bg-white border border-brand-dark/5 rounded-2xl p-10 text-center text-brand-dark/50">
              No opportunities submitted yet.
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
