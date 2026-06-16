import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { AdminPccPanel } from "@/components/site/AdminPccPanel";
import { VerificationBadge } from "@/components/site/VerificationBadge";
import { ArrowLeft, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/apprentices/$id")({
  head: () => ({ meta: [{ title: "Apprentice — Hineni Admin" }] }),
  component: ApprenticeDetail,
});

function ApprenticeDetail() {
  const { id } = Route.useParams();
  const apprenticeQ = useQuery({
    queryKey: ["admin_apprentice", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("apprentices")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  if (apprenticeQ.isLoading || !apprenticeQ.data) {
    return (
      <SiteLayout>
        <div className="py-20 text-center text-brand-dark/60">
          <Loader2 className="size-6 animate-spin mx-auto" />
        </div>
      </SiteLayout>
    );
  }
  const a = apprenticeQ.data as Record<string, unknown> & {
    full_name: string;
    reference_code: string;
    town: string;
    dob: string;
    contact_number: string | null;
    whatsapp_number: string | null;
    email: string | null;
    career_interests: string[];
    opportunity_types: string[];
    availability: string[];
    verification_level?: string;
  };

  return (
    <SiteLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Link
          to="/admin/apprenticeships"
          className="inline-flex items-center gap-2 text-sm text-brand-dark/60 hover:text-brand-primary mb-6"
        >
          <ArrowLeft className="size-4" /> Back to apprenticeships
        </Link>

        <header className="mb-6">
          <div className="text-xs font-mono text-brand-dark/50 mb-1">{a.reference_code}</div>
          <h1 className="text-3xl font-heading font-bold">{a.full_name}</h1>
          <p className="text-brand-dark/60 text-sm">
            {a.town} · DOB {a.dob}
          </p>
          <div className="mt-2">
            <VerificationBadge
              level={(a.verification_level ?? "unverified") as never}
              size="lg"
              showTooltip
            />
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white border border-brand-dark/5 rounded-2xl p-5 space-y-3">
              <h2 className="font-heading text-lg font-semibold">Contact</h2>
              <Row label="Contact" value={a.contact_number ?? "—"} />
              <Row label="WhatsApp" value={a.whatsapp_number ?? "—"} />
              <Row label="Email" value={a.email ?? "—"} />
            </section>

            <section className="bg-white border border-brand-dark/5 rounded-2xl p-5 space-y-3">
              <h2 className="font-heading text-lg font-semibold">Interests & availability</h2>
              <Row label="Career interests" value={a.career_interests.join(", ")} />
              <Row label="Opportunity types" value={a.opportunity_types.join(", ")} />
              <Row label="Availability" value={a.availability.join(", ")} />
            </section>
          </div>
          <aside>
            <AdminPccPanel table="apprentices" id={id} />
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm py-1">
      <span className="text-brand-dark/60">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
