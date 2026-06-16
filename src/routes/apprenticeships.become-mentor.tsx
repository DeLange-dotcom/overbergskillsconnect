import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { TermsAcceptance } from "@/components/site/TermsAcceptance";
import { supabase } from "@/integrations/supabase/client";
import { TERMS_VERSION, recordTermsAcceptance } from "@/lib/terms";
import { MENTOR_CATEGORIES, MENTOR_FORMATS, KNOWLEDGE_KEEPER_CATEGORIES } from "@/lib/apprenticeships";

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
  availability: z.string().trim().max(200).optional().or(z.literal("")),
  formats: z.array(z.string()).min(1, "Pick at least one"),
  is_knowledge_keeper: z.boolean(),
  knowledge_keeper_categories: z.array(z.string()),
  accept_terms: z.literal(true, { errorMap: () => ({ message: "You must accept the Terms & Disclaimer." }) }),
});

function Page() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isKK, setIsKK] = useState(false);

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
      availability: fd.get("availability") as string,
      formats: fd.getAll("formats") as string[],
      is_knowledge_keeper: fd.get("is_knowledge_keeper") === "on",
      knowledge_keeper_categories: fd.getAll("knowledge_keeper_categories") as string[],
      accept_terms: fd.get("accept_terms") === "on",
    };
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[i.path.join(".")] = i.message));
      setErrors(errs); setSubmitting(false);
      toast.error("Please fix the highlighted fields.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const d = parsed.data;
    const { data, error } = await supabase.from("mentors").insert({
      full_name: d.full_name,
      contact_number: d.contact_number,
      email: d.email,
      town: d.town || null,
      categories: d.categories,
      years_experience: d.years_experience ? Number(d.years_experience) : null,
      professional_background: d.professional_background || null,
      biography: d.biography || null,
      availability: d.availability || null,
      formats: d.formats,
      is_knowledge_keeper: d.is_knowledge_keeper,
      knowledge_keeper_categories: d.is_knowledge_keeper ? d.knowledge_keeper_categories : [],
      terms_accepted_at: new Date().toISOString(),
      terms_version: TERMS_VERSION,
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
            A Hineni coordinator will review your profile before it appears on the mentor board.
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
            </Grid>
            <div className="mt-4"><Label>Professional background</Label>
              <input name="professional_background" className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white" /></div>
            <div className="mt-4"><Label>Biography</Label>
              <textarea name="biography" rows={4} className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white" /></div>
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
