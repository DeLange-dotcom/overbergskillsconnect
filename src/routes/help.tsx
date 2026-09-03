import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { PLATFORM_NAME } from "@/lib/brand";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Need Help? — Overberg Skills Connect" },
      {
        name: "description",
        content:
          "Simple, step-by-step help for advertising your skills and finding local help on Overberg Skills Connect.",
      },
      { property: "og:title", content: "Need Help? — Overberg Skills Connect" },
      {
        property: "og:description",
        content: "Plain-language help for using the Overberg Skills Connect noticeboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HelpPage,
});

// Set these when support contact details are confirmed.
const SUPPORT_EMAIL: string | null = null;
const SUPPORT_PHONE: string | null = null;

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="size-7 shrink-0 rounded-full bg-brand-green text-white grid place-items-center text-sm font-bold">
        {n}
      </span>
      <span className="pt-0.5 text-brand-dark/80">{children}</span>
    </li>
  );
}

function HelpPage() {
  const { t } = useTranslation();
  return (
    <SiteLayout>
      <div className="osc-container py-10 sm:py-14">
        <PageHeader
          eyebrow={t("helpPage.eyebrow")}
          title={t("helpPage.title", { platform: PLATFORM_NAME })}
          intro={t("helpPage.intro")}
        />

        <section className="rounded-2xl border border-brand-dark/10 bg-white p-5 sm:p-6 mb-6">
          <h2 className="osc-heading text-xl mb-4">{t("helpPage.advertise.heading")}</h2>
          <ol className="space-y-3 text-base">
            <Step n={1}>{t("helpPage.advertise.step1")}</Step>
            <Step n={2}>{t("helpPage.advertise.step2")}</Step>
            <Step n={3}>{t("helpPage.advertise.step3")}</Step>
            <Step n={4}>{t("helpPage.advertise.step4")}</Step>
            <Step n={5}>{t("helpPage.advertise.step5")}</Step>
          </ol>
          <Link
            to="/advertise"
            className="mt-5 inline-block w-full sm:w-auto text-center px-5 py-3.5 rounded-xl bg-brand-primary text-white font-semibold"
          >
            {t("helpPage.advertise.cta")}
          </Link>
        </section>

        <section className="rounded-2xl border border-brand-dark/10 bg-white p-5 sm:p-6 mb-6">
          <h2 className="osc-heading text-xl mb-4">{t("helpPage.find.heading")}</h2>
          <ol className="space-y-3 text-base">
            <Step n={1}>{t("helpPage.find.step1")}</Step>
            <Step n={2}>{t("helpPage.find.step2")}</Step>
            <Step n={3}>{t("helpPage.find.step3")}</Step>
            <Step n={4}>{t("helpPage.find.step4")}</Step>
            <Step n={5}>{t("helpPage.find.step5")}</Step>
          </ol>
          <Link
            to="/find-help"
            className="mt-5 inline-block w-full sm:w-auto text-center px-5 py-3.5 rounded-xl bg-brand-primary text-white font-semibold"
          >
            {t("helpPage.find.cta")}
          </Link>
        </section>

        <section className="rounded-2xl border border-brand-dark/10 bg-brand-soft/60 p-5 sm:p-6">
          <h2 className="osc-heading text-xl mb-2">{t("helpPage.stuck.heading")}</h2>
          <p className="text-brand-dark/75 text-base">{t("helpPage.stuck.body")}</p>
          {SUPPORT_EMAIL || SUPPORT_PHONE ? (
            <ul className="mt-3 space-y-2 text-base">
              {SUPPORT_EMAIL && (
                <li>
                  <a className="text-brand-primary underline" href={`mailto:${SUPPORT_EMAIL}`}>
                    {SUPPORT_EMAIL}
                  </a>
                </li>
              )}
              {SUPPORT_PHONE && (
                <li>
                  <a className="text-brand-primary underline" href={`tel:${SUPPORT_PHONE}`}>
                    {SUPPORT_PHONE}
                  </a>
                </li>
              )}
            </ul>
          ) : (
            <p className="mt-3 text-brand-dark/70 text-sm">{t("helpPage.stuck.placeholder")}</p>
          )}
          <Link
            to="/contact"
            className="mt-4 inline-block w-full sm:w-auto text-center px-5 py-3.5 rounded-xl border border-brand-dark/15 bg-white font-semibold hover:bg-brand-soft"
          >
            {t("helpPage.stuck.cta")}
          </Link>
        </section>
      </div>
    </SiteLayout>
  );
}
