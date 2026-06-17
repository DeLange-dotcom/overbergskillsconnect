import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { HineniDisclaimer } from "@/components/site/HineniDisclaimer";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { YOUTH_AVAILABILITY } from "@/lib/youth";

export const Route = createFileRoute("/mentors/interest")({
  head: () => ({
    meta: [
      { title: "Become a Mentor — Hineni" },
      { name: "description", content: "Register your interest in mentoring young people through Hineni." },
    ],
  }),
  component: MentorInterest,
});

function MentorInterest() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      full_name: (fd.get("full_name") as string).trim(),
      email: (fd.get("email") as string).trim(),
      mobile: (fd.get("mobile") as string).trim() || null,
      town: (fd.get("town") as string).trim() || null,
      skills: (fd.get("skills") as string).split(",").map(s => s.trim()).filter(Boolean),
      industry_experience: (fd.get("industry_experience") as string).trim() || null,
      availability: fd.getAll("availability") as string[],
      mode: fd.get("mode") as string,
      motivation: (fd.get("motivation") as string).trim() || null,
    };
    if (!payload.full_name || !payload.email) {
      toast.error("Name and email are required.");
      setSubmitting(false);
      return;
    }
    const { error } = await supabase.from("mentors_interest" as never).insert(payload as never);
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
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <CheckCircle2 className="size-14 text-brand-primary mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-bold mb-2">Thank you</h1>
          <p className="text-brand-dark/70 mb-6">
            Your interest has been recorded. We'll be in touch as the mentor programme launches.
          </p>
          <Link to="/youth" className="px-4 py-2 rounded-xl bg-brand-primary text-white">Back to Youth Hub</Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <span className="inline-block px-3 py-1 rounded-full bg-brand-accent/10 text-xs uppercase tracking-widest text-brand-accent font-semibold mb-3">
          Coming soon
        </span>
        <h1 className="text-3xl font-heading font-bold mb-2">Become a mentor</h1>
        <p className="text-brand-dark/70 mb-6">
          Help shape the next generation. Register your interest and we'll be in touch as the Hineni
          Mentor programme rolls out.
        </p>

        <div className="mb-6"><HineniDisclaimer /></div>

        <form onSubmit={handleSubmit} className="bg-white border border-brand-dark/10 rounded-2xl p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <F name="full_name" label="Full name" required />
            <F name="email" label="Email" type="email" required />
            <F name="mobile" label="Mobile" type="tel" />
            <F name="town" label="Town" />
          </div>
          <F name="skills" label="Skills (comma separated)" placeholder="e.g. Carpentry, Bookkeeping, Public speaking" />
          <div>
            <Label>Industry experience</Label>
            <textarea name="industry_experience" rows={3} className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white" />
          </div>
          <div>
            <Label>Availability</Label>
            <div className="grid sm:grid-cols-2 gap-2">
              {YOUTH_AVAILABILITY.map(a => (
                <label key={a.value} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-brand-dark/10 text-sm">
                  <input type="checkbox" name="availability" value={a.value} className="accent-brand-primary" />
                  {a.label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label>Mentoring mode</Label>
            <select name="mode" defaultValue="both" className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white">
              <option value="in_person">In person</option>
              <option value="online">Online</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div>
            <Label>Why do you want to mentor?</Label>
            <textarea name="motivation" rows={3} className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white" />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-primary text-white font-medium hover:brightness-110 disabled:opacity-60"
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Register interest
          </button>
        </form>
      </div>
    </SiteLayout>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-medium text-brand-dark/80 mb-1.5">{children}</div>;
}
function F({ name, label, type = "text", required, placeholder }: { name: string; label: string; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <Label>{label} {required && <span className="text-destructive">*</span>}</Label>
      <input name={name} type={type} required={required} placeholder={placeholder} className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white" />
    </div>
  );
}
