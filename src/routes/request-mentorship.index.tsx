import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import {
  SafeguardingAcknowledgement, emptyAckState, isAckComplete, type SafeguardingAckState,
} from "@/components/site/SafeguardingAcknowledgement";
import { LegalDisclaimer } from "@/components/site/LegalDisclaimer";
import { supabase } from "@/integrations/supabase/client";
import { MENTOR_CATEGORIES, MENTOR_FORMATS } from "@/lib/apprenticeships";
import { SAFEGUARDING_POLICY_VERSION } from "@/lib/safeguarding";

const FREQUENCIES = ["Weekly", "Fortnightly", "Monthly", "As needed"] as const;

const schema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  mobile: z.string().trim().max(20).optional().or(z.literal("")),
  career_interests: z.array(z.string()).min(1, "Pick at least one"),
  goals: z.string().trim().max(1500).optional().or(z.literal("")),
  preferred_method: z.string().optional().or(z.literal("")),
  preferred_frequency: z.string().optional().or(z.literal("")),
});

export function RequestMentorshipPage({ mentorId }: { mentorId?: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ack, setAck] = useState<SafeguardingAckState>(emptyAckState());
  const [disclaimer, setDisclaimer] = useState(false);
  const [mentorName, setMentorName] = useState<string | null>(null);

  useEffect(() => {
    if (!mentorId) return;
    (async () => {
      const { data } = await supabase
        .from("mentors_public" as never)
        .select("full_name")
        .eq("id", mentorId)
        .maybeSingle();
      setMentorName((data as { full_name?: string } | null)?.full_name ?? null);
    })();
  }, [mentorId]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const raw = {
      full_name: fd.get("full_name") as string,
      email: fd.get("email") as string,
      mobile: fd.get("mobile") as string,
      career_interests: fd.getAll("career_interests") as string[],
      goals: fd.get("goals") as string,
      preferred_method: fd.get("preferred_method") as string,
      preferred_frequency: fd.get("preferred_frequency") as string,
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
    const { data: userData } = await supabase.auth.getUser();
    const now = new Date().toISOString();
    const { error } = await supabase.from("mentorship_requests").insert({
      user_id: userData.user?.id ?? null,
      full_name: d.full_name,
      email: d.email,
      mobile: d.mobile || null,
      career_interests: d.career_interests,
      goals: d.goals || null,
      preferred_method: d.preferred_method || null,
      preferred_frequency: d.preferred_frequency || null,
      preferred_mentor_id: mentorId ?? null,
      safeguarding_acknowledged_at: now,
      safeguarding_policy_version: SAFEGUARDING_POLICY_VERSION,
      disclaimer_accepted_at: now,
    });
    if (error) { toast.error(error.message); setSubmitting(false); return; }
    setDone(true); setSubmitting(false); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (done) {
    return (
      <SiteLayout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
          <CheckCircle2 className="size-16 text-brand-primary mx-auto mb-6" />
          <h1 className="text-3xl font-heading font-bold mb-3">Request received</h1>
          <p className="text-brand-dark/70 max-w-md mx-auto mb-8">
            A Hineni coordinator will review your request and broker the introduction. Your details stay private until both sides agree.
          </p>
          <Link to="/apprenticeships/mentors" className="px-6 py-3 rounded-xl bg-brand-primary text-white">Back to mentors</Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3">Request mentorship</h1>
        <p className="text-brand-dark/70 mb-8">
          {mentorId
            ? <>Asking to be matched with <strong>{mentorName ?? "this mentor"}</strong>. We'll review and introduce.</>
            : "Tell us what you'd like guidance on and we'll match you with a suitable Hineni mentor."}
        </p>
        <form onSubmit={onSubmit} className="space-y-8">
          <Fieldset title="About you">
            <Grid>
              <Field label="Full name" name="full_name" required error={errors.full_name} />
              <Field label="Email" name="email" type="email" required error={errors.email} />
              <Field label="Mobile / WhatsApp" name="mobile" type="tel" />
            </Grid>
          </Fieldset>

          <Fieldset title="Career interests *">
            <CheckGrid name="career_interests" options={MENTOR_CATEGORIES} error={errors.career_interests} />
          </Fieldset>

          <Fieldset title="What would you like guidance on?">
            <textarea name="goals" rows={4} className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white"
              placeholder="Goals, questions, where you'd like to grow…" />
          </Fieldset>

          <Fieldset title="Preferences">
            <Grid>
              <div>
                <Label>Preferred method</Label>
                <select name="preferred_method" defaultValue="" className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white">
                  <option value="">No preference</option>
                  {MENTOR_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <Label>Preferred frequency</Label>
                <select name="preferred_frequency" defaultValue="" className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white">
                  <option value="">No preference</option>
                  {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </Grid>
          </Fieldset>

          <Fieldset title="Safeguarding & disclaimer (required)">
            <SafeguardingAcknowledgement value={ack} onChange={setAck} error={errors.safeguarding} />
            <div className="mt-4">
              <LegalDisclaimer checked={disclaimer} onChange={setDisclaimer} error={errors.disclaimer} />
            </div>
          </Fieldset>

          <div className="flex gap-3 items-center pt-2">
            <button type="submit" disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-primary text-white font-medium hover:brightness-110 disabled:opacity-60">
              {submitting && <Loader2 className="size-4 animate-spin" />} Send request
            </button>
            <Link to="/apprenticeships/mentors" className="text-sm text-brand-dark/60 underline">Back to mentors</Link>
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

export const Route = createFileRoute("/request-mentorship/")({
  head: () => ({
    meta: [
      { title: "Request a Mentor — Hineni" },
      { name: "description", content: "Tell Hineni what guidance you need and we'll match you with a suitable mentor." },
    ],
  }),
  component: () => <RequestMentorshipPage />,
});
