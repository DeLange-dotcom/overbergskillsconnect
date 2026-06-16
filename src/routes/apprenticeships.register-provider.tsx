import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { TermsAcceptance } from "@/components/site/TermsAcceptance";
import { supabase } from "@/integrations/supabase/client";
import { TERMS_VERSION, recordTermsAcceptance } from "@/lib/terms";
import { PROVIDER_TYPES } from "@/lib/apprenticeships";

export const Route = createFileRoute("/apprenticeships/register-provider")({
  head: () => ({
    meta: [
      { title: "Offer an Apprenticeship — Hineni" },
      { name: "description", content: "Businesses, farms, NPOs and artisans: list an apprenticeship, internship or work-experience opportunity." },
    ],
  }),
  component: Page,
});

const schema = z.object({
  provider_type: z.string().min(1, "Required"),
  organisation_name: z.string().trim().min(2).max(160),
  contact_person: z.string().trim().min(2).max(120),
  contact_number: z.string().trim().min(4).max(20),
  email: z.string().trim().email(),
  website: z.string().trim().url().max(255).optional().or(z.literal("")),
  physical_address: z.string().trim().max(200).optional().or(z.literal("")),
  town: z.string().trim().min(2).max(60),
  title: z.string().trim().min(2).max(160),
  industry: z.string().trim().min(2).max(80),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  skills_offered: z.string().trim().max(500),
  placements_available: z.coerce.number().int().min(1).max(99),
  paid: z.boolean(),
  stipend_amount: z.string().optional(),
  duration: z.string().trim().max(80).optional().or(z.literal("")),
  start_date: z.string().optional(),
  min_age: z.string().optional(),
  preferred_qualifications: z.string().trim().max(300).optional().or(z.literal("")),
  transport_requirements: z.string().trim().max(300).optional().or(z.literal("")),
  safety_requirements: z.string().trim().max(500).optional().or(z.literal("")),
  accept_terms: z.literal(true, { errorMap: () => ({ message: "You must accept the Terms & Disclaimer." }) }),
});

function Page() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd.entries()) as Record<string, string>;
    const data = { ...raw, paid: fd.get("paid") === "on", accept_terms: fd.get("accept_terms") === "on" };
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[i.path.join(".")] = i.message));
      setErrors(errs); setSubmitting(false);
      toast.error("Please fix the highlighted fields.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const d = parsed.data;
    const { data: prov, error: pErr } = await supabase.from("apprenticeship_providers").insert({
      provider_type: d.provider_type,
      organisation_name: d.organisation_name,
      contact_person: d.contact_person,
      contact_number: d.contact_number,
      email: d.email,
      website: d.website || null,
      physical_address: d.physical_address || null,
      town: d.town,
      terms_accepted_at: new Date().toISOString(),
      terms_version: TERMS_VERSION,
    }).select("id").single();
    if (pErr || !prov) { toast.error(pErr?.message ?? "Could not submit."); setSubmitting(false); return; }

    const { error: oErr } = await supabase.from("apprenticeship_opportunities").insert({
      provider_id: prov.id,
      title: d.title, industry: d.industry,
      description: d.description || null,
      skills_offered: d.skills_offered.split(",").map((s) => s.trim()).filter(Boolean),
      placements_available: d.placements_available,
      paid: d.paid,
      stipend_amount: d.stipend_amount ? Number(d.stipend_amount) : null,
      duration: d.duration || null,
      start_date: d.start_date || null,
      min_age: d.min_age ? Number(d.min_age) : null,
      preferred_qualifications: d.preferred_qualifications || null,
      transport_requirements: d.transport_requirements || null,
      safety_requirements: d.safety_requirements || null,
      town: d.town,
    });
    if (oErr) { toast.error(oErr.message); setSubmitting(false); return; }

    await recordTermsAcceptance({ context: "provider_registration", referenceTable: "apprenticeship_providers", referenceId: prov.id });
    setDone(true); setSubmitting(false); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (done) {
    return (
      <SiteLayout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
          <CheckCircle2 className="size-16 text-brand-primary mx-auto mb-6" />
          <h1 className="text-3xl font-heading font-bold mb-3">Thank you</h1>
          <p className="text-brand-dark/70 max-w-md mx-auto mb-8">
            Your opportunity has been received and will be reviewed by a Hineni coordinator before it goes live.
          </p>
          <Link to="/apprenticeships" className="px-6 py-3 rounded-xl bg-brand-primary text-white">Back to hub</Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3">Offer an Apprenticeship</h1>
        <p className="text-brand-dark/70 mb-8">Tell us about your organisation and the opportunity you want to offer.</p>
        <form onSubmit={onSubmit} className="space-y-8">
          <Fieldset title="Organisation">
            <Grid>
              <div><Label>Provider type *</Label>
                <select name="provider_type" required className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white" defaultValue="">
                  <option value="">Select…</option>
                  {PROVIDER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.provider_type && <p className="text-xs text-destructive mt-1">{errors.provider_type}</p>}
              </div>
              <Field label="Organisation name" name="organisation_name" required error={errors.organisation_name} />
              <Field label="Contact person" name="contact_person" required error={errors.contact_person} />
              <Field label="Contact number" name="contact_number" type="tel" required error={errors.contact_number} />
              <Field label="Email" name="email" type="email" required error={errors.email} />
              <Field label="Website" name="website" type="url" />
              <Field label="Town" name="town" required error={errors.town} />
            </Grid>
            <div className="mt-4"><Label>Physical address</Label>
              <input name="physical_address" className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white" /></div>
          </Fieldset>

          <Fieldset title="The opportunity">
            <Grid>
              <Field label="Title (e.g. Junior Carpenter Apprentice)" name="title" required error={errors.title} />
              <Field label="Industry" name="industry" required error={errors.industry} />
              <Field label="Number of placements" name="placements_available" type="number" required error={errors.placements_available} />
              <Field label="Duration (e.g. 6 months)" name="duration" />
              <Field label="Start date" name="start_date" type="date" />
              <Field label="Minimum age" name="min_age" type="number" />
            </Grid>
            <div className="mt-4"><Label>Description</Label>
              <textarea name="description" rows={3} className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white" /></div>
            <div className="mt-4"><Label>Skills offered (comma-separated)</Label>
              <input name="skills_offered" className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white" /></div>
            <div className="flex items-center gap-3 mt-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="paid" className="accent-brand-primary" /> Paid</label>
              <Field label="Stipend amount (R, optional)" name="stipend_amount" type="number" />
            </div>
            <div className="mt-4"><Label>Preferred qualifications</Label>
              <input name="preferred_qualifications" className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white" /></div>
            <div className="mt-4"><Label>Transport requirements</Label>
              <input name="transport_requirements" className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white" /></div>
            <div className="mt-4"><Label>Health & safety requirements</Label>
              <textarea name="safety_requirements" rows={2} className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white" /></div>
          </Fieldset>

          <Fieldset title="Terms & Disclaimer (required)">
            <TermsAcceptance name="accept_terms" error={errors.accept_terms} />
          </Fieldset>

          <div className="flex gap-3 items-center pt-2">
            <button type="submit" disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-primary text-white font-medium hover:brightness-110 disabled:opacity-60">
              {submitting && <Loader2 className="size-4 animate-spin" />} Submit opportunity
            </button>
            <Link to="/apprenticeships" className="text-sm text-brand-dark/60 underline">Back to hub</Link>
          </div>
        </form>
      </div>
    </SiteLayout>
  );
}

function Fieldset({ title, children }: { title: string; children: React.ReactNode }) {
  return <fieldset className="bg-white rounded-2xl border border-brand-dark/10 p-5 sm:p-6">
    <legend className="px-2 font-heading text-lg font-semibold">{title}</legend>{children}</fieldset>;
}
function Grid({ children }: { children: React.ReactNode }) { return <div className="grid sm:grid-cols-2 gap-4">{children}</div>; }
function Label({ children }: { children: React.ReactNode }) { return <div className="text-sm font-medium text-brand-dark/80 mb-1.5">{children}</div>; }
function Field({ label, name, type = "text", required, error }: { label: string; name: string; type?: string; required?: boolean; error?: string }) {
  return <div><Label>{label}{required && <span className="text-destructive"> *</span>}</Label>
    <input name={name} type={type} required={required} className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white" />
    {error && <p className="text-xs text-destructive mt-1">{error}</p>}</div>;
}
