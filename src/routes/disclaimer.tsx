import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { SiteLayout } from "@/components/site/SiteLayout";
import { DisclaimerBanner } from "@/components/site/DisclaimerBanner";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "Disclaimer — Overberg Skills Connect" },
      {
        name: "description",
        content: "Overberg Skills Connect is a digital community noticeboard only.",
      },
    ],
  }),
  component: DisclaimerPage,
});

function DisclaimerPage() {
  const { t } = useTranslation();
  return (
    <SiteLayout>
      <div className="osc-container py-12 prose prose-sm max-w-none">
        <h1 className="osc-heading text-3xl mb-6">{t("legal.disclaimer.heading")}</h1>
        <DisclaimerBanner />
        <div className="mt-8 space-y-4 text-brand-dark/80 leading-relaxed">
          <p>{t("legal.disclaimer.p1")}</p>
          <p>{t("legal.disclaimer.p2")}</p>
          <p>{t("legal.disclaimer.p3")}</p>
          <p>{t("legal.disclaimer.p4")}</p>
          <p className="text-sm text-brand-dark/60">
            {t("legal.disclaimer.seeAlsoPre")}
            <Link to="/terms" className="underline">{t("legal.disclaimer.termsLink")}</Link>
            {t("legal.disclaimer.seeAlsoAnd")}
            <Link to="/privacy" className="underline">{t("legal.disclaimer.privacyLink")}</Link>
            {t("legal.disclaimer.seeAlsoPost")}
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}
