import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, Search, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <SiteLayout>
      <section className="px-4 sm:px-6 pt-16 pb-20">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-brand-soft text-xs uppercase tracking-widest text-brand-primary font-semibold">
            {t("home.eyebrow")}
          </span>
          <h1 className="mt-6 text-4xl md:text-5xl font-heading font-bold leading-tight text-brand-dark">
            {t("home.title")}
          </h1>
          <p className="mt-5 text-lg text-brand-dark/70 leading-relaxed">
            {t("home.subtitle")}
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Link
              to="/advertise"
              className="group rounded-3xl p-8 bg-brand-field text-primary-foreground shadow-lg shadow-brand-field/25 hover:shadow-brand-field/35 hover:scale-[1.02] transition text-left"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider opacity-90">
                  {t("home.lookingForWork")}
                </span>
                <span className="size-10 rounded-full bg-white/15 grid place-items-center">
                  <Briefcase className="size-5" />
                </span>
              </div>
              <div className="mt-6 text-2xl font-heading font-semibold">{t("home.advertiseCta")}</div>
              <p className="mt-1 text-sm opacity-90">{t("home.advertiseDesc")}</p>
            </Link>

            <Link
              to="/find-help"
              className="group rounded-3xl p-8 bg-brand-sky text-primary-foreground shadow-lg shadow-brand-sky/25 hover:shadow-brand-sky/35 hover:scale-[1.02] transition text-left"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider opacity-90">
                  {t("home.lookingForSomeone")}
                </span>
                <span className="size-10 rounded-full bg-white/15 grid place-items-center">
                  <Search className="size-5" />
                </span>
              </div>
              <div className="mt-6 text-2xl font-heading font-semibold">{t("home.browseCta")}</div>
              <p className="mt-1 text-sm opacity-90">{t("home.browseDesc")}</p>
            </Link>
          </div>

          <div className="mt-10 flex items-start gap-3 text-left p-4 rounded-2xl border border-brand-dark/10 bg-white max-w-2xl mx-auto">
            <ShieldAlert className="size-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-brand-dark/70 leading-relaxed">
              {t("home.disclaimer")}{" "}
              <Link to="/disclaimer" className="underline hover:text-brand-primary">
                {t("home.readDisclaimer")}
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
