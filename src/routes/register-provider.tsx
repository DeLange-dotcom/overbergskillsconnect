import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { SiteLayout } from "@/components/site/SiteLayout";
import { TermsAcceptance } from "@/components/site/TermsAcceptance";
import { PccSection, readPccFromForm } from "@/components/site/PccSection";
import { supabase } from "@/integrations/supabase/client";
import {
  SERVICE_CATEGORIES,
  DAYS,
  HOURS,
  LOOKING_FOR,
  TRAVEL,
} from "@/lib/constants";
import { TERMS_VERSION, recordTermsAcceptance } from "@/lib/terms";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/register-provider")({
  head: () => ({
    meta: [
      { title: "Register as a Service Provider — Hineni" },
      {
        name: "description",
        content:
          "Register your skills with Hineni. Free, simple, and helps you safely find work in the Overberg.",
      },
    ],
  }),
  component: RegisterProvider,
});

const schema = z.object({
  full_name: z.string().trim().min(2).max(120),
  id_passport_number: z.string().trim().min(4).max(40),
  nationality: z.string().trim().min(2).max(60),
  work_permit: z.enum(["yes", "no", "na"]).optional(),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  mobile_number: z.string().trim().min(7).max(20),
  whatsapp_number: z.string().trim().max(20).optional().or(z.literal("")),
  email: z.string().trim().email().optional().or(z.literal("")),
  physical_address: z.string().trim().min(3).max(200),
  town: z.string().trim().min(2).max(60),
  services: z.array(z.string()).min(1, "Select at least one service"),
  skills_summary: z.string().trim().min(5).max(2000),
  years_experience: z.coerce.number().int().min(0).max(80).optional(),
  previous_employer: z.string().trim().max(200).optional().or(z.literal("")),
  ref1_name: z.string().trim().min(2).max(120),
  ref1_contact: z.string().trim().min(4).max(80),
  ref2_name: z.string().trim().max(120).optional().or(z.literal("")),
  ref2_contact: z.string().trim().max(80).optional().or(z.literal("")),
  available_immediately: z.boolean(),
  looking_for: z.array(z.string()).min(1, "Choose one or more"),
  days_available: z.array(z.string()).min(1, "Choose at least one day"),
  typical_hours: z.array(z.string()).min(1, "Choose at least one"),
  max_travel: z.enum(["own_town", "within_20km", "within_50km", "overberg_wide"]),
  own_transport: z.boolean(),
  drivers_licence: z.boolean(),
  criminal_conviction: z.boolean(),
  criminal_conviction_details: z.string().trim().max(1000).optional().or(z.literal("")),
  consent_store_info: z.literal(true, { errorMap: () => ({ message: "Required" }) }),
  consent_reference_checks: z.literal(true, { errorMap: () => ({ message: "Required" }) }),
  consent_background_checks: z.literal(true, { errorMap: () => ({ message: "Required" }) }),
  consent_share_authorities: z.literal(true, { errorMap: () => ({ message: "Required" }) }),
  consent_no_guarantee: z.literal(true, { errorMap: () => ({ message: "Required" }) }),
  accept_terms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the Terms & Disclaimer to continue." }),
  }),
}).superRefine((data, ctx) => {
  const isSA = /south\s*afric/i.test(data.nationality.trim());
  if (!isSA) {
    if (!data.work_permit || data.work_permit === "na") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["work_permit"],
        message: "Please confirm whether you hold a valid South African work permit.",
      });
    }
  }
});


function RegisterProvider() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ code: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [nationalityChoice, setNationalityChoice] = useState<"" | "south_african" | "other">("");
  const [nationalityOther, setNationalityOther] = useState("");
  const nationality =
    nationalityChoice === "south_african"
      ? "South African"
      : nationalityChoice === "other"
        ? nationalityOther
        : "";
  const [workPermit, setWorkPermit] = useState<"yes" | "no" | "">("");

  const isSouthAfrican = nationalityChoice === "south_african";
  const isForeign = nationalityChoice === "other";
  const terminated = isForeign && workPermit === "no";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    if (terminated) {
      toast.error(
        "Application cannot continue without a valid South African work permit."
      );
      return;
    }

    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const raw = {
      full_name: fd.get("full_name") as string,
      id_passport_number: fd.get("id_passport_number") as string,
      nationality: fd.get("nationality") as string,
      work_permit: (fd.get("work_permit") as string) || (isSouthAfrican ? "na" : undefined),
      date_of_birth: fd.get("date_of_birth") as string,

      mobile_number: fd.get("mobile_number") as string,
      whatsapp_number: fd.get("whatsapp_number") as string,
      email: fd.get("email") as string,
      physical_address: fd.get("physical_address") as string,
      town: fd.get("town") as string,
      services: fd.getAll("services") as string[],
      skills_summary: fd.get("skills_summary") as string,
      years_experience: fd.get("years_experience") as string,
      previous_employer: fd.get("previous_employer") as string,
      ref1_name: fd.get("ref1_name") as string,
      ref1_contact: fd.get("ref1_contact") as string,
      ref2_name: fd.get("ref2_name") as string,
      ref2_contact: fd.get("ref2_contact") as string,
      available_immediately: fd.get("available_immediately") === "on",
      looking_for: fd.getAll("looking_for") as string[],
      days_available: fd.getAll("days_available") as string[],
      typical_hours: fd.getAll("typical_hours") as string[],
      max_travel: fd.get("max_travel") as string,
      own_transport: fd.get("own_transport") === "on",
      drivers_licence: fd.get("drivers_licence") === "on",
      criminal_conviction: fd.get("criminal_conviction") === "yes",
      criminal_conviction_details: fd.get("criminal_conviction_details") as string,
      consent_store_info: fd.get("consent_store_info") === "on",
      consent_reference_checks: fd.get("consent_reference_checks") === "on",
      consent_background_checks: fd.get("consent_background_checks") === "on",
      consent_share_authorities: fd.get("consent_share_authorities") === "on",
      consent_no_guarantee: fd.get("consent_no_guarantee") === "on",
      accept_terms: fd.get("accept_terms") === "on",
    };

    const parsed = schema.safeParse(raw);
    const pcc = readPccFromForm(fd);
    const pccErrors: Record<string, string> = {};
    if (!pcc.pcc_status) pccErrors.pcc_status = "Please choose an option.";
    if (pcc.pcc_status === "have" && !pcc.pcc_issue_date)
      pccErrors.pcc_issue_date = "Issue date is required.";

    if (!parsed.success || Object.keys(pccErrors).length) {
      const errs: Record<string, string> = { ...pccErrors };
      if (!parsed.success) {
        parsed.error.issues.forEach((i) => {
          errs[i.path.join(".")] = i.message;
        });
      }
      setErrors(errs);
      setSubmitting(false);
      toast.error("Please fix the highlighted fields.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const d = parsed.data;
    const providerId = crypto.randomUUID();
    const applicationCode = `HIN-${providerId.slice(0, 8).toUpperCase()}`;
    const { error } = await supabase
      .from("service_providers")
      .insert({
        id: providerId,
        application_code: applicationCode,
        full_name: d.full_name,
        id_passport_number: d.id_passport_number,
        nationality: d.nationality,
        date_of_birth: d.date_of_birth,
        mobile_number: d.mobile_number,
        whatsapp_number: d.whatsapp_number || null,
        email: d.email || null,
        physical_address: d.physical_address,
        town: d.town,
        services: d.services as never,
        skills_summary: d.skills_summary,
        years_experience: d.years_experience ?? null,
        previous_employer: d.previous_employer || null,
        available_immediately: d.available_immediately,
        looking_for: d.looking_for as never,
        days_available: d.days_available,
        typical_hours: d.typical_hours,
        max_travel: d.max_travel as never,
        own_transport: d.own_transport,
        drivers_licence: d.drivers_licence,
        criminal_conviction: d.criminal_conviction,
        criminal_conviction_details: d.criminal_conviction_details || null,
        consent_store_info: d.consent_store_info,
        consent_reference_checks: d.consent_reference_checks,
        consent_background_checks: d.consent_background_checks,
        consent_share_authorities: d.consent_share_authorities,
        consent_no_guarantee: d.consent_no_guarantee,
        terms_accepted_at: new Date().toISOString(),
        terms_version_accepted: TERMS_VERSION,
        pcc_status: pcc.pcc_status,
        pcc_issue_date: pcc.pcc_issue_date,
        pcc_number: pcc.pcc_number,
        pcc_wants_assistance: pcc.pcc_wants_assistance,
      });

    if (error) {
      toast.error(error?.message ?? "Could not submit your application.");
      setSubmitting(false);
      return;
    }

    // Insert references
    await supabase.from("provider_references").insert([
      {
        service_provider_id: providerId,
        reference_name: d.ref1_name,
        reference_contact: d.ref1_contact,
      },
      ...(d.ref2_name && d.ref2_contact
        ? [
            {
              service_provider_id: providerId,
              reference_name: d.ref2_name,
              reference_contact: d.ref2_contact,
            },
          ]
        : []),
    ]);

    // Record terms acceptance for the audit log
    await recordTermsAcceptance({
      context: "provider_registration",
      referenceTable: "service_providers",
      referenceId: providerId,
    });

    // Surface PCC assistance request to the contact-requests admin queue.
    if (pcc.pcc_wants_assistance) {
      await supabase.from("contact_requests").insert({
        service_provider_id: providerId,
        requester_name: d.full_name,
        requester_contact: d.mobile_number,
        requester_email: d.email || null,
        message:
          "Applicant requests assistance with obtaining a Police Clearance Certificate (PCC).",
      });
    }

    setDone({ code: applicationCode });
    setSubmitting(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (done) {
    return (
      <SiteLayout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
          <CheckCircle2 className="size-16 text-brand-primary mx-auto mb-6" />
          <h1 className="text-3xl font-heading font-bold mb-3">Application received</h1>
          <p className="text-brand-dark/70 mb-2">
            Thank you. Your application reference is:
          </p>
          <p className="text-2xl font-heading font-bold text-brand-primary mb-6">{done.code}</p>
          <p className="text-brand-dark/70 max-w-md mx-auto mb-8">
            A Hineni coordinator will be in touch to verify your documents and references. This
            usually takes a few working days. Registration does not guarantee work — but it makes
            you safely findable.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/" className="px-6 py-3 rounded-xl bg-brand-primary text-white">
              Back to home
            </Link>
            <Link
              to="/donate"
              className="px-6 py-3 rounded-xl border border-brand-dark/15 hover:bg-brand-soft"
            >
              Support Hineni
            </Link>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3">
          Register as a Service Provider
        </h1>
        <p className="text-brand-dark/70 mb-8">
          Tell us about your skills. All information is kept private and only used for vetting.
        </p>

        <form onSubmit={handleSubmit} className="space-y-10">
          <Fieldset title="About you">
            <Grid>
              <Field label="Full name" name="full_name" required error={errors.full_name} />
              <Field
                label="ID or passport number"
                name="id_passport_number"
                required
                error={errors.id_passport_number}
              />
              <div>
                <Label>
                  Nationality<span className="text-destructive">*</span>
                </Label>
                <input
                  name="nationality"
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  placeholder="e.g. South African"
                  className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white focus:outline-none focus:border-brand-primary"
                />
                {errors.nationality && (
                  <p className="text-xs text-destructive mt-1">{errors.nationality}</p>
                )}
              </div>
              {isForeign && (
                <div className="sm:col-span-2">
                  <Label>
                    Do you hold a valid South African work permit?
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-6 mt-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="work_permit"
                        value="yes"
                        checked={workPermit === "yes"}
                        onChange={() => setWorkPermit("yes")}
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="work_permit"
                        value="no"
                        checked={workPermit === "no"}
                        onChange={() => setWorkPermit("no")}
                      />
                      <span>No</span>
                    </label>
                  </div>
                  {errors.work_permit && (
                    <p className="text-xs text-destructive mt-1">{errors.work_permit}</p>
                  )}
                  {terminated && (
                    <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                      Unfortunately, Hineni can only register providers who are
                      South African citizens or hold a valid South African work
                      permit. Your application cannot be submitted.
                    </div>
                  )}
                </div>
              )}

              <Field
                label="Date of birth"
                name="date_of_birth"
                type="date"
                required
                error={errors.date_of_birth}
              />
              <Field
                label="Mobile number"
                name="mobile_number"
                type="tel"
                required
                error={errors.mobile_number}
              />
              <Field label="WhatsApp number (optional)" name="whatsapp_number" type="tel" />
              <Field label="Email (optional)" name="email" type="email" />
              <Field label="Town / area" name="town" required error={errors.town} />
            </Grid>
            <Field
              label="Physical address"
              name="physical_address"
              required
              error={errors.physical_address}
              className="mt-4"
            />
          </Fieldset>

          <Fieldset title="Your skills">
            <CheckboxGrid
              label="Services you offer"
              name="services"
              options={SERVICE_CATEGORIES as unknown as { value: string; label: string }[]}
              error={errors.services}
            />
            <TextArea
              label="Skills and experience"
              name="skills_summary"
              required
              placeholder="Tell us about what you do best, languages, training, etc."
              error={errors.skills_summary}
            />
            <Grid className="mt-4">
              <Field
                label="Years of experience"
                name="years_experience"
                type="number"
                min={0}
                max={80}
              />
              <Field label="Previous employer" name="previous_employer" />
            </Grid>
          </Fieldset>

          <Fieldset title="Availability">
            <label className="flex items-center gap-2 mb-4">
              <input type="checkbox" name="available_immediately" className="accent-brand-primary" />
              <span>Available immediately</span>
            </label>
            <CheckboxGrid
              label="Looking for"
              name="looking_for"
              options={LOOKING_FOR as unknown as { value: string; label: string }[]}
              error={errors.looking_for}
              cols={4}
            />
            <CheckboxGrid
              label="Days available"
              name="days_available"
              options={DAYS as unknown as { value: string; label: string }[]}
              error={errors.days_available}
              cols={7}
            />
            <CheckboxGrid
              label="Typical hours"
              name="typical_hours"
              options={HOURS as unknown as { value: string; label: string }[]}
              error={errors.typical_hours}
              cols={4}
            />
            <div className="mt-4">
              <Label>Maximum travel distance</Label>
              <select
                name="max_travel"
                defaultValue="own_town"
                className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white"
              >
                {TRAVEL.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <Grid className="mt-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="own_transport" className="accent-brand-primary" />
                <span>Own transport</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="drivers_licence" className="accent-brand-primary" />
                <span>Driver's licence</span>
              </label>
            </Grid>
          </Fieldset>

          <Fieldset title="References">
            <Grid>
              <Field label="Reference 1 — name" name="ref1_name" required error={errors.ref1_name} />
              <Field
                label="Reference 1 — phone or email"
                name="ref1_contact"
                required
                error={errors.ref1_contact}
              />
              <Field label="Reference 2 — name (optional)" name="ref2_name" />
              <Field label="Reference 2 — phone or email (optional)" name="ref2_contact" />
            </Grid>
            <p className="text-xs text-brand-dark/60 mt-3">
              You can upload your ID, work permit and CV when a coordinator contacts you.
            </p>
          </Fieldset>

          <Fieldset title="Criminal record declaration">
            <Label>Have you ever been convicted of a criminal offence?</Label>
            <div className="flex gap-6 mb-3">
              <label className="flex items-center gap-2">
                <input type="radio" name="criminal_conviction" value="no" defaultChecked /> No
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="criminal_conviction" value="yes" /> Yes
              </label>
            </div>
            <TextArea
              label="If yes, please provide details"
              name="criminal_conviction_details"
              placeholder="Optional — only required if you answered Yes above."
            />
          </Fieldset>

          <PccSection errors={errors} />

          <Fieldset title="Consent (required)">
            <div className="space-y-3 text-sm">
              <Consent name="consent_store_info" error={errors.consent_store_info}>
                I consent to Hineni storing the information in this application.
              </Consent>
              <Consent name="consent_reference_checks" error={errors.consent_reference_checks}>
                I consent to Hineni contacting my references.
              </Consent>
              <Consent name="consent_background_checks" error={errors.consent_background_checks}>
                I consent to ID and background checks being performed.
              </Consent>
              <Consent name="consent_share_authorities" error={errors.consent_share_authorities}>
                I consent to my information being shared with authorised vetting partners where
                lawful and necessary.
              </Consent>
              <Consent name="consent_no_guarantee" error={errors.consent_no_guarantee}>
                I understand that registration does not guarantee work.
              </Consent>
            </div>
          </Fieldset>

          <Fieldset title="Terms & Disclaimer (required)">
            <TermsAcceptance name="accept_terms" error={errors.accept_terms} />
          </Fieldset>

          <div className="flex flex-wrap gap-3 items-center pt-4">
            <button
              type="submit"
              disabled={submitting || terminated}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-primary text-white font-medium hover:brightness-110 disabled:opacity-60"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Submit application
            </button>
            <Link to="/privacy" className="text-sm text-brand-dark/60 hover:text-brand-primary underline">
              Read our privacy notice
            </Link>
          </div>
        </form>
      </div>
    </SiteLayout>
  );
}

function Fieldset({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-brand-dark/5 rounded-2xl p-5 sm:p-7">
      <h2 className="font-heading text-xl font-semibold mb-5">{title}</h2>
      {children}
    </section>
  );
}

function Grid({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`grid gap-4 sm:grid-cols-2 ${className}`}>{children}</div>;
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium mb-1.5 text-brand-dark">{children}</label>;
}

function Field({
  label,
  name,
  type = "text",
  required,
  error,
  className = "",
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
  className?: string;
  min?: number;
  max?: number;
  placeholder?: string;
}) {
  return (
    <div className={className}>
      <Label>
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <input
        name={name}
        type={type}
        {...rest}
        className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white focus:outline-none focus:border-brand-primary"
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

function TextArea({
  label,
  name,
  required,
  error,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
}) {
  return (
    <div className="mt-3">
      <Label>
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <textarea
        name={name}
        rows={4}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white focus:outline-none focus:border-brand-primary"
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

function CheckboxGrid({
  label,
  name,
  options,
  error,
  cols = 2,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  error?: string;
  cols?: number;
}) {
  const colsClass =
    cols === 7
      ? "grid-cols-7"
      : cols === 4
        ? "grid-cols-2 sm:grid-cols-4"
        : "grid-cols-2 sm:grid-cols-3";
  return (
    <div className="mt-4">
      <Label>{label}</Label>
      <div className={`grid gap-2 ${colsClass}`}>
        {options.map((o) => (
          <label
            key={o.value}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-brand-dark/10 bg-white hover:bg-brand-soft cursor-pointer text-sm"
          >
            <input type="checkbox" name={name} value={o.value} className="accent-brand-primary" />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

function Consent({
  name,
  children,
  error,
}: {
  name: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div>
      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" name={name} className="mt-1 accent-brand-primary" />
        <span className="text-brand-dark/80">{children}</span>
      </label>
      {error && <p className="text-xs text-destructive mt-1 ml-7">{error}</p>}
    </div>
  );
}
