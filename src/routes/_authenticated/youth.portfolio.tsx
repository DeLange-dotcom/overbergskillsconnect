import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { BadgeChip } from "@/components/site/BadgeChip";
import { PathwayTracker } from "@/components/site/PathwayTracker";
import { YOUTH_INTERESTS, YOUTH_SKILLS, labelFromList } from "@/lib/youth";

export const Route = createFileRoute("/_authenticated/youth/portfolio")({
  head: () => ({ meta: [{ title: "My Youth Portfolio — Hineni" }] }),
  component: YouthPortfolio,
});

function YouthPortfolio() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const profileQ = useQuery({
    queryKey: ["my_youth_profile"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data } = await supabase
        .from("youth_profiles")
        .select("*")
        .eq("user_id", u.user.id)
        .maybeSingle();
      return data;
    },
  });

  const profile = profileQ.data;

  const badgesQ = useQuery({
    queryKey: ["my_badges", profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("youth_badges")
        .select("*")
        .eq("youth_profile_id", profile!.id);
      return data ?? [];
    },
  });

  const applicationsQ = useQuery({
    queryKey: ["my_applications", profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("youth_applications")
        .select("*, youth_opportunities(title, organisation_name)")
        .eq("youth_profile_id", profile!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const trainingQ = useQuery({
    queryKey: ["my_training", profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("youth_training")
        .select("*")
        .eq("youth_profile_id", profile!.id);
      return data ?? [];
    },
  });

  if (profileQ.isLoading) {
    return <SiteLayout><div className="py-20 text-center text-brand-dark/60">Loading…</div></SiteLayout>;
  }

  if (!profile) {
    return (
      <SiteLayout>
        <div className="max-w-xl mx-auto px-6 py-16 text-center">
          <h1 className="text-2xl font-heading font-bold mb-3">No youth profile linked</h1>
          <p className="text-brand-dark/70 mb-6">
            You're signed in as <strong>{email}</strong>, but no youth registration is linked to
            this account yet. Register, then ask Hineni to link the profile.
          </p>
          <Link to="/youth/register" className="px-5 py-3 rounded-xl bg-brand-primary text-white">
            Register now
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const completed = (applicationsQ.data ?? []).filter((a) => a.status === "completed").length;
  const totalHours = (applicationsQ.data ?? []).reduce(
    (sum, a) => sum + Number(a.hours_logged ?? 0),
    0,
  );
  const trainingCount = trainingQ.data?.length ?? 0;
  const stage = Math.min(
    6,
    (completed > 0 ? 3 : 0) +
      (totalHours > 0 ? 1 : 0) +
      (trainingCount > 0 ? 1 : 0) +
      (profile.mentor_match_opt_in ? 1 : 0),
  );

  return (
    <SiteLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <header className="bg-brand-primary text-white rounded-2xl p-6 sm:p-8 mb-8">
          <div className="text-xs uppercase tracking-widest opacity-80">{profile.age_group} · {profile.town}</div>
          <h1 className="text-3xl font-heading font-bold mt-1">{profile.full_name}</h1>
          <div className="text-sm opacity-90 mt-2">Reference: {profile.application_code} · Status: {profile.status}</div>
        </header>

        <section className="mb-8">
          <h2 className="font-heading text-xl font-semibold mb-3">My pathway</h2>
          <PathwayTracker currentStage={stage} />
        </section>

        <div className="grid sm:grid-cols-3 gap-3 mb-8">
          <Stat label="Volunteer hours" value={totalHours.toFixed(1)} />
          <Stat label="Completed placements" value={completed} />
          <Stat label="Training courses" value={trainingCount} />
        </div>

        <section className="mb-8">
          <h2 className="font-heading text-xl font-semibold mb-3">Badges</h2>
          {badgesQ.data && badgesQ.data.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {badgesQ.data.map((b) => <BadgeChip key={b.id} badgeKey={b.badge_key} />)}
            </div>
          ) : (
            <p className="text-sm text-brand-dark/60">No badges yet — keep going!</p>
          )}
        </section>

        <section className="mb-8 grid sm:grid-cols-2 gap-4">
          <Card title="Interests">
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.map((i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full bg-brand-soft">
                  {labelFromList(YOUTH_INTERESTS, i)}
                </span>
              ))}
            </div>
          </Card>
          <Card title="Skills">
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((s) => (
                <span key={s} className="text-xs px-2 py-1 rounded-full bg-brand-soft">
                  {labelFromList(YOUTH_SKILLS, s)}
                </span>
              ))}
            </div>
          </Card>
        </section>

        <section className="mb-8">
          <h2 className="font-heading text-xl font-semibold mb-3">My opportunities</h2>
          {applicationsQ.data && applicationsQ.data.length > 0 ? (
            <ul className="divide-y divide-brand-dark/5 bg-white border border-brand-dark/5 rounded-2xl">
              {applicationsQ.data.map((a: any) => (
                <li key={a.id} className="px-4 py-3 text-sm flex justify-between gap-3">
                  <div>
                    <div className="font-medium">
                      {a.youth_opportunities?.title ?? "Opportunity"}
                    </div>
                    <div className="text-xs text-brand-dark/60">
                      {a.youth_opportunities?.organisation_name} · {a.status}
                      {Number(a.hours_logged) > 0 ? ` · ${a.hours_logged} hrs` : ""}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-brand-dark/60">No applications yet. Browse the board.</p>
          )}
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold mb-3">Training</h2>
          {trainingQ.data && trainingQ.data.length > 0 ? (
            <ul className="divide-y divide-brand-dark/5 bg-white border border-brand-dark/5 rounded-2xl">
              {trainingQ.data.map((t) => (
                <li key={t.id} className="px-4 py-3 text-sm">
                  <div className="font-medium">{t.course_name}</div>
                  <div className="text-xs text-brand-dark/60">
                    {t.provider ?? "—"} {t.completed_at ? `· ${t.completed_at}` : ""} {t.verified_by_admin ? "· verified" : ""}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-brand-dark/60">No training logged yet.</p>
          )}
        </section>
      </div>
    </SiteLayout>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white border border-brand-dark/5 rounded-2xl p-4">
      <div className="text-2xl font-heading font-bold text-brand-primary">{value}</div>
      <div className="text-xs text-brand-dark/60 uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-brand-dark/5 rounded-2xl p-4">
      <h3 className="text-sm uppercase tracking-wider text-brand-dark/60 mb-2">{title}</h3>
      {children}
    </div>
  );
}
