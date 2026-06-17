import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Upload } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { TermsAcceptance } from "@/components/site/TermsAcceptance";
import { PccSection, readPccFromForm } from "@/components/site/PccSection";
import {
  SafeguardingAcknowledgement,
  emptyAckState,
  isAckComplete,
  type SafeguardingAckState,
} from "@/components/site/SafeguardingAcknowledgement";
import { LegalDisclaimer } from "@/components/site/LegalDisclaimer";
import { supabase } from "@/integrations/supabase/client";
import { TERMS_VERSION, recordTermsAcceptance } from "@/lib/terms";
import {
  CAREER_INTERESTS, OPPORTUNITY_TYPES, AVAILABILITY,
  NATIONALITIES, WORK_PERMIT_STATUSES,
} from "@/lib/apprenticeships";
import { SAFEGUARDING_POLICY_VERSION } from "@/lib/safeguarding";
import { uploadApprenticeshipDoc } from "@/lib/uploadDoc";

export const Route = createFileRoute("/apprenticeships/register-apprentice")({
  head: () => ({
    meta: [
      { title: "Register as an Apprentice — Hineni" },
      { name: "description", content: "Register for apprenticeships, internships, learnerships and work experience in the Overberg." },
    ],
  }),
  component: Page,
});

const schema = z.object({
  full_name: z.string().trim().min(2).max(120),
  dob: z.string().min(1, "Required"),
  nationality: z.string().trim().min(1, "Required"),
  work_permit_status: z.string().trim().min(1, "Required"),
  contact_number: z.string().trim().min(4).max(20),
  whatsapp_number: z.string().trim().max(20).optional().or(z.literal("")),
  email: z.string().trim().email().optional().or(z.literal("")),
  physical_address: z.string().trim().max(200).optional().or(z.literal("")),
  town: z.string().trim().min(2).max(60),
  location_pref: z.string().trim().max(120).optional().or(z.literal("")),
  willing_to_relocate: z.boolean(),
  transport_available: z.boolean(),
  drivers_licence: z.boolean(),
  emergency_contact_name: z.string().trim().min(2, "Required").max(120),
  emergency_contact_relationship: z.string().trim().min(2, "Required").max(60),
  emergency_contact_phone: z.string().trim().min(4, "Required").max(20),
  highest_grade: z.string().trim().max(60).optional().or(z.literal("")),
  further_education: z.string().trim().max(200).optional().or(z.literal("")),
  qualifications: z.string().trim().max(500).optional().or(z.literal("")),
  certificates: z.string().trim().max(500).optional().or(z.literal("")),
  career_interests: z.array(z.string()).min(1, "Pick at least one"),
  opportunity_types: z.array(z.string()).min(1, "Pick at least one"),
  availability: z.array(z.string()).min(1, "Pick at least one"),
  why_interested: z.string().trim().max(1000).optional().or(z.literal("")),
  skills_to_learn: z.string().trim().max(1000).optional().or(z.literal("")),
  cv_url: z.string().trim().url().max(500).optional().or(z.literal("")),
  accept_terms: z.literal(true, { errorMap: () => ({ message: "You must accept the Terms & Disclaimer." }) }),
});

function ageFromDob(dob: string): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  return a;
}

function Page() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ code: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dob, setDob] = useState("");
  const [ack, setAck] = useState<SafeguardingAckState>(emptyAckState());
  const [disclaimer, setDisclaimer] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [consentFile, setConsentFile] = useState<File | null>(null);

  const age = useMemo(() => ageFromDob(dob), [dob]);
  const isMinor = age !== null && age < 18;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const raw = {
      full_name: fd.get("full_name") as string,
      dob: fd.get("dob") as string,
      nationality: fd.get("nationality") as string,
      work_permit_status: fd.get("work_permit_status") as string,
      contact_number: fd.get("contact_number") as string,
      whatsapp_number: fd.get("whatsapp_number") as string,
      email: fd.get("email") as string,
      physical_address: fd.get("physical_address") as string,
      town: fd.get("town") as string,
      location_pref: fd.get("location_pref") as string,
      willing_to_relocate: fd.get("willing_to_relocate") === "on",
      transport_available: fd.get("transport_available") === "on",
      drivers_licence: fd.get("drivers_licence") === "on",
      emergency_contact_name: fd.get("emergency_contact_name") as string,
      emergency_contact_relationship: fd.get("emergency_contact_relationship") as string,
      emergency_contact_phone: fd.get("emergency_contact_phone") as string,
      highest_grade: fd.get("highest_grade") as string,
      further_education: fd.get("further_education") as string,
      qualifications: fd.get("qualifications") as string,
      certificates: fd.get("certificates") as string,
      career_interests: fd.getAll("career_interests") as string[],
      opportunity_types: fd.getAll("opportunity_types") as string[],
      availability: fd.getAll("availability") as string[],
      why_interested: fd.get("why_interested") as string,
      skills_to_learn: fd.get("skills_to_learn") as string,
      cv_url: fd.get("cv_url") as string,
      accept_terms: fd.get("accept_terms") === "on",
    };
    const parsed = schema.safeParse(raw);
    const pcc = readPccFromForm(fd);
    const pccErrors: Record<string, string> = {};
    if (!pcc.pcc_status) pccErrors.pcc_status = "Please choose an option.";
    if (pcc.pcc_status === "have" && !pcc.pcc_issue_date)
      pccErrors.pcc_issue_date = "Issue date is required.";

    // Minor parent block validation
    const parent_full_name = (fd.get("parent_full_name") as string || "").trim();
    const parent_relationship = (fd.get("parent_relationship") as string || "").trim();
    const parent_phone = (fd.get("parent_phone") as string || "").trim();
    const parent_email = (fd.get("parent_email") as string || "").trim();
    if (isMinor) {
      if (!parent_full_name) pccErrors.parent_full_name = "Parent / guardian name is required.";
      if (!parent_relationship) pccErrors.parent_relationship = "Relationship is required.";
      if (!parent_phone) pccErrors.parent_phone = "Parent / guardian phone is required.";
    }

    if (!isAckComplete(ack)) pccErrors.safeguarding = "Please tick all safeguarding acknowledgements.";
    if (!disclaimer) pccErrors.disclaimer = "Please accept the disclaimer.";

    if (!parsed.success || Object.keys(pccErrors).length) {
      const errs: Record<string, string> = { ...pccErrors };
      if (!parsed.success) {
        parsed.error.issues.forEach((i) => (errs[i.path.join(".")] = i.message));
      }
      setErrors(errs);
      setSubmitting(false);
      toast.error("Please fix the highlighted fields.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const d = parsed.data;

    // Optional file uploads (only if signed in)
    let cv_path: string | null = null;
    let parent_consent_uploaded_path: string | null = null;
    if (cvFile) {
      const r = await uploadApprenticeshipDoc(cvFile, "cv");
      if ("path" in r) cv_path = r.path;
      else toast.message("CV not attached", { description: r.error });
    }
    if (isMinor && consentFile) {
      const r = await uploadApprenticeshipDoc(consentFile, "parent-consent");
      if ("path" in r) parent_consent_uploaded_path = r.path;
      else toast.message("Consent form not attached", { description: r.error });
    }

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("apprentices")
      .insert({
        full_name: d.full_name, dob: d.dob,
        nationality: d.nationality,
        work_permit_status: d.work_permit_status,
        contact_number: d.contact_number,
        whatsapp_number: d.whatsapp_number || null,
        email: d.email || null,
        physical_address: d.physical_address || null,
        town: d.town,
        location_pref: d.location_pref || null,
        willing_to_relocate: d.willing_to_relocate,
        transport_available: d.transport_available,
        drivers_licence: d.drivers_licence,
        emergency_contact_name: d.emergency_contact_name,
        emergency_contact_relationship: d.emergency_contact_relationship,
        emergency_contact_phone: d.emergency_contact_phone,
        parent_full_name: isMinor ? parent_full_name : null,
        parent_relationship: isMinor ? parent_relationship : null,
        parent_phone: isMinor ? parent_phone : null,
        parent_email: isMinor && parent_email ? parent_email : null,
        parent_consent_uploaded_path,
        cv_path,
        highest_grade: d.highest_grade || null,
        further_education: d.further_education || null,
        qualifications: d.qualifications || null,
        certificates: d.certificates || null,
        career_interests: d.career_interests,
        opportunity_types: d.opportunity_types,
        availability: d.availability,
        why_interested: d.why_interested || null,
        skills_to_learn: d.skills_to_learn || null,
        cv_url: d.cv_url || null,
        terms_accepted_at: now,
        terms_version: TERMS_VERSION,
        safeguarding_acknowledged_at: now,
        safeguarding_policy_version: SAFEGUARDING_POLICY_VERSION,
        disclaimer_accepted_at: now,
        pcc_status: pcc.pcc_status,
        pcc_issue_date: pcc.pcc_issue_date,
        pcc_number: pcc.pcc_number,
        pcc_wants_assistance: pcc.pcc_wants_assistance,
      })
      .select("id, reference_code")
      .single();
    if (error || !data) {
      toast.error(error?.message ?? "Could not submit.");
      setSubmitting(false);
      return;
    }
    await recordTermsAcceptance({ context: "provider_registration", referenceTable: "apprentices", referenceId: data.id });
    setDone({ code: data.reference_code });
    setSubmitting(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (done) {
    return (
      <SiteLayout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
          <CheckCircle2 className="size-16 text-brand-primary mx-auto mb-6" />
          <h1 className="text-3xl font-heading font-bold mb-3">Registration received</h1>
          <p className="text-brand-dark/70 mb-2">Your reference code:</p>
          <p className="text-2xl font-heading font-bold text-brand-primary mb-6">{done.code}</p>
          <p className="text-brand-dark/70 max-w-md mx-auto mb-8">
            A Hineni coordinator will review your application and be in touch.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/apprenticeships/opportunities" className="px-6 py-3 rounded-xl bg-brand-primary text-white">Browse opportunities</Link>
            <Link to="/apprenticeships" className="px-6 py-3 rounded-xl border border-brand-dark/15">Back to hub</Link>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3">Register as an Apprentice</h1>
        <p className="text-brand-dark/70 mb-8">Free, confidential and open to anyone seeking work experience and skills development.</p>
        <form onSubmit={onSubmit} className="space-y-8">
          <Fieldset title="Personal details">
            <Grid>
              <Field label="Full name" name="full_name" required error={errors.full_name} />
              <div>
                <Label>Date of birth <span className="text-destructive">*</span></Label>
                <input
                  name="dob" type="date" required value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white"
                />
                {errors.dob && <p className="text-xs text-destructive mt-1">{errors.dob}</p>}
              </div>
              <Select label="Nationality" name="nationality" required options={NATIONALITIES} error={errors.nationality} />
              <Select label="Work permit status" name="work_permit_status" required options={WORK_PERMIT_STATUSES} error={errors.work_permit_status} />
              <Field label="Contact number" name="contact_number" type="tel" required error={errors.contact_number} />
              <Field label="WhatsApp number" name="whatsapp_number" type="tel" />
              <Field label="Email" name="email" type="email" />
              <Field label="Town" name="town" required error={errors.town} />
            </Grid>
            <div className="mt-4">
              <Label>Physical address</Label>
              <input name="physical_address" className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white" />
            </div>
            <Grid>
              <div className="mt-4">
                <Label>Preferred location for opportunities</Label>
                <input name="location_pref" placeholder="e.g. Hermanus, Stanford, anywhere in the Overberg" className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white" />
              </div>
              <div className="mt-4 flex items-end">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="willing_to_relocate" className="accent-brand-primary" /> Willing to relocate for the right opportunity</label>
              </div>
            </Grid>
            <div className="flex flex-wrap gap-4 mt-4 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" name="transport_available" className="accent-brand-primary" /> Transport available</label>
              <label className="flex items-center gap-2"><input type="checkbox" name="drivers_licence" className="accent-brand-primary" /> Driver's licence</label>
            </div>
          </Fieldset>

          <Fieldset title="Emergency contact">
            <Grid>
              <Field label="Full name" name="emergency_contact_name" required error={errors.emergency_contact_name} />
              <Field label="Relationship" name="emergency_contact_relationship" required error={errors.emergency_contact_relationship} />
              <Field label="Phone number" name="emergency_contact_phone" type="tel" required error={errors.emergency_contact_phone} />
            </Grid>
          </Fieldset>

          {isMinor && (
            <Fieldset title="Parent / Guardian (required for under-18s)">
              <div className="text-sm text-brand-dark/70 mb-3">
                You are under 18, so we require parent or guardian details and consent.
                <a
                  href="/parent-consent-form.pdf"
                  download
                  className="inline-flex items-center gap-1 ml-2 text-brand-primary underline"
                >
                  Download consent form
                </a>
              </div>
              <Grid>
                <Field label="Parent / guardian full name" name="parent_full_name" required error={errors.parent_full_name} />
                <Field label="Relationship to applicant" name="parent_relationship" required error={errors.parent_relationship} />
                <Field label="Parent / guardian phone" name="parent_phone" type="tel" required error={errors.parent_phone} />
                <Field label="Parent / guardian email" name="parent_email" type="email" />
              </Grid>
              <div className="mt-4">
                <Label>Upload signed consent form (PDF or image)</Label>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) => setConsentFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm"
                />
                <p className="text-xs text-brand-dark/55 mt-1">
                  Optional at this stage — you may also email it later. Sign in to attach files now.
                </p>
              </div>
            </Fieldset>
          )}

          <Fieldset title="Education">
            <Grid>
              <Field label="Highest school grade completed" name="highest_grade" />
              <Field label="Further education (e.g. TVET, university)" name="further_education" />
            </Grid>
            <div className="mt-4">
              <Label>Qualifications</Label>
              <textarea name="qualifications" rows={2} className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white" />
            </div>
            <div className="mt-4">
              <Label>Certificates</Label>
              <textarea name="certificates" rows={2} className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white" />
            </div>
          </Fieldset>

          <Fieldset title="Career interests"><CheckGrid name="career_interests" options={CAREER_INTERESTS} error={errors.career_interests} /></Fieldset>
          <Fieldset title="Opportunity types"><CheckGrid name="opportunity_types" options={OPPORTUNITY_TYPES} error={errors.opportunity_types} cols={2} /></Fieldset>
          <Fieldset title="Availability"><CheckGrid name="availability" options={AVAILABILITY} error={errors.availability} cols={2} /></Fieldset>

          <Fieldset title="A bit more about you">
            <div><Label>Why are you interested in this field?</Label>
              <textarea name="why_interested" rows={3} className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white" />
            </div>
            <div className="mt-4"><Label>What skills would you like to learn?</Label>
              <textarea name="skills_to_learn" rows={3} className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white" />
            </div>
            <Grid>
              <div className="mt-4"><Label>CV link (optional, e.g. Google Drive)</Label>
                <input name="cv_url" type="url" placeholder="https://…" className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white" />
              </div>
              <div className="mt-4">
                <Label>Upload CV (PDF or DOCX)</Label>
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-brand-dark/10 cursor-pointer hover:bg-brand-soft text-sm">
                  <Upload className="size-4" />
                  <span>{cvFile ? cvFile.name : "Choose file"}</span>
                  <input
                    type="file"
                    accept="application/pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                <p className="text-xs text-brand-dark/55 mt-1">Sign in to attach files; otherwise share a link above.</p>
              </div>
            </Grid>
          </Fieldset>

          <PccSection errors={errors} />

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
              {submitting && <Loader2 className="size-4 animate-spin" />} Submit registration
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
function Select({ label, name, required, options, error }: { label: string; name: string; required?: boolean; options: readonly string[]; error?: string }) {
  return <div><Label>{label}{required && <span className="text-destructive"> *</span>}</Label>
    <select name={name} required={required} defaultValue="" className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white">
      <option value="">Select…</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
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
