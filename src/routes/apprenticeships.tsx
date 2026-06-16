import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { LearningPathway } from "@/components/site/LearningPathway";
import { Search, HandHeart, Users, Sparkles, ArrowRight, Award } from "lucide-react";

export const Route = createFileRoute("/apprenticeships")({
  head: () => ({
    meta: [
      { title: "Apprenticeships & Mentorships — Hineni Learning City" },
      {
        name: "description",
        content:
          "Connect with apprenticeships, internships, work experience and mentors across the Overberg. Build skills, transfer knowledge and grow community resilience.",
      },
      { property: "og:title", content: "Apprenticeships & Mentorships — Hineni" },
      {
        property: "og:description",
        content:
          "Find an apprenticeship, offer one, find a mentor or become one. Part of Hineni Learning City.",
      },
    ],
  }),
  component: Hub,
});

const PATHWAYS = [
  {
    to: "/apprenticeships/register-apprentice" as const,
    icon: Search,
    title: "Looking for an Apprenticeship",
    desc: "For individuals seeking practical work experience and skills development.",
    cta: "Register as an apprentice",
    tone: "primary",
  },
  {
    to: "/apprenticeships/register-provider" as const,
    icon: HandHeart,
    title: "Offering an Apprenticeship",
    desc: "For businesses, farms, tradespeople, artisans, NPOs and organisations.",
    cta: "Offer an opportunity",
    tone: "accent",
  },
  {
    to: "/apprenticeships/mentors" as const,
    icon: Users,
    title: "Find a Mentor",
    desc: "Seek guidance, coaching and career advice from experienced people.",
    cta: "Browse mentors",
    tone: "soft",
  },
  {
    to: "/apprenticeships/become-mentor" as const,
    icon: Sparkles,
    title: "Become a Mentor",
    desc: "Share your knowledge — professionals, retirees, tradespeople and elders.",
    cta: "Register as a mentor",
    tone: "soft",
  },
] as const;

function Hub() {
  return (
    <SiteLayout>
      <section className="px-4 sm:px-6 pt-10 sm:pt-16 pb-8 max-w-4xl mx-auto text-center">
        <span className="inline-block px-3 py-1 rounded-full bg-brand-accent/10 text-xs uppercase tracking-widest text-brand-accent font-semibold">
          Hineni Learning City
        </span>
        <h1 className="mt-5 text-4xl sm:text-5xl font-heading font-bold text-brand-dark leading-tight">
          Apprenticeships &amp; Mentorships
        </h1>
        <p className="mt-5 text-lg text-brand-dark/70 leading-relaxed max-w-2xl mx-auto">
          Connecting young people, job seekers, career changers and community members
          with apprenticeships, work experience, internships, mentors and skills development.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-10">
        <div className="grid sm:grid-cols-2 gap-4">
          {PATHWAYS.map((p) => {
            const Icon = p.icon;
            const cls =
              p.tone === "primary"
                ? "bg-brand-primary text-white hover:brightness-110"
                : p.tone === "accent"
                ? "bg-brand-accent text-white hover:brightness-110"
                : "bg-white border border-brand-dark/10 hover:bg-brand-soft text-brand-dark";
            return (
              <Link
                key={p.to}
                to={p.to}
                className={`p-6 rounded-2xl transition flex flex-col ${cls}`}
              >
                <Icon className="size-6 mb-4" />
                <h2 className="font-heading text-xl font-semibold">{p.title}</h2>
                <p className={`mt-2 text-sm ${p.tone === "soft" ? "text-brand-dark/70" : "opacity-90"}`}>
                  {p.desc}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium">
                  {p.cta} <ArrowRight className="size-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="text-2xl font-heading font-bold mb-2">The Learning Pathway</h2>
        <p className="text-brand-dark/70 mb-6 text-sm">
          Every journey is different — start anywhere along the path.
        </p>
        <LearningPathway />
      </section>

      <section className="bg-brand-soft/50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Award className="size-10 text-brand-accent mx-auto mb-4" />
          <h2 className="text-2xl font-heading font-bold mb-3">
            Master Craftspeople &amp; Knowledge Keepers
          </h2>
          <p className="text-brand-dark/70 max-w-2xl mx-auto mb-6">
            We honour the elders, artisans and traditional knowledge holders in our community.
            Register as a Knowledge Keeper to preserve valuable local skills and pass them on
            to younger generations.
          </p>
          <Link
            to="/apprenticeships/become-mentor"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-brand-accent text-white font-medium hover:brightness-110"
          >
            Register as a Knowledge Keeper <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
        <Link to="/apprenticeships/impact" className="text-brand-primary underline text-sm">
          See our community impact dashboard →
        </Link>
      </section>
    </SiteLayout>
  );
}
