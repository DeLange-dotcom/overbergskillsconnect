import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, Search, ShieldAlert } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overberg Skills Connect — Connecting Local Skills with Local Opportunities" },
      {
        name: "description",
        content:
          "Advertise your skills or find someone to help with work in your local community. A simple community noticeboard.",
      },
      {
        property: "og:title",
        content: "Overberg Skills Connect — Connecting Local Skills with Local Opportunities",
      },
      {
        property: "og:description",
        content:
          "A digital community noticeboard. Advertise your skills, or browse local people offering services.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <SiteLayout>
      <section className="px-4 sm:px-6 pt-16 pb-20">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-brand-soft text-xs uppercase tracking-widest text-brand-primary font-semibold">
            Community Noticeboard
          </span>
          <h1 className="mt-6 text-4xl md:text-5xl font-heading font-bold leading-tight text-brand-dark">
            Connecting Local Skills with Local Opportunities
          </h1>
          <p className="mt-5 text-lg text-brand-dark/70 leading-relaxed">
            Advertise your skills or find someone to help with work in your local community.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Link
              to="/advertise"
              className="group rounded-3xl p-8 bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 hover:scale-[1.02] transition text-left"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider opacity-90">
                  For Workers
                </span>
                <span className="size-10 rounded-full bg-white/15 grid place-items-center">
                  <Briefcase className="size-5" />
                </span>
              </div>
              <div className="mt-6 text-2xl font-heading font-semibold">Looking for Work</div>
              <p className="mt-1 text-sm opacity-90">Advertise your skills.</p>
            </Link>

            <Link
              to="/find-help"
              className="group rounded-3xl p-8 bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:scale-[1.02] transition text-left"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider opacity-90">
                  For Communities
                </span>
                <span className="size-10 rounded-full bg-white/15 grid place-items-center">
                  <Search className="size-5" />
                </span>
              </div>
              <div className="mt-6 text-2xl font-heading font-semibold">Looking for Someone</div>
              <p className="mt-1 text-sm opacity-90">Browse local people offering services.</p>
            </Link>
          </div>

          <div className="mt-10 flex items-start gap-3 text-left p-4 rounded-2xl border border-brand-dark/10 bg-white max-w-2xl mx-auto">
            <ShieldAlert className="size-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-brand-dark/70 leading-relaxed">
              Overberg Skills Connect is a noticeboard only. We do not employ, vet or recommend anyone.
              Please carry out your own checks before entering into any agreement.{" "}
              <Link to="/disclaimer" className="underline hover:text-brand-primary">
                Read the full disclaimer
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
