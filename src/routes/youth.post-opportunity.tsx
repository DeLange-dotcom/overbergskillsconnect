import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import {
  YOUTH_OPPORTUNITY_CATEGORIES,
  YOUTH_OPPORTUNITY_TYPES,
} from "@/lib/youth";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/youth/post-opportunity")({
  head: () => ({
    meta: [
      { title: "Post a Youth Opportunity — Hineni" },
      {
        name: "description",
        content: "Organisations can submit youth opportunities for review by Hineni.",
      },
    ],
  }),
  component: PostOpportunity,
});

const schema = z.object({
  organisation_name: z.string().trim().min(2).max(120),
  contact_name: z.string().trim().min(2).max(120),
  contact_email: z.string().trim().email(),
  contact_phone: z.string().trim().max(20).optional().or(z.literal("")),
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(2000),
  category: z.enum(["paid", "volunteer", "training", "internship", "community_service"]),
  opportunity_type: z.string().trim().min(1),
  min_age: z.coerce.number().int().min(15).max(25),
  max_age: z.coerce.number().int().min(15).max(25),
  town: z.string().trim().min(2).max(60),
  start_date: z.string().optional().or(z.literal("")),
  end_date: z.string().optional().or(z.literal("")),
  closing_date: z.string().optional().or(z.literal("")),
  hazardous_flag: z.boolean(),
  child_safe_declaration: z.boolean(),
});

function PostOpportunity() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [minAge, setMinAge] = useState(15);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const raw = {
      organisation_name: fd.get("organisation_name") as string,
      contact_name: fd.get("contact_name") as string,
      contact_email: fd.get("contact_email") as string,
      contact_phone: fd.get("contact_phone") as string,
      title: fd.get("title") as string,
      description: fd.get("description") as string,
      category: fd.get("category") as string,
      opportunity_type: fd.get("opportunity_type") as string,
      min_age: fd.get("min_age") as string,
      max_age: fd.get("max_age") as string,
      town: fd.get("town") as string,
      start_date: fd.get("start_date") as string,
      end_date: fd.get("end_date") as string,
      closing_date: fd.get("closing_date") as string,
      hazardous_flag: fd.get("hazardous_flag") === "on",
      child_safe_declaration: fd.get("child_safe_declaration") === "on",
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
    if (d.min_age < 18 && !d.child_safe_declaration) {
      setErrors({ child_safe_declaration: "Required when opportunity is open to under-18s." });
      setSubmitting(false);
      return;
    }
    if (d.max_age < d.min_age) {
      setErrors({ max_age: "Max age must be ≥ min age." });
      setSubmitting(false);
      return;
    }

    const prohibited_for_minors = d.hazardous_flag || d.min_age >= 18;

    const { error } = await supabase.from("youth_opportunities").insert({
      organisation_name: d.organisation_name,
      contact_name: d.contact_name,
      contact_email: d.contact_email,
      contact_phone: d.contact_phone || null,
      title: d.title,
      description: d.description,
      category: d.category as never,
      opportunity_type: d.opportunity_type,
      min_age: d.min_age,
      max_age: d.max_age,
      town: d.town,
      start_date: d.start_date || null,
      end_date: d.end_date || null,
      closing_date: d.closing_date || null,
      hazardous_flag: d.hazardous_flag,
      prohibited_for_minors,
    });

    if (error) {
      toast.error(error.message);
      setSubmitting(false);
      return;
    }
    setDone(true);
    setSubmitting(false);
  }

  if (done) {
    return (
      <SiteLayout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <CheckCircle2 className="size-16 text-brand-primary mx-auto mb-6" />
          <h1 className="text-3xl font-heading font-bold mb-3">Thank you</h1>
          <p className="text-brand-dark/70 mb-8 max-w-md mx-auto">
            Your opportunity has been submitted to Hineni for review. We'll contact you once it's
            approved and published on the board.
          </p>
          <Link to="/youth" className="px-6 py-3 rounded-xl bg-brand-primary text-white">
            Back to Youth Hub
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="text-3xl font-heading font-bold mb-3">Post a youth opportunity</h1>
        <p className="text-brand-dark/70 mb-8">
          Tell us about the opportunity. A Hineni coordinator will review it before it appears on
          the public board.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-brand-dark/10 rounded-2xl p-6">
          <Grid>
            <Field name="organisation_name" label="Organisation name" required error={errors.organisation_name} />
            <Field name="contact_name" label="Contact person" required error={errors.contact_name} />
            <Field name="contact_email" label="Contact email" type="email" required error={errors.contact_email} />
            <Field name="contact_phone" label="Contact phone (optional)" type="tel" />
          </Grid>

          <Field name="title" label="Opportunity title" required error={errors.title} />
          <div>
            <Label>Description</Label>
            <textarea
              name="description"
              rows={5}
              required
              className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white"
            />
            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
          </div>

          <Grid>
            <div>
              <Label>Category</Label>
              <select name="category" defaultValue="" required className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white">
                <option value="">Select…</option>
                {YOUTH_OPPORTUNITY_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Type</Label>
              <select name="opportunity_type" defaultValue="" required className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white">
                <option value="">Select…</option>
                {YOUTH_OPPORTUNITY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <Field name="town" label="Town" required error={errors.town} />
            <Grid>
              <Field
                name="min_age"
                label="Min age"
                type="number"
                required
                error={errors.min_age}
                onChange={(e) => setMinAge(Number(e.target.value))}
              />
              <Field name="max_age" label="Max age" type="number" required error={errors.max_age} />
            </Grid>
            <Field name="start_date" label="Start date" type="date" />
            <Field name="end_date" label="End date" type="date" />
            <Field name="closing_date" label="Applications close" type="date" />
          </Grid>

          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="hazardous_flag" className="mt-1 accent-brand-primary" />
            <span>
              This opportunity involves hazardous work (heavy machinery, late nights, alcohol
              service, etc.) — Hineni will restrict it to applicants aged 18+.
            </span>
          </label>

          {minAge < 18 && (
            <label className="flex items-start gap-2 text-sm p-3 rounded-xl bg-amber-50 border border-amber-200">
              <input type="checkbox" name="child_safe_declaration" className="mt-1 accent-brand-primary" />
              <span>
                I confirm that this opportunity is suitable for minors: it is <strong>not
                hazardous</strong>, does not interfere with schooling, and complies with South
                African child-labour laws. A responsible adult will supervise.
              </span>
            </label>
          )}
          {errors.child_safe_declaration && (
            <p className="text-xs text-destructive">{errors.child_safe_declaration}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-primary text-white font-medium hover:brightness-110 disabled:opacity-60"
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Submit for review
          </button>
        </form>
      </div>
    </SiteLayout>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-4">{children}</div>;
}
function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-medium text-brand-dark/80 mb-1.5">{children}</div>;
}
function Field({
  name, label, type = "text", required, error, onChange,
}: {
  name: string; label: string; type?: string; required?: boolean; error?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <Label>{label} {required && <span className="text-destructive">*</span>}</Label>
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
