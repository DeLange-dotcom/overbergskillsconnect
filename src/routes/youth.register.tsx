import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { z } from "zod";
import { SiteLayout } from "@/components/site/SiteLayout";
import { TermsAcceptance } from "@/components/site/TermsAcceptance";
import { PccSection, readPccFromForm } from "@/components/site/PccSection";
import { supabase } from "@/integrations/supabase/client";
import {
  YOUTH_INTERESTS,
  YOUTH_OPPORTUNITY_TYPES,
  YOUTH_AVAILABILITY,
  YOUTH_SKILLS,
  YOUTH_EDUCATION_LEVELS,
  youthAgeGroupFromDob,
} from "@/lib/youth";
import { TERMS_VERSION, recordTermsAcceptance } from "@/lib/terms";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/youth/register")({
  head: () => ({
    meta: [
      { title: "Register as a Young Person — Hineni Youth Hub" },
      {
        name: "description",
        content:
          "Free registration for young people aged 15–25 in the Overberg. Find opportunities, training and mentorship.",
      },
    ],
  }),
  component: RegisterYouth,
});

const baseSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  first_name: z.string().trim().max(60).optional().or(z.literal("")),
  last_name: z.string().trim().max(60).optional().or(z.literal("")),
  gender: z.string().trim().max(30).optional().or(z.literal("")),
  id_number: z.string().trim().max(30).optional().or(z.literal("")),
  dob: z.string().min(1, "Date of birth is required"),
  town: z.string().trim().min(2).max(60),
  physical_address: z.string().trim().max(300).optional().or(z.literal("")),
  school: z.string().trim().max(120).optional().or(z.literal("")),
  education_level: z.string().trim().max(60).optional().or(z.literal("")),
  currently_attending_school: z.boolean(),
  matric_completed: z.boolean(),
  further_education: z.string().trim().max(120).optional().or(z.literal("")),
  mobile_number: z.string().trim().max(20).optional().or(z.literal("")),
  email: z.string().trim().email().optional().or(z.literal("")),
  emergency_contact_name: z.string().trim().min(2).max(120),
  emergency_contact_phone: z.string().trim().min(4).max(20),
  interests: z.array(z.string()).min(1, "Choose at least one interest"),
  opportunity_types: z.array(z.string()).min(1, "Choose at least one"),
  availability: z.array(z.string()).min(1, "Choose at least one"),
  skills: z.array(z.string()),
  languages: z.string().trim().max(200).optional().or(z.literal("")),
  learning_city_interest: z.boolean(),
  mentor_match_opt_in: z.boolean(),
  // Guardian (required if under 18)
  guardian_name: z.string().trim().max(120).optional().or(z.literal("")),
  guardian_relationship: z.string().trim().max(60).optional().or(z.literal("")),
  guardian_phone: z.string().trim().max(20).optional().or(z.literal("")),
  guardian_email: z.string().trim().max(120).optional().or(z.literal("")),
  guardian_consent_given: z.boolean(),
  parent_consent_method: z.enum(["digital", "uploaded"]).optional(),
  applicant_declaration: z.literal(true, { errorMap: () => ({ message: "You must confirm the applicant declaration." }) }),
  liability_accepted: z.literal(true, { errorMap: () => ({ message: "You must accept the platform disclaimer." }) }),
  accept_terms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the Terms & Disclaimer." }),
  }),
});

function RegisterYouth() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ code: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dob, setDob] = useState("");

  const ageGroup = useMemo(() => youthAgeGroupFromDob(dob), [dob]);
  const isMinor = ageGroup === "15-17";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const raw = {
      full_name: fd.get("full_name") as string,
      dob: fd.get("dob") as string,
      town: fd.get("town") as string,
      school: fd.get("school") as string,
      education_level: fd.get("education_level") as string,
      mobile_number: fd.get("mobile_number") as string,
      email: fd.get("email") as string,
      emergency_contact_name: fd.get("emergency_contact_name") as string,
      emergency_contact_phone: fd.get("emergency_contact_phone") as string,
      interests: fd.getAll("interests") as string[],
      opportunity_types: fd.getAll("opportunity_types") as string[],
      availability: fd.getAll("availability") as string[],
      skills: fd.getAll("skills") as string[],
      languages: fd.get("languages") as string,
      learning_city_interest: fd.get("learning_city_interest") === "on",
      mentor_match_opt_in: fd.get("mentor_match_opt_in") === "on",
      guardian_name: fd.get("guardian_name") as string,
      guardian_relationship: fd.get("guardian_relationship") as string,
      guardian_phone: fd.get("guardian_phone") as string,
      guardian_email: fd.get("guardian_email") as string,
      guardian_consent_given: fd.get("guardian_consent_given") === "on",
      accept_terms: fd.get("accept_terms") === "on",
    };

    const parsed = baseSchema.safeParse(raw);
    const pcc = readPccFromForm(fd);
    const pccErrors: Record<string, string> = {};
    if (!pcc.pcc_status) pccErrors.pcc_status = "Please choose an option.";
    if (pcc.pcc_status === "have" && !pcc.pcc_issue_date)
      pccErrors.pcc_issue_date = "Issue date is required.";

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
    const computedGroup = youthAgeGroupFromDob(d.dob);
    if (!computedGroup) {
      setErrors({ dob: "You must be between 15 and 25 to register." });
      setSubmitting(false);
      return;
    }

    if (computedGroup === "15-17") {
      const guardianErrs: Record<string, string> = {};
      if (!d.guardian_name) guardianErrs.guardian_name = "Required for under-18s";
      if (!d.guardian_relationship) guardianErrs.guardian_relationship = "Required";
      if (!d.guardian_phone) guardianErrs.guardian_phone = "Required";
      if (!d.guardian_consent_given)
        guardianErrs.guardian_consent_given = "Parent/guardian consent is required.";
      if (Object.keys(guardianErrs).length) {
        setErrors(guardianErrs);
        setSubmitting(false);
        toast.error("Parent or guardian consent is required.");
        return;
      }
    }

    const { data, error } = await supabase
      .from("youth_profiles")
      .insert({
        full_name: d.full_name,
        dob: d.dob,
        town: d.town,
        school: d.school || null,
        education_level: d.education_level || null,
        mobile_number: d.mobile_number || null,
        email: d.email || null,
        emergency_contact_name: d.emergency_contact_name,
        emergency_contact_phone: d.emergency_contact_phone,
        interests: d.interests,
        opportunity_types: d.opportunity_types,
        availability: d.availability,
        skills: d.skills,
        languages: d.languages ? d.languages.split(",").map((s) => s.trim()).filter(Boolean) : [],
        learning_city_interest: d.learning_city_interest,
        mentor_match_opt_in: d.mentor_match_opt_in,
        guardian_name: d.guardian_name || null,
        guardian_relationship: d.guardian_relationship || null,
        guardian_phone: d.guardian_phone || null,
        guardian_email: d.guardian_email || null,
        guardian_consent_given: d.guardian_consent_given,
        guardian_consent_at: d.guardian_consent_given ? new Date().toISOString() : null,
        terms_accepted_at: new Date().toISOString(),
        terms_version_accepted: TERMS_VERSION,
        pcc_status: pcc.pcc_status,
        pcc_issue_date: pcc.pcc_issue_date,
        pcc_number: pcc.pcc_number,
        pcc_wants_assistance: pcc.pcc_wants_assistance,
      })
      .select("id, application_code")
      .single();

    if (error || !data) {
      toast.error(error?.message ?? "Could not submit your registration.");
      setSubmitting(false);
      return;
    }

    await recordTermsAcceptance({
      context: "provider_registration",
      referenceTable: "youth_profiles",
      referenceId: data.id,
    });

    setDone({ code: data.application_code });
    setSubmitting(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (done) {
    return (
      <SiteLayout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
          <CheckCircle2 className="size-16 text-brand-primary mx-auto mb-6" />
          <h1 className="text-3xl font-heading font-bold mb-3">Registration received</h1>
          <p className="text-brand-dark/70 mb-2">Your reference code is:</p>
          <p className="text-2xl font-heading font-bold text-brand-primary mb-6">{done.code}</p>
          <p className="text-brand-dark/70 max-w-md mx-auto mb-8">
            A Hineni coordinator will be in touch. In the meantime, you can browse opportunities.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/youth/opportunities" className="px-6 py-3 rounded-xl bg-brand-primary text-white">
              Browse opportunities
            </Link>
            <Link to="/youth" className="px-6 py-3 rounded-xl border border-brand-dark/15">
              Back to Youth Hub
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
          Register as a young person
        </h1>
        <p className="text-brand-dark/70 mb-8">
          For young people aged 15 to 25 in the Overberg. Free, simple and confidential.
        </p>

        <form onSubmit={handleSubmit} className="space-y-10">
          <Fieldset title="About you">
            <Grid>
              <Field label="Full name" name="full_name" required error={errors.full_name} />
              <Field
                label="Date of birth"
                name="dob"
                type="date"
                required
                error={errors.dob}
                onChange={(e) => setDob(e.target.value)}
              />
              <Field label="Town" name="town" required error={errors.town} />
              <Field label="Mobile / WhatsApp" name="mobile_number" type="tel" />
              <Field label="Email (optional)" name="email" type="email" />
              <div>
                <Label>Education level</Label>
                <select
                  name="education_level"
                  className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white"
                  defaultValue=""
                >
                  <option value="">Select…</option>
                  {YOUTH_EDUCATION_LEVELS.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
              <Field label="School / college" name="school" />
            </Grid>
            {ageGroup && (
              <p className="text-xs mt-3 text-brand-primary">
                Detected age group: <strong>{ageGroup}</strong>
                {isMinor && " — parent/guardian consent required below."}
              </p>
            )}
          </Fieldset>

          {isMinor && (
            <Fieldset title="Parent or guardian (required for under-18s)">
              <Grid>
                <Field label="Parent/guardian full name" name="guardian_name" required error={errors.guardian_name} />
                <Field label="Relationship" name="guardian_relationship" required error={errors.guardian_relationship} />
                <Field label="Phone" name="guardian_phone" type="tel" required error={errors.guardian_phone} />
                <Field label="Email (optional)" name="guardian_email" type="email" />
              </Grid>
              <label className="flex items-start gap-2 mt-4 text-sm">
                <input type="checkbox" name="guardian_consent_given" className="mt-1 accent-brand-primary" />
                <span>
                  I am the parent or legal guardian and I consent to this young person registering
                  with Hineni, being contacted about suitable opportunities, and being introduced
                  to vetted organisations. I understand minors will not be matched to hazardous
                  work or work prohibited under South African labour law.
                </span>
              </label>
              {errors.guardian_consent_given && (
                <p className="text-xs text-destructive mt-1">{errors.guardian_consent_given}</p>
              )}
            </Fieldset>
          )}

          <Fieldset title="Emergency contact">
            <Grid>
              <Field
                label="Contact name"
                name="emergency_contact_name"
                required
                error={errors.emergency_contact_name}
              />
              <Field
                label="Contact phone"
                name="emergency_contact_phone"
                type="tel"
                required
                error={errors.emergency_contact_phone}
              />
            </Grid>
          </Fieldset>

          <Fieldset title="Your interests">
            <CheckboxGrid
              name="interests"
              options={YOUTH_INTERESTS as unknown as { value: string; label: string }[]}
              error={errors.interests}
            />
          </Fieldset>

          <Fieldset title="Opportunity types you'd like">
            <CheckboxGrid
              name="opportunity_types"
              options={YOUTH_OPPORTUNITY_TYPES as unknown as { value: string; label: string }[]}
              error={errors.opportunity_types}
              cols={3}
            />
          </Fieldset>

          <Fieldset title="When are you available?">
            <CheckboxGrid
              name="availability"
              options={YOUTH_AVAILABILITY as unknown as { value: string; label: string }[]}
              error={errors.availability}
              cols={2}
            />
          </Fieldset>

          <Fieldset title="Your skills">
            <CheckboxGrid
              name="skills"
              options={YOUTH_SKILLS as unknown as { value: string; label: string }[]}
              cols={3}
            />
            <div className="mt-4">
              <Label>Languages you speak (comma separated)</Label>
              <input
                name="languages"
                placeholder="e.g. English, Afrikaans, isiXhosa"
                className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white"
              />
            </div>
          </Fieldset>

          <Fieldset title="Future opportunities">
            <label className="flex items-start gap-2 text-sm mb-2">
              <input type="checkbox" name="learning_city_interest" className="mt-1 accent-brand-primary" />
              <span>I'd like to hear about Hineni Learning City programmes.</span>
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" name="mentor_match_opt_in" className="mt-1 accent-brand-primary" />
              <span>I'd like to be matched with a mentor when available.</span>
            </label>
          </Fieldset>

          <PccSection errors={errors} />

          <Fieldset title="Terms & Disclaimer (required)">
            <TermsAcceptance name="accept_terms" error={errors.accept_terms} />
          </Fieldset>

          <div className="flex flex-wrap gap-3 items-center pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-primary text-white font-medium hover:brightness-110 disabled:opacity-60"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Submit registration
            </button>
            <Link to="/youth" className="text-sm text-brand-dark/60 hover:text-brand-primary underline">
              Back to Youth Hub
            </Link>
          </div>
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

function Field({
  label,
  name,
  type = "text",
  required,
  error,
  onChange,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <input
        name={name}
        type={type}
        required={required}
        onChange={onChange}
        className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white"
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

function CheckboxGrid({
  name,
  options,
  error,
  cols = 3,
}: {
  name: string;
  options: { value: string; label: string }[];
  error?: string;
  cols?: number;
}) {
  return (
    <div>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${Math.min(cols, 2)}, minmax(0,1fr))` }}
      >
        <div
          className="contents sm:!grid sm:gap-2"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}
        />
        {options.map((o) => (
          <label
            key={o.value}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-brand-dark/10 hover:bg-brand-soft cursor-pointer text-sm"
          >
            <input type="checkbox" name={name} value={o.value} className="accent-brand-primary" />
            {o.label}
          </label>
        ))}
      </div>
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
    </div>
  );
}
