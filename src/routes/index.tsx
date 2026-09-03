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
      <section className="px-4 sm:px-6 pt-14 pb-20">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-brand-green/10 text-xs uppercase tracking-widest text-brand-green font-semibold">
            {t("home.eyebrow")}
          </span>
          <h1 className="mt-6 text-4xl md:text-5xl font-heading font-bold leading-tight text-brand-navy">
            {t("home.title")}
          </h1>
          <p className="mt-4 text-lg md:text-xl font-semibold text-brand-navy/80">
            {t("shell.home.strapline.skills")}{" "}
            <span className="text-brand-green">{t("shell.home.strapline.connections")}</span>{" "}
            <span className="text-brand-orange">{t("shell.home.strapline.communities")}</span>
          </p>

          <p className="mt-4 text-base text-brand-navy/65 leading-relaxed">
            {t("home.subtitle")}
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Link
              to="/advertise"
              className="group rounded-3xl p-8 bg-brand-green text-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider opacity-90">
                  {t("home.lookingForWork")}
                </span>
                <span className="size-10 rounded-full bg-white/20 grid place-items-center">
                  <Briefcase className="size-5" />
                </span>
              </div>
              <div className="mt-6 text-2xl font-heading font-semibold">{t("home.advertiseCta")}</div>
              <p className="mt-1 text-sm opacity-90">{t("home.advertiseDesc")}</p>
            </Link>

            <Link
              to="/find-help"
              className="group rounded-3xl p-8 bg-brand-navy text-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider opacity-90">
                  {t("home.lookingForSomeone")}
                </span>
                <span className="size-10 rounded-full bg-brand-orange/90 grid place-items-center">
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
