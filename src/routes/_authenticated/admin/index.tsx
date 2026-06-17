import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { PROVIDER_STATUS_LABELS, SERVICE_CATEGORIES, categoryLabel } from "@/lib/constants";
import { LogOut, Users, HelpingHand, MessageCircle, Heart, FileText, Download, ShieldAlert, ShieldCheck, Clock, HelpCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Hineni" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [serviceFilter, setServiceFilter] = useState<string>("");
  const [townFilter, setTownFilter] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data.user?.email ?? null);
      if (data.user) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .eq("role", "admin")
          .maybeSingle();
        setIsAdmin(!!roles);
      }
    })();
  }, []);

  const providers = useQuery({
    queryKey: ["admin_providers", statusFilter, serviceFilter, townFilter],
    enabled: isAdmin === true,
    queryFn: async () => {
      let q = supabase
        .from("service_providers")
        .select(
          "id, application_code, full_name, town, services, status, created_at, mobile_number, available_immediately",
        )
        .order("created_at", { ascending: false });
      if (statusFilter) q = q.eq("status", statusFilter as never);
      if (serviceFilter) q = q.contains("services", [serviceFilter]);
      if (townFilter) q = q.ilike("town", `%${townFilter}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const requests = useQuery({
    queryKey: ["admin_requests"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { data } = await supabase
        .from("service_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  const contacts = useQuery({
    queryKey: ["admin_contacts"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { data } = await supabase
        .from("contact_requests")
        .select("*, service_providers(display_name, full_name)")
        .order("created_at", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  const donations = useQuery({
    queryKey: ["admin_donations"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { data } = await supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  // Buckets across all 3 applicant tables for the new dashboard sections.
  const buckets = useQuery({
    queryKey: ["admin_buckets"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const sel =
        "id, full_name, status, verification_level, pcc_status, pcc_wants_assistance, pcc_verified, identity_verified, references_checked, interview_completed, work_permit_required, work_permit_verified, created_at";
      const [{ data: sp }, { data: ap }, { data: yp }] = await Promise.all([
        supabase.from("service_providers").select(sel),
        supabase.from("apprentices").select(sel),
        supabase.from("youth_profiles").select(sel),
      ]);
      const tag = (rows: any[] | null, t: string) => (rows ?? []).map((r) => ({ ...r, _type: t }));
      return [...tag(sp, "service_provider"), ...tag(ap, "apprentice"), ...tag(yp, "youth")];
    },
  });

  const safety = useQuery({
    queryKey: ["admin_safety"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { data } = await supabase
        .from("safety_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  if (isAdmin === null) {
    return (
      <SiteLayout>
        <div className="py-20 text-center text-brand-dark/60">Loading…</div>
      </SiteLayout>
    );
  }

  if (!isAdmin) {
    return (
      <SiteLayout>
        <div className="max-w-xl mx-auto px-6 py-16 text-center">
          <h1 className="text-2xl font-heading font-bold mb-3">Admin access required</h1>
          <p className="text-brand-dark/70 mb-6">
            You're signed in as <strong>{userEmail}</strong>, but this account does not have the
            admin role yet. Ask a Hineni administrator to grant you access.
          </p>
          <p className="text-sm text-brand-dark/50 mb-6 bg-brand-soft p-4 rounded-xl">
            <strong>First-time setup:</strong> the first admin must be granted manually. Open the
            backend's SQL editor and run:
            <code className="block mt-2 text-xs bg-white p-2 rounded">
              INSERT INTO public.user_roles (user_id, role)<br />
              SELECT id, 'admin' FROM auth.users WHERE email = '{userEmail}';
            </code>
          </p>
          <button
            onClick={signOut}
            className="px-5 py-2.5 rounded-xl border border-brand-dark/10 hover:bg-brand-soft text-sm"
          >
            Sign out
          </button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-heading font-bold">Admin Dashboard</h1>
            <p className="text-sm text-brand-dark/60">Signed in as {userEmail}</p>
          </div>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-dark/10 text-sm hover:bg-brand-soft"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard icon={<Users />} label="Applicants" value={providers.data?.length ?? 0} />
          <StatCard icon={<HelpingHand />} label="Requests" value={requests.data?.length ?? 0} />
          <StatCard icon={<MessageCircle />} label="Contact requests" value={contacts.data?.length ?? 0} />
          <StatCard icon={<Heart />} label="Donations" value={donations.data?.length ?? 0} />
        </div>

        <section className="bg-white border border-brand-dark/5 rounded-2xl p-5 mb-8">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <h2 className="font-heading text-xl font-semibold">Applicants</h2>
            <button
              onClick={() => exportProvidersCSV(providers.data ?? [])}
              className="text-sm inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-brand-dark/10 hover:bg-brand-soft"
            >
              <Download className="size-4" /> Export CSV
            </button>
          </div>
          <div className="grid sm:grid-cols-3 gap-2 mb-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-brand-dark/10 bg-white text-sm"
            >
              <option value="">All statuses</option>
              {Object.entries(PROVIDER_STATUS_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-brand-dark/10 bg-white text-sm"
            >
              <option value="">All services</option>
              {SERVICE_CATEGORIES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <input
              value={townFilter}
              onChange={(e) => setTownFilter(e.target.value)}
              placeholder="Town"
              className="px-3 py-2 rounded-lg border border-brand-dark/10 bg-white text-sm"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-brand-dark/50 border-b border-brand-dark/5">
                <tr>
                  <th className="py-2 pr-3">Code</th>
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Town</th>
                  <th className="py-2 pr-3">Services</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3"></th>
                </tr>
              </thead>
              <tbody>
                {(providers.data ?? []).map((p) => (
                  <tr key={p.id} className="border-b border-brand-dark/5">
                    <td className="py-3 pr-3 font-mono text-xs">{p.application_code}</td>
                    <td className="py-3 pr-3 font-medium">{p.full_name}</td>
                    <td className="py-3 pr-3 text-brand-dark/70">{p.town}</td>
                    <td className="py-3 pr-3 text-brand-dark/70">
                      {(p.services ?? []).slice(0, 2).map(categoryLabel).join(", ")}
                      {(p.services ?? []).length > 2 ? "…" : ""}
                    </td>
                    <td className="py-3 pr-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-brand-soft">
                        {PROVIDER_STATUS_LABELS[p.status]}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-right">
                      <Link
                        to="/admin/providers/$id"
                        params={{ id: p.id }}
                        className="text-brand-primary text-sm font-medium hover:underline"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
                {providers.data?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-brand-dark/50">
                      No applicants match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-6">
          <Panel title="Recent service requests" icon={<HelpingHand />}>
            <ul className="divide-y divide-brand-dark/5 text-sm">
              {(requests.data ?? []).slice(0, 8).map((r) => (
                <li key={r.id} className="py-2.5">
                  <div className="font-medium">
                    {r.requester_name} — {categoryLabel(r.service_needed)}
                  </div>
                  <div className="text-xs text-brand-dark/60">
                    {r.location} · {r.contact_number} · status: {r.status}
                  </div>
                </li>
              ))}
              {requests.data?.length === 0 && (
                <li className="py-6 text-center text-brand-dark/50">No requests yet.</li>
              )}
            </ul>
          </Panel>
          <Panel title="Contact requests" icon={<MessageCircle />}>
            <ul className="divide-y divide-brand-dark/5 text-sm">
              {(contacts.data ?? []).slice(0, 8).map((c: any) => (
                <li key={c.id} className="py-2.5">
                  <div className="font-medium">
                    {c.requester_name} → {c.service_providers?.display_name ?? c.service_providers?.full_name ?? "Provider"}
                  </div>
                  <div className="text-xs text-brand-dark/60">{c.requester_contact} · {c.status}</div>
                </li>
              ))}
              {contacts.data?.length === 0 && (
                <li className="py-6 text-center text-brand-dark/50">No contact requests yet.</li>
              )}
            </ul>
          </Panel>
          <Panel title="Recent donations" icon={<Heart />}>
            <ul className="divide-y divide-brand-dark/5 text-sm">
              {(donations.data ?? []).slice(0, 8).map((d) => (
                <li key={d.id} className="py-2.5 flex justify-between">
                  <div>
                    <div className="font-medium">
                      {d.anonymous ? "Anonymous" : d.donor_name ?? "Supporter"}
                    </div>
                    <div className="text-xs text-brand-dark/60">
                      {d.purpose} · {d.frequency} · {d.payment_status}
                    </div>
                  </div>
                  <div className="font-medium">R{(d.amount_cents / 100).toFixed(0)}</div>
                </li>
              ))}
              {donations.data?.length === 0 && (
                <li className="py-6 text-center text-brand-dark/50">No donations yet.</li>
              )}
            </ul>
          </Panel>
          <Panel title="Vetting PDF records" icon={<FileText />}>
            <p className="text-sm text-brand-dark/60">
              Open any applicant from the list above to generate a confidential vetting PDF for police
              or external partners. Every export is recorded in the audit log.
            </p>
          </Panel>
        </div>
      </div>
    </SiteLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white border border-brand-dark/5 rounded-2xl p-4 flex items-center gap-3">
      <div className="size-10 rounded-full bg-brand-primary/10 text-brand-primary grid place-items-center">
        {icon}
      </div>
      <div>
        <div className="text-xl font-heading font-bold leading-none">{value}</div>
        <div className="text-xs text-brand-dark/60 mt-1">{label}</div>
      </div>
    </div>
  );
}

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-brand-dark/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="text-brand-primary">{icon}</div>
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function exportProvidersCSV(rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) {
    toast.error("Nothing to export");
    return;
  }
  const header = ["application_code", "full_name", "town", "services", "status", "mobile_number", "created_at"];
  const csv = [
    header.join(","),
    ...rows.map((r) =>
      header
        .map((h) => {
          const v = r[h];
          const s = Array.isArray(v) ? v.join(";") : String(v ?? "");
          return `"${s.replace(/"/g, '""')}"`;
        })
        .join(","),
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hineni-applicants-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
