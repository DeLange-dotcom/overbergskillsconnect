import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PLATFORM_NAME, PLATFORM_OWNER } from "@/lib/brand";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: `Privacy Policy — ${PLATFORM_NAME}` },
      { name: "description", content: `How ${PLATFORM_NAME} handles your personal information.` },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  const { t } = useTranslation();
  return (
    <SiteLayout>
      <div className="osc-container py-12 space-y-6 text-brand-dark/85 leading-relaxed">
        <h1 className="osc-heading text-3xl">{t("legal.privacy.heading")}</h1>
        <p className="text-sm text-brand-dark/60">{t("legal.privacy.effectiveDate")}</p>

        <Section title={t("legal.privacy.section1.title")}>
          <p>
            {t("legal.privacy.section1.p1", { platform: PLATFORM_NAME, owner: PLATFORM_OWNER })}
          </p>
        </Section>

        <Section title={t("legal.privacy.section2.title")}>
          <ul className="list-disc pl-6 space-y-1">
            <li>{t("legal.privacy.section2.item1")}</li>
            <li>{t("legal.privacy.section2.item2")}</li>
            <li>{t("legal.privacy.section2.item3")}</li>
            <li>{t("legal.privacy.section2.item4")}</li>
            <li>{t("legal.privacy.section2.item5")}</li>
            <li>{t("legal.privacy.section2.item6")}</li>
          </ul>
          <p>{t("legal.privacy.section2.p1")}</p>
        </Section>

        <Section title={t("legal.privacy.section3.title")}>
          <p>{t("legal.privacy.section3.p1")}</p>
          <p>{t("legal.privacy.section3.p2")}</p>
        </Section>

        <Section title={t("legal.privacy.section4.title")}>
          <p>
            {t("legal.privacy.section4.p1Pre")}
            <strong>{t("legal.privacy.section4.p1Strong")}</strong>
            {t("legal.privacy.section4.p1Post")}
          </p>
          <p>{t("legal.privacy.section4.p2")}</p>
        </Section>

        <Section title={t("legal.privacy.section5.title")}>
          <p>{t("legal.privacy.section5.p1")}</p>
        </Section>

        <Section title={t("legal.privacy.section6.title")}>
          <p>{t("legal.privacy.section6.p1")}</p>
          <p>{t("legal.privacy.section6.p2")}</p>
        </Section>

        <Section title={t("legal.privacy.section7.title")}>
          <p>
            {t("legal.privacy.section7.p1Pre")}
            <Link to="/contact" className="underline">
              {t("legal.privacy.section7.contactLink")}
            </Link>
            {t("legal.privacy.section7.p1Post")}
          </p>
        </Section>

        <Section title={t("legal.privacy.section8.title")}>
          <p>{t("legal.privacy.section8.p1")}</p>
        </Section>

        <Section title={t("legal.privacy.section9.title")}>
          <p>{t("legal.privacy.section9.p1")}</p>
        </Section>

        <Section title={t("legal.privacy.section10.title")}>
          <p>{t("legal.privacy.section10.p1")}</p>
        </Section>

        <Section title={t("legal.privacy.section11.title")}>
          <p>
            {t("legal.privacy.section11.p1Pre")}
            <Link to="/contact" className="underline">
              {t("legal.privacy.section11.contactLink")}
            </Link>
            {t("legal.privacy.section11.p1Post")}
          </p>
        </Section>
      </div>
    </SiteLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xl font-heading font-semibold">{title}</h2>
      {children}
    </section>
  );
}
