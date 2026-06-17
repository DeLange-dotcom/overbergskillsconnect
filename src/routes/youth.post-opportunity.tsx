import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { HineniDisclaimer } from "@/components/site/HineniDisclaimer";
import { supabase } from "@/integrations/supabase/client";
import {
  YOUTH_OPPORTUNITY_TYPES,
  YOUTH_OPPORTUNITY_CATEGORIES,
  YOUTH_LOCATIONS,
  YOUTH_COMPENSATION_TYPES,
  PROVIDER_TYPES,
  VERIFICATION_DOC_TYPES,
  SAFEGUARDING_FLAGS,
} from "@/lib/youth";
import { toast } from "sonner";
import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/youth/post-opportunity")({
  head: () => ({
    meta: [
      { title: "Post a Youth Opportunity — Hineni" },
      { name: "description", content: "Organisations and verified providers can submit youth opportunities for review by Hineni." },
    ],
  }),
  component: PostOpportunity,
});

function PostOpportunity() {
  const [providerType, setProviderType] = useState("");
  const [minAge, setMinAge] = useState(15);
  const [safeguarding, setSafeguarding] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const isPrivate = providerType === "private_individual";
  const anySafeguarding = Object.values(safeguarding).some(Boolean) || isPrivate;

  async function uploadFile(file: File | null, prefix: string): Promise<string | null> {
    if (!file) return null;
    const path = `${prefix}/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from("provider-documents").upload(path, file);
    if (error) { toast.error("Upload failed: " + error.message); return null; }
    return path;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);

    const min_age = Number(fd.get("min_age"));
    const max_age = Number(fd.get("max_age"));
    if (isPrivate && min_age < 18) {
      toast.error("Private-individual opportunities are 18+ only.");
      setSubmitting(false);
      return;
    }
    if (max_age < min_age) {
      toast.error("Max age must be ≥ min age.");
      setSubmitting(false);
      return;
    }

    const verification_doc_url = await uploadFile(fd.get("verification_doc") as File, "verification");
    if (!verification_doc_url) {
      toast.error("Please upload a verification document.");
      setSubmitting(false);
      return;
    }
    const private_individual_id_url = isPrivate
      ? await uploadFile(fd.get("private_id") as File, "private-id")
      : null;

    const payload: Record<string, unknown> = {
      provider_type: providerType,
      organisation_name: (fd.get("organisation_name") as string).trim(),
      contact_name: (fd.get("contact_name") as string).trim(),
      contact_position: (fd.get("contact_position") as string).trim() || null,
      contact_email: (fd.get("contact_email") as string).trim(),
      contact_phone: (fd.get("contact_phone") as string).trim() || null,
      website: (fd.get("website") as string).trim() || null,
      verification_doc_type: fd.get("verification_doc_type") as string,
      verification_doc_url,
      title: (fd.get("title") as string).trim(),
      description: (fd.get("description") as string).trim(),
      town: fd.get("town") as string,
      category: fd.get("category") as string,
      opportunity_type: fd.get("opportunity_type") as string,
      start_date: (fd.get("start_date") as string) || null,
      end_date: (fd.get("end_date") as string) || null,
      closing_date: (fd.get("closing_date") as string) || null,
      positions_available: Number(fd.get("positions_available") || 1),
      min_age,
      max_age,
      skills_required: ((fd.get("skills_required") as string) || "").split(",").map(s => s.trim()).filter(Boolean),
      experience_required: (fd.get("experience_required") as string).trim() || null,
      compensation_type: fd.get("compensation_type") as string,
      compensation_amount: fd.get("compensation_amount") ? Number(fd.get("compensation_amount")) : null,
      ...SAFEGUARDING_FLAGS.reduce((acc, f) => ({ ...acc, [f.key]: !!safeguarding[f.key] }), {}),
      private_individual_id_url,
      private_individual_address: isPrivate ? ((fd.get("private_address") as string).trim() || null) : null,
      hazardous_flag: !!safeguarding.involves_machinery || !!safeguarding.involves_chemicals || !!safeguarding.involves_heights,
      status: (anySafeguarding ? "pending_safeguarding_review" : "pending_verification") as never,
    };

    const { error } = await supabase.from("youth_opportunities").insert(payload as never);
    if (error) { toast.error(error.message); setSubmitting(false); return; }
    setDone(true);
    setSubmitting(false);
  }

  if (done) {
    return (
      <SiteLayout>
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <CheckCircle2 className="size-14 text-brand-primary mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-bold mb-2">Submitted for review</h1>
          <p className="text-brand-dark/70 mb-6">
            Thank you. A Hineni coordinator will review your opportunity and contact you before it appears on the board.
          </p>
          <Link to="/youth" className="px-4 py-2 rounded-xl bg-brand-primary text-white">Back to Youth Hub</Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="text-3xl font-heading font-bold mb-2">Post a youth opportunity</h1>
        <p className="text-brand-dark/70 mb-6">
          Tell us about the opportunity. All submissions are reviewed by Hineni before being published.
        </p>
        <div className="mb-6"><HineniDisclaimer /></div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Fieldset title="Provider type">
            <Sel name="provider_type" value={providerType} onChange={setProviderType} options={PROVIDER_TYPES} required />
            {isPrivate && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900 flex gap-2">
                <ShieldAlert className="size-4 mt-0.5 shrink-0" />
                <div>Private individuals may only post opportunities for applicants aged 18–25. Manual approval is required and ID upload + address are mandatory.</div>
              </div>
            )}
          </Fieldset>

          <Fieldset title="Organisation details">
            <Grid>
              <F name="organisation_name" label="Organisation name" required />
              <F name="contact_name" label="Contact person" required />
              <F name="contact_position" label="Position" />
              <F name="contact_email" label="Email" type="email" required />
              <F name="contact_phone" label="Mobile" type="tel" />
              <F name="website" label="Website" />
            </Grid>
          </Fieldset>

          <Fieldset title="Verification document (required)">
            <Grid>
              <div>
                <Label>Document type</Label>
                <select name="verification_doc_type" required className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white">
                  <option value="">Select…</option>
                  {VERIFICATION_DOC_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <Label>Upload <span className="text-destructive">*</span></Label>
                <input name="verification_doc" type="file" required accept=".pdf,image/*" className="w-full text-sm" />
              </div>
            </Grid>
          </Fieldset>

          <Fieldset title="Opportunity details">
            <F name="title" label="Opportunity title" required />
            <div className="mt-4">
              <Label>Description</Label>
              <textarea name="description" rows={4} required className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white" />
            </div>
            <Grid className="mt-4">
              <div>
                <Label>Location</Label>
                <select name="town" required className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white">
                  <option value="">Select…</option>
                  {YOUTH_LOCATIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <div>
                <Label>Category</Label>
                <select name="category" required className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white">
                  <option value="">Select…</option>
                  {YOUTH_OPPORTUNITY_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <Label>Opportunity type</Label>
                <select name="opportunity_type" required className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white">
                  <option value="">Select…</option>
                  {YOUTH_OPPORTUNITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <p className="text-xs text-brand-dark/55 mt-1">
                  Casual = gardening, farm labour, cleaning, event support. Micro job = one-off tasks, weekend or single-day work.
                </p>
              </div>
              <F name="positions_available" label="Positions available" type="number" />
              <F name="start_date" label="Start date" type="date" />
              <F name="end_date" label="End date" type="date" />
              <F name="closing_date" label="Applications close" type="date" />
            </Grid>
          </Fieldset>

          <Fieldset title="Eligibility">
            <Grid>
              <F name="min_age" label="Minimum age" type="number" required onChange={(e) => setMinAge(Number(e.target.value))} defaultValue={isPrivate ? "18" : "15"} />
              <F name="max_age" label="Maximum age" type="number" required defaultValue="25" />
              <F name="skills_required" label="Skills required (comma separated)" />
              <F name="experience_required" label="Experience required" />
            </Grid>
            {minAge < 18 && (
              <p className="mt-3 text-xs text-brand-dark/60">
                Applicants under 18 may only be matched to opportunities posted by verified organisations
                (not private individuals).
              </p>
            )}
          </Fieldset>

          <Fieldset title="Safeguarding & risk assessment">
            <p className="text-sm text-brand-dark/70 mb-3">
              Tick anything that applies. Any tick triggers a mandatory manual safeguarding review before publication.
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              {SAFEGUARDING_FLAGS.map(f => (
                <label key={f.key} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-brand-dark/10 text-sm">
                  <input
                    type="checkbox"
                    checked={!!safeguarding[f.key]}
                    onChange={(e) => setSafeguarding(s => ({ ...s, [f.key]: e.target.checked }))}
                    className="accent-brand-primary"
                  />
                  {f.label}
                </label>
              ))}
            </div>
            {anySafeguarding && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
                This opportunity will require manual safeguarding review before going live.
              </div>
            )}
          </Fieldset>

          <Fieldset title="Compensation">
            <Grid>
              <div>
                <Label>Type</Label>
                <select name="compensation_type" required className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white">
                  <option value="">Select…</option>
                  {YOUTH_COMPENSATION_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <F name="compensation_amount" label="Amount (R, optional)" type="number" />
            </Grid>
          </Fieldset>

          {isPrivate && (
            <Fieldset title="Private individual verification (required)">
              <div>
                <Label>South African ID / Passport upload <span className="text-destructive">*</span></Label>
                <input name="private_id" type="file" required accept=".pdf,image/*" className="w-full text-sm" />
              </div>
              <div className="mt-4">
                <Label>Residential address <span className="text-destructive">*</span></Label>
                <textarea name="private_address" rows={2} required className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white" />
              </div>
              <p className="text-xs text-brand-dark/60 mt-2">
                A Hineni coordinator will verify your phone number manually before approval.
              </p>
            </Fieldset>
          )}

          <button type="submit" disabled={submitting || !providerType} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-primary text-white font-medium hover:brightness-110 disabled:opacity-60">
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Submit for review
          </button>
        </form>
      </div>
    </SiteLayout>
  );
}

function Fieldset({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="bg-white rounded-2xl border border-brand-dark/10 p-5 sm:p-6">
      <legend className="px-2 font-heading text-lg font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}
function Grid({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`grid sm:grid-cols-2 gap-4 ${className}`}>{children}</div>;
}
function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-medium text-brand-dark/80 mb-1.5">{children}</div>;
}
function F({ name, label, type = "text", required, onChange, defaultValue }: { name: string; label: string; type?: string; required?: boolean; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; defaultValue?: string }) {
  return (
    <div>
      <Label>{label} {required && <span className="text-destructive">*</span>}</Label>
      <input name={name} type={type} required={required} onChange={onChange} defaultValue={defaultValue} className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white" />
    </div>
  );
}
function Sel({ name, value, onChange, options, required }: { name: string; value: string; onChange: (v: string) => void; options: readonly { value: string; label: string }[]; required?: boolean }) {
  return (
    <select name={name} value={value} onChange={(e) => onChange(e.target.value)} required={required} className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white">
      <option value="">Select provider type…</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
