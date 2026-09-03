import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PLATFORM_NAME } from "@/lib/brand";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About — ${PLATFORM_NAME}` },
      {
        name: "description",
        content:
          "Overberg Skills Connect is a digital community noticeboard connecting local skills with local opportunities. Powered by Khulisa Group.",
      },
    ],
  }),
  component: About,
});

function About() {
  const { t } = useTranslation();
  return (
    <SiteLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6 text-brand-dark/85 leading-relaxed">
        <PageHeader
          eyebrow="About"
          title={`${t("about.title")} ${PLATFORM_NAME}`}
          className="mb-2"
        />
        <p>{t("about.p1")}</p>
        <p>{t("about.p2")}</p>
        <p>
          {t("about.p3")}{" "}
          <Link to="/terms" className="underline">{t("footer.terms")}</Link>,{" "}
          <Link to="/privacy" className="underline">{t("footer.privacy")}</Link>,{" "}
          <Link to="/disclaimer" className="underline">{t("footer.disclaimer")}</Link>.
        </p>
      </div>
    </SiteLayout>
  );
}
