import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { PROVIDER_STATUS_LABELS, categoryLabel, travelLabel } from "@/lib/constants";
import { AdminPccPanel } from "@/components/site/AdminPccPanel";
import { VerificationBadge } from "@/components/site/VerificationBadge";
import { ProfileLifecyclePanel } from "@/components/site/ProfileLifecyclePanel";
import { ArrowLeft, FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/providers/$id")({
  head: () => ({ meta: [{ title: "Applicant — Hineni Admin" }] }),
  component: ProviderDetail,
});

function ProviderDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const [savingStatus, setSavingStatus] = useState(false);
  const [notesDraft, setNotesDraft] = useState<string>("");

  const { data: provider, isLoading } = useQuery({
    queryKey: ["provider", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_providers")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      setNotesDraft(data.admin_notes ?? "");
      return data;
    },
  });

  const { data: refs } = useQuery({
    queryKey: ["provider_refs", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("provider_references")
        .select("*")
        .eq("service_provider_id", id);
      return data ?? [];
    },
  });

  const { data: pdfs } = useQuery({
    queryKey: ["provider_pdfs", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("vetting_pdf_exports")
        .select("*")
        .eq("service_provider_id", id)
        .order("generated_at", { ascending: false });
      return data ?? [];
    },
  });

  async function updateStatus(status: string) {
    setSavingStatus(true);
    const { error } = await supabase
      .from("service_providers")
      .update({ status: status as never, admin_notes: notesDraft })
      .eq("id", id);
    setSavingStatus(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Updated");
    await supabase.from("audit_log").insert({
      action: "status_change",
      entity_type: "service_provider",
      entity_id: id,
      details: { new_status: status },
    });
    qc.invalidateQueries({ queryKey: ["provider", id] });
  }

  async function generatePDF() {
    if (!provider) return;
    const html = renderVettingHtml(provider, refs ?? []);
    const w = window.open("", "_blank");
    if (!w) {
      toast.error("Please allow popups to print the PDF.");
      return;
    }
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);

    const { data: user } = await supabase.auth.getUser();
    await supabase.from("vetting_pdf_exports").insert({
      service_provider_id: id,
      generated_by: user.user?.id,
    });
    await supabase.from("audit_log").insert({
      action: "pdf_generated",
      entity_type: "service_provider",
      entity_id: id,
      details: { by: user.user?.email },
    });
    qc.invalidateQueries({ queryKey: ["provider_pdfs", id] });
  }

  if (isLoading || !provider) {
    return (
      <SiteLayout>
        <div className="py-20 text-center text-brand-dark/60">
          <Loader2 className="size-6 animate-spin mx-auto" />
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-sm text-brand-dark/60 hover:text-brand-primary mb-6"
        >
          <ArrowLeft className="size-4" /> Back to dashboard
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div>
            <div className="text-xs font-mono text-brand-dark/50 mb-1">{provider.application_code}</div>
            <h1 className="text-3xl font-heading font-bold">{provider.full_name}</h1>
            <p className="text-brand-dark/60 text-sm">
              {provider.town} · Registered {new Date(provider.created_at).toLocaleDateString()}
            </p>
            <div className="mt-2">
              <VerificationBadge
                level={(provider.verification_level ?? "unverified") as never}
                size="lg"
                showTooltip
              />
            </div>
          </div>
          <button
            onClick={generatePDF}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-dark text-white font-medium hover:bg-black"
          >
            <FileDown className="size-4" /> Generate Vetting PDF
          </button>
        </div>

        <ProfileLifecyclePanel
          table="service_providers"
          id={id}
          initial={{
            is_published: !!(provider as { is_published?: boolean }).is_published,
            is_suspended: !!(provider as { is_suspended?: boolean }).is_suspended,
            is_archived: !!(provider as { is_archived?: boolean }).is_archived,
          }}
          onChange={() => qc.invalidateQueries({ queryKey: ["provider", id] })}
        />


        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Section title="Personal information">
              <Pair label="ID/passport" value={provider.id_passport_number} />
              <Pair label="Nationality" value={provider.nationality} />
              <Pair label="Date of birth" value={String(provider.date_of_birth)} />
              <Pair label="Mobile" value={provider.mobile_number} />
              <Pair label="WhatsApp" value={provider.whatsapp_number ?? "—"} />
              <Pair label="Email" value={provider.email ?? "—"} />
              <Pair label="Address" value={provider.physical_address} wide />
            </Section>

            <Section title="Skills & experience">
              <Pair
                label="Services"
                value={(provider.services ?? []).map(categoryLabel).join(", ")}
                wide
              />
              <Pair label="Skills summary" value={provider.skills_summary} wide />
              <Pair label="Years experience" value={String(provider.years_experience ?? "—")} />
              <Pair label="Previous employer" value={provider.previous_employer ?? "—"} />
            </Section>

            <Section title="Availability">
              <Pair label="Available immediately" value={provider.available_immediately ? "Yes" : "No"} />
              <Pair label="Looking for" value={(provider.looking_for ?? []).join(", ")} />
              <Pair label="Days" value={(provider.days_available ?? []).join(", ").toUpperCase()} />
              <Pair label="Hours" value={(provider.typical_hours ?? []).join(", ")} />
              <Pair label="Travel" value={travelLabel(provider.max_travel)} />
              <Pair label="Own transport" value={provider.own_transport ? "Yes" : "No"} />
              <Pair label="Driver's licence" value={provider.drivers_licence ? "Yes" : "No"} />
            </Section>

            <Section title="References">
              {(refs ?? []).length === 0 ? (
                <p className="text-sm text-brand-dark/50">No references on file.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {refs!.map((r) => (
                    <li key={r.id} className="p-3 rounded-lg bg-brand-soft">
                      <div className="font-medium">{r.reference_name}</div>
                      <div className="text-brand-dark/70">{r.reference_contact}</div>
                      {r.checked && (
                        <div className="text-xs text-brand-primary mt-1">
                          ✓ Checked {r.checked_at ? new Date(r.checked_at).toLocaleDateString() : ""}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section title="Criminal record declaration">
              <Pair
                label="Conviction declared"
                value={provider.criminal_conviction ? "Yes" : "No"}
              />
              {provider.criminal_conviction_details && (
                <Pair label="Details" value={provider.criminal_conviction_details} wide />
              )}
            </Section>

            <Section title="Consents on record">
              <ul className="text-sm space-y-1 text-brand-dark/70">
                <li>{provider.consent_store_info ? "✓" : "✗"} Store information</li>
                <li>{provider.consent_reference_checks ? "✓" : "✗"} Reference checks</li>
                <li>{provider.consent_background_checks ? "✓" : "✗"} Background checks</li>
                <li>{provider.consent_share_authorities ? "✓" : "✗"} Share with authorities</li>
                <li>{provider.consent_no_guarantee ? "✓" : "✗"} No guarantee of work</li>
              </ul>
            </Section>
          </div>

          <aside className="space-y-6">
            <AdminPccPanel table="service_providers" id={id} />

            <Section title="Status">
              <select
                defaultValue={provider.status}
                onChange={(e) => updateStatus(e.target.value)}
                disabled={savingStatus}
                className="w-full px-3 py-2.5 rounded-lg border border-brand-dark/10 bg-white"
              >
                {Object.entries(PROVIDER_STATUS_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
              <p className="text-xs text-brand-dark/50 mt-2">
                Changes are saved immediately and recorded in the audit log.
              </p>
            </Section>

            <Section title="Admin notes">
              <textarea
                rows={6}
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                onBlur={() => updateStatus(provider.status)}
                className="w-full px-3 py-2.5 rounded-lg border border-brand-dark/10 bg-white text-sm"
                placeholder="Internal vetting notes…"
              />
              <p className="text-xs text-brand-dark/50 mt-2">Saved when you click outside the box.</p>
            </Section>

            <Section title="PDF export history">
              {(pdfs ?? []).length === 0 ? (
                <p className="text-sm text-brand-dark/50">No PDFs generated yet.</p>
              ) : (
                <ul className="text-sm space-y-2">
                  {pdfs!.map((p) => (
                    <li key={p.id} className="p-3 rounded-lg bg-brand-soft">
                      <div className="font-medium">
                        {new Date(p.generated_at).toLocaleString()}
                      </div>
                      <div className="text-xs text-brand-dark/60">
                        {p.shared_with ? `Shared with ${p.shared_with}` : "Not shared"}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-brand-dark/5 rounded-2xl p-5">
      <h2 className="font-heading text-lg font-semibold mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Pair({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`py-1.5 ${wide ? "" : "inline-block w-1/2 align-top pr-3"}`}>
      <div className="text-[10px] uppercase tracking-widest text-brand-dark/40">{label}</div>
      <div className="text-sm text-brand-dark/90">{value}</div>
    </div>
  );
}

function renderVettingHtml(p: any, refs: Array<{ reference_name: string; reference_contact: string }>) {
  const css = `
    body{font-family: -apple-system,Inter,sans-serif;color:#2D3A3A;margin:0;padding:40px;}
    h1{font-family:Georgia,serif;margin:0 0 4px;color:#4A5D4E;}
    .meta{color:#666;font-size:12px;margin-bottom:24px;}
    h2{font-family:Georgia,serif;font-size:14px;margin:24px 0 8px;border-bottom:1px solid #ddd;padding-bottom:4px;color:#4A5D4E;}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;font-size:12px;}
    .field b{display:block;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#888;font-weight:600;margin-bottom:2px;}
    .footer{margin-top:40px;padding-top:12px;border-top:1px solid #ddd;font-size:10px;color:#888;text-align:center;}
    .sig{margin-top:30px;display:grid;grid-template-columns:1fr 1fr;gap:24px;font-size:12px;}
    .sigline{margin-top:36px;border-top:1px solid #444;padding-top:4px;font-size:10px;color:#666;}
  `;
  const f = (l: string, v: any) =>
    `<div class="field"><b>${l}</b>${v ?? "—"}</div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><title>Vetting Record ${p.application_code}</title><style>${css}</style></head><body>
    <h1>Hineni Vetting Record</h1>
    <div class="meta">Application ${p.application_code} · Generated ${new Date().toLocaleString()}</div>

    <h2>Applicant</h2>
    <div class="grid">
      ${f("Full name", p.full_name)}
      ${f("Approved display name", p.display_name ?? "—")}
      ${f("ID/Passport", p.id_passport_number)}
      ${f("Nationality", p.nationality)}
      ${f("Date of birth", p.date_of_birth)}
      ${f("Town", p.town)}
      ${f("Mobile", p.mobile_number)}
      ${f("WhatsApp", p.whatsapp_number ?? "—")}
      ${f("Email", p.email ?? "—")}
      ${f("Address", p.physical_address)}
    </div>

    <h2>Skills & experience</h2>
    <div class="grid">
      ${f("Services", (p.services ?? []).map(categoryLabel).join(", "))}
      ${f("Years experience", p.years_experience ?? "—")}
      ${f("Previous employer", p.previous_employer ?? "—")}
      ${f("Skills summary", p.skills_summary)}
    </div>

    <h2>Availability</h2>
    <div class="grid">
      ${f("Available immediately", p.available_immediately ? "Yes" : "No")}
      ${f("Looking for", (p.looking_for ?? []).join(", "))}
      ${f("Days", (p.days_available ?? []).join(", "))}
      ${f("Hours", (p.typical_hours ?? []).join(", "))}
      ${f("Travel", travelLabel(p.max_travel))}
      ${f("Own transport", p.own_transport ? "Yes" : "No")}
      ${f("Driver's licence", p.drivers_licence ? "Yes" : "No")}
    </div>

    <h2>References</h2>
    <div class="grid">
      ${refs.map((r, i) => f(`Reference ${i + 1}`, `${r.reference_name} — ${r.reference_contact}`)).join("")}
    </div>

    <h2>Criminal record declaration</h2>
    <div class="grid">
      ${f("Conviction declared", p.criminal_conviction ? "Yes" : "No")}
      ${f("Details", p.criminal_conviction_details ?? "—")}
    </div>

    <h2>Applicant consents</h2>
    <div class="grid">
      ${f("Store information", p.consent_store_info ? "Yes" : "No")}
      ${f("Reference checks", p.consent_reference_checks ? "Yes" : "No")}
      ${f("Background checks", p.consent_background_checks ? "Yes" : "No")}
      ${f("Share with authorities", p.consent_share_authorities ? "Yes" : "No")}
      ${f("Acknowledges no guarantee", p.consent_no_guarantee ? "Yes" : "No")}
    </div>

    <h2>Admin vetting</h2>
    <div class="grid">
      ${f("Current status", (PROVIDER_STATUS_LABELS as any)[p.status])}
      ${f("Notes", p.admin_notes ?? "—")}
    </div>

    <div class="sig">
      <div><div class="sigline">Vetting officer signature & date</div></div>
      <div><div class="sigline">Authorised partner / police use</div></div>
    </div>

    <div class="footer">
      Confidential. For authorised vetting purposes only. Contains personal information protected under POPIA.
    </div>
  </body></html>`;
}
