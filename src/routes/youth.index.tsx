import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PathwayTracker } from "@/components/site/PathwayTracker";
import { GraduationCap, Sprout, Briefcase, Award, Shield, Users } from "lucide-react";

export const Route = createFileRoute("/youth/")({
  head: () => ({
    meta: [
      { title: "Youth Opportunities Hub — Hineni" },
      {
        name: "description",
        content:
          "Young people aged 15–25 in the Overberg can register for work experience, volunteering, training, mentorship and skills development.",
      },
      { property: "og:title", content: "Youth Opportunities Hub — Hineni" },
      {
        property: "og:description",
        content:
          "Register, gain experience, earn badges, and build your future. A safe, vetted youth opportunity hub for the Overberg.",
      },
    ],
  }),
  component: YouthHub,
});

function YouthHub() {
  return (
    <SiteLayout>
      <section className="px-4 sm:px-6 pt-10 sm:pt-16 pb-8 max-w-3xl mx-auto text-center">
        <span className="inline-block px-3 py-1 rounded-full bg-brand-accent/10 text-xs uppercase tracking-widest text-brand-accent font-semibold">
          Ages 15–25
        </span>
        <h1 className="mt-5 text-4xl sm:text-5xl font-heading font-bold text-brand-dark leading-tight">
          Youth Opportunities Hub
        </h1>
        <p className="mt-5 text-lg text-brand-dark/70 leading-relaxed">
          A safe path for young people in the Overberg to gain work experience, earn income,
          develop skills, build confidence and prepare for the future.
        </p>

        <div className="mt-8 grid sm:grid-cols-3 gap-3 text-left">
          <Link
            to="/youth/register"
            className="p-5 rounded-2xl bg-brand-primary text-white hover:brightness-110 transition"
          >
            <GraduationCap className="size-5 mb-3" />
            <div className="font-heading font-semibold">Register as a young person</div>
            <div className="text-xs opacity-80 mt-1">15–17 or 18–25</div>
          </Link>
          <Link
            to="/youth/opportunities"
            className="p-5 rounded-2xl bg-brand-accent text-white hover:brightness-110 transition"
          >
            <Briefcase className="size-5 mb-3" />
            <div className="font-heading font-semibold">Browse opportunities</div>
            <div className="text-xs opacity-80 mt-1">Paid, volunteer, training</div>
          </Link>
          <Link
            to="/youth/post-opportunity"
            className="p-5 rounded-2xl bg-white border border-brand-dark/10 hover:bg-brand-soft transition"
          >
            <Users className="size-5 mb-3 text-brand-primary" />
            <div className="font-heading font-semibold">Post an opportunity</div>
            <div className="text-xs text-brand-dark/60 mt-1">For organisations</div>
          </Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="text-2xl font-heading font-bold mb-2">The pathway</h2>
        <p className="text-brand-dark/70 mb-6 text-sm">
          Every young person grows at their own pace. Hineni walks alongside you.
        </p>
        <PathwayTracker currentStage={0} />
      </section>

      <section className="bg-brand-soft/50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 grid sm:grid-cols-2 gap-4">
          <Promise icon={<Shield className="size-5" />} title="Safe for under-18s">
            Applicants under 18 need parent or guardian consent. We follow South African labour
            laws and never match minors to hazardous work or work that interferes with schooling.
          </Promise>
          <Promise icon={<Award className="size-5" />} title="Earn badges & build a portfolio">
            As you volunteer, train and complete placements, your digital portfolio grows — proof
            of work you can share with future employers.
          </Promise>
          <Promise icon={<Sprout className="size-5" />} title="Local and trusted">
            Every opportunity is reviewed by Hineni before it appears on the board. Contact is
            always brokered through us — your details are never shown publicly.
          </Promise>
          <Promise icon={<Users className="size-5" />} title="Connecting to Learning City">
            Designed to plug into Hineni Learning City — training, mentorship and employer
            partnerships as they roll out.
          </Promise>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
          <Link
            to="/mentors/interest"
            className="block bg-white rounded-2xl p-6 border border-brand-dark/10 hover:border-brand-primary/40 transition"
          >
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-full bg-brand-accent/10 text-brand-accent grid place-items-center shrink-0">
                <Users className="size-6" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-brand-accent font-semibold mb-1">Coming soon</div>
                <h3 className="font-heading text-lg font-semibold mb-1">Become a mentor</h3>
                <p className="text-sm text-brand-dark/70">
                  Share your skills and experience with the next generation. Register your interest →
                </p>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}

function Promise({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-brand-dark/5">
      <div className="size-10 rounded-full bg-brand-primary/10 text-brand-primary grid place-items-center mb-3">
        {icon}
      </div>
      <h3 className="font-heading font-semibold mb-1">{title}</h3>
      <p className="text-sm text-brand-dark/70 leading-relaxed">{children}</p>
    </div>
  );
}
