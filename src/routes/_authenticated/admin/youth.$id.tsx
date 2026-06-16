import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { BadgeChip } from "@/components/site/BadgeChip";
import { AdminPccPanel } from "@/components/site/AdminPccPanel";
import { VerificationBadge } from "@/components/site/VerificationBadge";
import { YOUTH_BADGES, YOUTH_INTERESTS, YOUTH_SKILLS, labelFromList } from "@/lib/youth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/youth/$id")({
  head: () => ({ meta: [{ title: "Admin · Youth profile — Hineni" }] }),
  component: AdminYouthDetail,
});

function AdminYouthDetail() {
  const { id } = useParams({ from: "/_authenticated/admin/youth/$id" });
  const qc = useQueryClient();

  const profileQ = useQuery({
    queryKey: ["admin_youth", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youth_profiles")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const badgesQ = useQuery({
    queryKey: ["admin_youth_badges", id],
    queryFn: async () => {
      const { data } = await supabase.from("youth_badges").select("*").eq("youth_profile_id", id);
      return data ?? [];
    },
  });

  async function updateStatus(status: "pending" | "approved" | "on_hold" | "rejected") {
    const { error } = await supabase
      .from("youth_profiles")
      .update({ status })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Status updated to ${status}`);
    qc.invalidateQueries({ queryKey: ["admin_youth", id] });
  }

  async function awardBadge(key: string) {
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("youth_badges").insert({
      youth_profile_id: id,
      badge_key: key as never,
      awarded_by: u.user?.id ?? null,
    });
    if (error) return toast.error(error.message);
    toast.success("Badge awarded");
    qc.invalidateQueries({ queryKey: ["admin_youth_badges", id] });
  }

  async function revokeBadge(badgeId: string) {
    const { error } = await supabase.from("youth_badges").delete().eq("id", badgeId);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin_youth_badges", id] });
  }

  if (profileQ.isLoading || !profileQ.data) {
    return <SiteLayout><div className="py-20 text-center">Loading…</div></SiteLayout>;
  }

  const p = profileQ.data;
  const awarded = new Set((badgesQ.data ?? []).map((b) => b.badge_key));

  return (
    <SiteLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/admin/youth" className="text-sm text-brand-primary hover:underline">
          ← Back to youth list
        </Link>

        <header className="mt-4 mb-6">
          <div className="text-xs uppercase tracking-widest text-brand-dark/50">{p.application_code}</div>
          <h1 className="text-3xl font-heading font-bold">{p.full_name}</h1>
          <div className="text-sm text-brand-dark/60 mt-1">
            {p.age_group} · {p.town} · {p.school ?? "—"} · DOB {p.dob}
          </div>
          <div className="mt-3">
            <VerificationBadge
              level={((p as never as { verification_level?: string }).verification_level ?? "unverified") as never}
              size="lg"
              showTooltip
            />
          </div>
        </header>

        <section className="mb-6 flex flex-wrap gap-2">
          {(["approved", "on_hold", "rejected", "pending"] as const).map((s) => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                p.status === s
                  ? "bg-brand-primary text-white"
                  : "border border-brand-dark/10 hover:bg-brand-soft"
              }`}
            >
              {s}
            </button>
          ))}
        </section>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Card title="Contact">
            <Row label="Mobile" value={p.mobile_number ?? "—"} />
            <Row label="Email" value={p.email ?? "—"} />
            <Row label="Emergency" value={`${p.emergency_contact_name ?? "—"} · ${p.emergency_contact_phone ?? "—"}`} />
          </Card>
          <Card title="Guardian (if minor)">
            <Row label="Name" value={p.guardian_name ?? "—"} />
            <Row label="Relationship" value={p.guardian_relationship ?? "—"} />
            <Row label="Phone" value={p.guardian_phone ?? "—"} />
            <Row label="Consent" value={p.guardian_consent_given ? `✓ ${p.guardian_consent_at?.slice(0,10) ?? ""}` : "Missing"} />
          </Card>
          <Card title="Interests">
            <div className="flex flex-wrap gap-1.5">
              {p.interests.map((i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full bg-brand-soft">
                  {labelFromList(YOUTH_INTERESTS, i)}
                </span>
              ))}
            </div>
          </Card>
          <Card title="Skills">
            <div className="flex flex-wrap gap-1.5">
              {p.skills.map((s) => (
                <span key={s} className="text-xs px-2 py-1 rounded-full bg-brand-soft">
                  {labelFromList(YOUTH_SKILLS, s)}
                </span>
              ))}
            </div>
          </Card>
        </div>

        <section className="mb-8">
          <h2 className="font-heading text-xl font-semibold mb-3">Badges</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {(badgesQ.data ?? []).map((b) => (
              <button
                key={b.id}
                onClick={() => revokeBadge(b.id)}
                title="Click to revoke"
              >
                <BadgeChip badgeKey={b.badge_key} />
              </button>
            ))}
            {(badgesQ.data ?? []).length === 0 && (
              <p className="text-sm text-brand-dark/50">No badges yet.</p>
            )}
          </div>
          <div className="text-xs uppercase tracking-wider text-brand-dark/50 mb-2">Award</div>
          <div className="flex flex-wrap gap-2">
            {YOUTH_BADGES.filter((b) => !awarded.has(b.key)).map((b) => (
              <button
                key={b.key}
                onClick={() => awardBadge(b.key)}
                className="text-xs px-3 py-1.5 rounded-full border border-brand-primary/30 text-brand-primary hover:bg-brand-primary/10"
              >
                + {b.label}
              </button>
            ))}
          </div>
        </section>

        <AdminPccPanel table="youth_profiles" id={id} />
      </div>
    </SiteLayout>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-brand-dark/5 rounded-2xl p-4">
      <h3 className="text-sm uppercase tracking-wider text-brand-dark/60 mb-2">{title}</h3>
      {children}
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm py-1">
      <span className="text-brand-dark/60">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
