import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Upload } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { TermsAcceptance } from "@/components/site/TermsAcceptance";
import {
  SafeguardingAcknowledgement, emptyAckState, isAckComplete, type SafeguardingAckState,
} from "@/components/site/SafeguardingAcknowledgement";
import { LegalDisclaimer } from "@/components/site/LegalDisclaimer";
import { supabase } from "@/integrations/supabase/client";
import { TERMS_VERSION, recordTermsAcceptance } from "@/lib/terms";
import { MENTOR_CATEGORIES, MENTOR_FORMATS, KNOWLEDGE_KEEPER_CATEGORIES } from "@/lib/apprenticeships";
import { SAFEGUARDING_POLICY_VERSION } from "@/lib/safeguarding";
import { uploadApprenticeshipDoc } from "@/lib/uploadDoc";

export const Route = createFileRoute("/apprenticeships/become-mentor")({
  head: () => ({
    meta: [
      { title: "Become a Mentor — Hineni" },
      { name: "description", content: "Share your knowledge. Register as a mentor or Knowledge Keeper with Hineni." },
    ],
  }),
  component: Page,
});

const schema = z.object({
  full_name: z.string().trim().min(2).max(120),
  contact_number: z.string().trim().min(4).max(20),
  email: z.string().trim().email(),
  town: z.string().trim().max(60).optional().or(z.literal("")),
  categories: z.array(z.string()).min(1, "Pick at least one"),
  years_experience: z.string().optional(),
  professional_background: z.string().trim().max(300).optional().or(z.literal("")),
  biography: z.string().trim().max(2000).optional().or(z.literal("")),
  qualifications: z.string().trim().max(1000).optional().or(z.literal("")),
  linkedin_url: z.string().trim().url().max(255).optional().or(z.literal("")),
  website_url: z.string().trim().url().max(255).optional().or(z.literal("")),
  availability: z.string().trim().max(200).optional().or(z.literal("")),
  formats: z.array(z.string()).min(1, "Pick at least one"),
  is_knowledge_keeper: z.boolean(),
  knowledge_keeper_categories: z.array(z.string()),
  reference1_name: z.string().trim().min(2, "Required").max(120),
  reference1_relationship: z.string().trim().min(2, "Required").max(80),
  reference1_phone: z.string().trim().min(4, "Required").max(20),
  reference1_email: z.string().trim().email().optional().or(z.literal("")),
  reference2_name: z.string().trim().min(2, "Required").max(120),
  reference2_relationship: z.string().trim().min(2, "Required").max(80),
  reference2_phone: z.string().trim().min(4, "Required").max(20),
  reference2_email: z.string().trim().email().optional().or(z.literal("")),
  accept_terms: z.literal(true, { errorMap: () => ({ message: "You must accept the Terms & Disclaimer." }) }),
});

function Page() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isKK, setIsKK] = useState(false);
  const [ack, setAck] = useState<SafeguardingAckState>(emptyAckState());
  const [disclaimer, setDisclaimer] = useState(false);
  const [pccFile, setPccFile] = useState<File | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const raw = {
      full_name: fd.get("full_name") as string,
      contact_number: fd.get("contact_number") as string,
      email: fd.get("email") as string,
      town: fd.get("town") as string,
      categories: fd.getAll("categories") as string[],
      years_experience: fd.get("years_experience") as string,
      professional_background: fd.get("professional_background") as string,
      biography: fd.get("biography") as string,
      qualifications: fd.get("qualifications") as string,
      linkedin_url: fd.get("linkedin_url") as string,
      website_url: fd.get("website_url") as string,
      availability: fd.get("availability") as string,
      formats: fd.getAll("formats") as string[],
      is_knowledge_keeper: fd.get("is_knowledge_keeper") === "on",
      knowledge_keeper_categories: fd.getAll("knowledge_keeper_categories") as string[],
      reference1_name: fd.get("reference1_name") as string,
      reference1_relationship: fd.get("reference1_relationship") as string,
      reference1_phone: fd.get("reference1_phone") as string,
      reference1_email: fd.get("reference1_email") as string,
      reference2_name: fd.get("reference2_name") as string,
      reference2_relationship: fd.get("reference2_relationship") as string,
      reference2_phone: fd.get("reference2_phone") as string,
      reference2_email: fd.get("reference2_email") as string,
      accept_terms: fd.get("accept_terms") === "on",
    };
    const parsed = schema.safeParse(raw);
    const extra: Record<string, string> = {};
    if (!isAckComplete(ack)) extra.safeguarding = "Please tick all safeguarding acknowledgements.";
    if (!disclaimer) extra.disclaimer = "Please accept the disclaimer.";
    if (!parsed.success || Object.keys(extra).length) {
      const errs: Record<string, string> = { ...extra };
      if (!parsed.success) parsed.error.issues.forEach((i) => (errs[i.path.join(".")] = i.message));
      setErrors(errs); setSubmitting(false);
      toast.error("Please fix the highlighted fields.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const d = parsed.data;

    let pcc_path: string | null = null;
    if (pccFile) {
      const r = await uploadApprenticeshipDoc(pccFile, "verification");
      if ("path" in r) pcc_path = r.path;
      else toast.message("PCC not attached", { description: r.error });
    }

    const now = new Date().toISOString();
    const { data, error } = await supabase.from("mentors").insert({
      full_name: d.full_name,
      contact_number: d.contact_number,
      email: d.email,
      town: d.town || null,
      categories: d.categories,
      years_experience: d.years_experience ? Number(d.years_experience) : null,
      professional_background: d.professional_background || null,
      biography: d.biography || null,
      qualifications: d.qualifications || null,
      linkedin_url: d.linkedin_url || null,
      website_url: d.website_url || null,
      pcc_path,
      availability: d.availability || null,
      formats: d.formats,
      is_knowledge_keeper: d.is_knowledge_keeper,
      knowledge_keeper_categories: d.is_knowledge_keeper ? d.knowledge_keeper_categories : [],
      reference1_name: d.reference1_name,
      reference1_relationship: d.reference1_relationship,
      reference1_phone: d.reference1_phone,
      reference1_email: d.reference1_email || null,
      reference2_name: d.reference2_name,
      reference2_relationship: d.reference2_relationship,
      reference2_phone: d.reference2_phone,
      reference2_email: d.reference2_email || null,
      terms_accepted_at: now,
      terms_version: TERMS_VERSION,
      safeguarding_acknowledged_at: now,
      safeguarding_policy_version: SAFEGUARDING_POLICY_VERSION,
      disclaimer_accepted_at: now,
    }).select("id").single();
    if (error || !data) { toast.error(error?.message ?? "Could not submit."); setSubmitting(false); return; }
    await recordTermsAcceptance({ context: "provider_registration", referenceTable: "mentors", referenceId: data.id });
    setDone(true); setSubmitting(false); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (done) {
    return (
      <SiteLayout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
          <CheckCircle2 className="size-16 text-brand-primary mx-auto mb-6" />
          <h1 className="text-3xl font-heading font-bold mb-3">Thank you for stepping forward</h1>
          <p className="text-brand-dark/70 max-w-md mx-auto mb-8">
            A Hineni coordinator will review your profile and references before it appears on the mentor board.
          </p>
          <Link to="/apprenticeships" className="px-6 py-3 rounded-xl bg-brand-primary text-white">Back to hub</Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3">Become a Mentor</h1>
        <p className="text-brand-dark/70 mb-8">For professionals, retirees, tradespeople, business owners and community elders willing to share knowledge.</p>
        <form onSubmit={onSubmit} className="space-y-8">
          <Fieldset title="About you">
            <Grid>
              <Field label="Full name" name="full_name" required error={errors.full_name} />
              <Field label="Town" name="town" />
              <Field label="Contact number" name="contact_number" type="tel" required error={errors.contact_number} />
              <Field label="Email" name="email" type="email" required error={errors.email} />
              <Field label="Years of experience" name="years_experience" type="number" />
              <Field label="LinkedIn URL" name="linkedin_url" type="url" />
              <Field label="Website URL" name="website_url" type="url" />
            </Grid>
            <div className="mt-4"><Label>Professional background</Label>
              <input name="professional_background" className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white" /></div>
            <div className="mt-4"><Label>Biography</Label>
              <textarea name="biography" rows={4} className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white" /></div>
            <div className="mt-4"><Label>Qualifications</Label>
              <textarea name="qualifications" rows={3} className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white" /></div>
          </Fieldset>

          <Fieldset title="Areas of expertise"><CheckGrid name="categories" options={MENTOR_CATEGORIES} error={errors.categories} /></Fieldset>

          <Fieldset title="Availability & format">
            <div><Label>Availability (e.g. weekday evenings)</Label>
              <input name="availability" className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white" /></div>
            <div className="mt-4"><Label>Preferred formats *</Label>
              <CheckGrid name="formats" options={MENTOR_FORMATS} error={errors.formats} cols={2} /></div>
          </Fieldset>

          <Fieldset title="Master Craftsperson / Knowledge Keeper">
            <label className="flex items-start gap-2 text-sm mb-3">
              <input type="checkbox" name="is_knowledge_keeper" checked={isKK} onChange={(e) => setIsKK(e.target.checked)} className="mt-1 accent-brand-primary" />
              <span>I hold traditional skills or local knowledge I would like to pass on (farming, sewing, beekeeping, building restoration, indigenous plants, etc.).</span>
            </label>
            {isKK && (
              <div className="mt-2">
                <Label>Which areas?</Label>
                <CheckGrid name="knowledge_keeper_categories" options={KNOWLEDGE_KEEPER_CATEGORIES} cols={3} />
              </div>
            )}
          </Fieldset>

          <Fieldset title="Police Clearance Certificate (PCC)">
            <p className="text-sm text-brand-dark/70 mb-3">Mentors interacting with apprentices must hold a valid PCC. Upload below or send to safeguarding once approved.</p>
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-brand-dark/10 cursor-pointer hover:bg-brand-soft text-sm">
              <Upload className="size-4" />
              <span>{pccFile ? pccFile.name : "Choose file"}</span>
              <input type="file" accept="application/pdf,image/*" className="hidden"
                onChange={(e) => setPccFile(e.target.files?.[0] ?? null)} />
            </label>
            <p className="text-xs text-brand-dark/55 mt-1">Sign in to attach files now, otherwise our team will request it.</p>
          </Fieldset>

          <Fieldset title="References (two required)">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-2">Reference 1</h3>
                <Grid>
                  <Field label="Full name" name="reference1_name" required error={errors.reference1_name} />
                  <Field label="Relationship" name="reference1_relationship" required error={errors.reference1_relationship} />
                  <Field label="Phone" name="reference1_phone" type="tel" required error={errors.reference1_phone} />
                  <Field label="Email" name="reference1_email" type="email" />
                </Grid>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2">Reference 2</h3>
                <Grid>
                  <Field label="Full name" name="reference2_name" required error={errors.reference2_name} />
                  <Field label="Relationship" name="reference2_relationship" required error={errors.reference2_relationship} />
                  <Field label="Phone" name="reference2_phone" type="tel" required error={errors.reference2_phone} />
                  <Field label="Email" name="reference2_email" type="email" />
                </Grid>
              </div>
            </div>
          </Fieldset>

          <Fieldset title="Safeguarding & disclaimer (required)">
            <SafeguardingAcknowledgement value={ack} onChange={setAck} error={errors.safeguarding} />
            <div className="mt-4">
              <LegalDisclaimer checked={disclaimer} onChange={setDisclaimer} error={errors.disclaimer} />
            </div>
          </Fieldset>

          <Fieldset title="Terms & Disclaimer (required)">
            <TermsAcceptance name="accept_terms" error={errors.accept_terms} />
          </Fieldset>

          <div className="flex gap-3 items-center pt-2">
            <button type="submit" disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-primary text-white font-medium hover:brightness-110 disabled:opacity-60">
              {submitting && <Loader2 className="size-4 animate-spin" />} Register as a mentor
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
function CheckGrid({ name, options, error, cols = 3 }: { name: string; options: readonly string[]; error?: string; cols?: number }) {
  return <div>
    <div className={`grid grid-cols-2 gap-2 ${cols === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
      {options.map((o) => (
        <label key={o} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-brand-dark/10 hover:bg-brand-soft cursor-pointer text-sm">
          <input type="checkbox" name={name} value={o} className="accent-brand-primary" />{o}
        </label>
      ))}
    </div>
    {error && <p className="text-xs text-destructive mt-2">{error}</p>}
  </div>;
}
