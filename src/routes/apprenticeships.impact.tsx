import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { Users, Briefcase, GraduationCap, Award, Sprout, Loader2 } from "lucide-react";

export const Route = createFileRoute("/apprenticeships/impact")({
  head: () => ({
    meta: [
      { title: "Impact Dashboard — Hineni Apprenticeships" },
      { name: "description", content: "Apprentices registered, opportunities offered, mentors active and placements made across the Overberg." },
    ],
  }),
  component: Impact,
});

function Impact() {
  const [s, setS] = useState<{ opps: number; mentors: number } | null>(null);

  useEffect(() => {
    (async () => {
      const [opps, mentors] = await Promise.all([
        supabase.from("apprenticeship_opportunities_public" as never).select("id", { count: "exact", head: true }),
        supabase.from("mentors_public" as never).select("id", { count: "exact", head: true }),
      ]);
      setS({ opps: opps.count ?? 0, mentors: mentors.count ?? 0 });
    })();
  }, []);

  return (
    <SiteLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3">Impact Dashboard</h1>
        <p className="text-brand-dark/70 mb-8">A live view of activity in the Apprenticeships &amp; Mentorships programme.</p>
        {!s ? (
          <div className="py-20 text-center text-brand-dark/50"><Loader2 className="size-6 animate-spin inline" /></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat icon={<Briefcase />} label="Open opportunities" value={s.opps} />
            <Stat icon={<Users />} label="Active mentors" value={s.mentors} />
            <Stat icon={<GraduationCap />} label="Apprentices registered" value="—" sub="Private" />
            <Stat icon={<Award />} label="Knowledge Keepers" value="—" sub="Private" />
          </div>
        )}
        <p className="text-xs text-brand-dark/50 mt-6">
          Personal details and counts of pending registrations are protected; Hineni publishes aggregate, vetted figures only.
        </p>
        <div className="mt-10">
          <Link to="/apprenticeships" className="text-brand-primary underline">← Back to Apprenticeships hub</Link>
        </div>
        <div className="mt-12 bg-brand-soft/50 rounded-2xl p-6">
          <Sprout className="size-6 text-brand-primary mb-3" />
          <h2 className="font-heading text-lg font-semibold mb-2">Part of the Learning City</h2>
          <p className="text-sm text-brand-dark/70">
            This programme connects with the Skills Register, Youth Opportunities Hub,
            Community Projects and Volunteer Programme to support long-term skills
            development, employment and community resilience across the Overberg.
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}

function Stat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-brand-dark/10">
      <div className="size-10 rounded-full bg-brand-primary/10 text-brand-primary grid place-items-center mb-3">{icon}</div>
      <div className="text-3xl font-heading font-bold text-brand-dark">{value}</div>
      <div className="text-sm text-brand-dark/70">{label}</div>
      {sub && <div className="text-[10px] uppercase tracking-wide text-brand-dark/40 mt-1">{sub}</div>}
    </div>
  );
}
