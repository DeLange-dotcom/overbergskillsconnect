import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/youth/")({
  head: () => ({ meta: [{ title: "Admin · Youth — Hineni" }] }),
  component: AdminYouthList,
});

function AdminYouthList() {
  const q = useQuery({
    queryKey: ["admin_youth_profiles"],
    queryFn: async () => {
      const { data } = await supabase
        .from("youth_profiles")
        .select("id, application_code, full_name, age_group, town, status, created_at, guardian_consent_given")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <SiteLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-heading font-bold">Youth registrations</h1>
            <p className="text-sm text-brand-dark/60">
              Review applications, approve, or hold for follow-up.
            </p>
          </div>
          <Link
            to="/admin/youth-opportunities"
            className="px-4 py-2 rounded-xl border border-brand-dark/10 text-sm hover:bg-brand-soft"
          >
            Manage opportunities →
          </Link>
        </div>

        <div className="bg-white border border-brand-dark/5 rounded-2xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-brand-dark/50 border-b border-brand-dark/5">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Age</th>
                <th className="py-3 px-4">Town</th>
                <th className="py-3 px-4">Guardian</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {(q.data ?? []).map((y) => (
                <tr key={y.id} className="border-b border-brand-dark/5">
                  <td className="py-3 px-4 font-mono text-xs">{y.application_code}</td>
                  <td className="py-3 px-4 font-medium">{y.full_name}</td>
                  <td className="py-3 px-4">{y.age_group}</td>
                  <td className="py-3 px-4 text-brand-dark/70">{y.town}</td>
                  <td className="py-3 px-4">
                    {y.age_group === "15-17"
                      ? y.guardian_consent_given
                        ? <span className="text-emerald-700 text-xs">✓ consent</span>
                        : <span className="text-amber-700 text-xs">missing</span>
                      : <span className="text-brand-dark/40 text-xs">n/a</span>}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-brand-soft">{y.status}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to="/admin/youth/$id"
                      params={{ id: y.id }}
                      className="text-brand-primary text-sm font-medium hover:underline"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
              {q.data?.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-brand-dark/50">
                    No youth registrations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SiteLayout>
  );
}
