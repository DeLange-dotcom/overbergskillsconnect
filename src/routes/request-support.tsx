import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { SiteLayout } from "@/components/site/SiteLayout";
import { TermsAcceptance } from "@/components/site/TermsAcceptance";
import { supabase } from "@/integrations/supabase/client";
import { SERVICE_CATEGORIES, DAYS, HOURS, LOOKING_FOR } from "@/lib/constants";
import { TERMS_VERSION, recordTermsAcceptance } from "@/lib/terms";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/request-support")({
  head: () => ({
    meta: [
      { title: "Request Support — Hineni Skills Register" },
      {
        name: "description",
        content:
          "Tell us what help you need. Hineni will connect you with a vetted community member.",
      },
    ],
  }),
  component: RequestSupport,
});

const schema = z.object({
  requester_name: z.string().trim().min(2).max(120),
  contact_number: z.string().trim().min(7).max(20),
  email: z.string().trim().email().optional().or(z.literal("")),
  location: z.string().trim().min(2).max(120),
  service_needed: z.string().min(1, "Please choose"),
  urgency: z.string().optional(),
  arrangement: z.string().optional(),
  preferred_days: z.array(z.string()),
  preferred_times: z.array(z.string()),
  notes: z.string().max(1000).optional().or(z.literal("")),
  consent_contact: z.literal(true, { errorMap: () => ({ message: "Required" }) }),
  accept_terms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the Terms & Disclaimer to continue." }),
  }),
});

function RequestSupport() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const raw = {
      requester_name: fd.get("requester_name") as string,
      contact_number: fd.get("contact_number") as string,
      email: fd.get("email") as string,
      location: fd.get("location") as string,
      service_needed: fd.get("service_needed") as string,
      urgency: fd.get("urgency") as string,
      arrangement: fd.get("arrangement") as string,
      preferred_days: fd.getAll("preferred_days") as string[],
      preferred_times: fd.getAll("preferred_times") as string[],
      notes: fd.get("notes") as string,
      consent_contact: fd.get("consent_contact") === "on",
    };
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[i.path.join(".")] = i.message));
      setErrors(errs);
      setSubmitting(false);
      return;
    }

    const d = parsed.data;
    const { error } = await supabase.from("service_requests").insert({
      requester_name: d.requester_name,
      contact_number: d.contact_number,
      email: d.email || null,
      location: d.location,
      service_needed: d.service_needed as never,
      urgency: d.urgency || null,
      arrangement: (d.arrangement || null) as never,
      preferred_days: d.preferred_days,
      preferred_times: d.preferred_times,
      notes: d.notes || null,
      consent_contact: d.consent_contact,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (done) {
    return (
      <SiteLayout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
          <CheckCircle2 className="size-16 text-brand-primary mx-auto mb-6" />
          <h1 className="text-3xl font-heading font-bold mb-3">Request received</h1>
          <p className="text-brand-dark/70 mb-8 max-w-md mx-auto">
            Thank you. A Hineni coordinator will be in touch soon to help match you with the right
            vetted person.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/find-help" className="px-6 py-3 rounded-xl bg-brand-primary text-white">
              Browse providers
            </Link>
            <Link to="/donate" className="px-6 py-3 rounded-xl border border-brand-dark/15">
              Support Hineni
            </Link>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="text-3xl font-heading font-bold mb-3">Request support</h1>
        <p className="text-brand-dark/70 mb-8">
          Tell us what help you need. We will personally find a vetted community member for you.
        </p>

        <form onSubmit={submit} className="space-y-5 bg-white p-5 sm:p-7 rounded-2xl border border-brand-dark/5">
          <Input label="Your name" name="requester_name" required error={errors.requester_name} />
          <Input
            label="Contact number"
            name="contact_number"
            type="tel"
            required
            error={errors.contact_number}
          />
          <Input label="Email (optional)" name="email" type="email" />
          <Input label="Where are you?" name="location" required error={errors.location} />
          <div>
            <Label>Type of help needed</Label>
            <select
              name="service_needed"
              defaultValue=""
              className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white"
            >
              <option value="" disabled>
                Choose…
              </option>
              {SERVICE_CATEGORIES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            {errors.service_needed && (
              <p className="text-xs text-destructive mt-1">{errors.service_needed}</p>
            )}
          </div>
          <Input label="Urgency (optional)" name="urgency" placeholder="e.g. This week, next month" />
          <div>
            <Label>Arrangement</Label>
            <select
              name="arrangement"
              defaultValue=""
              className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white"
            >
              <option value="">Not sure</option>
              {LOOKING_FOR.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <CheckGroup label="Preferred days" name="preferred_days" options={DAYS as unknown as { value: string; label: string }[]} cols={7} />
          <CheckGroup label="Preferred times" name="preferred_times" options={HOURS as unknown as { value: string; label: string }[]} cols={4} />
          <div>
            <Label>Notes</Label>
            <textarea
              name="notes"
              rows={4}
              className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white"
            />
          </div>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" name="consent_contact" className="mt-1 accent-brand-primary" />
            <span>I consent to Hineni contacting me about this request.</span>
          </label>
          {errors.consent_contact && (
            <p className="text-xs text-destructive">{errors.consent_contact}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-primary text-white font-medium hover:brightness-110 disabled:opacity-60"
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Send request
          </button>
        </form>
      </div>
    </SiteLayout>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium mb-1.5 text-brand-dark">{children}</label>;
}
function Input({
  label,
  name,
  type = "text",
  required,
  error,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <Label>
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white"
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
function CheckGroup({
  label,
  name,
  options,
  cols = 4,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  cols?: number;
}) {
  const colsClass = cols === 7 ? "grid-cols-7" : "grid-cols-2 sm:grid-cols-4";
  return (
    <div>
      <Label>{label}</Label>
      <div className={`grid gap-2 ${colsClass}`}>
        {options.map((o) => (
          <label
            key={o.value}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-brand-dark/10 bg-white text-sm cursor-pointer hover:bg-brand-soft"
          >
            <input type="checkbox" name={name} value={o.value} className="accent-brand-primary" />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
