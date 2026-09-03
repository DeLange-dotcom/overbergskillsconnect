import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PLATFORM_NAME, PLATFORM_OWNER, IP_OWNERSHIP_STATEMENT } from "@/lib/brand";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: `Terms of Use — ${PLATFORM_NAME}` },
      { name: "description", content: `${PLATFORM_NAME} terms of use.` },
    ],
  }),
  component: Terms,
});

function Terms() {
  const { t } = useTranslation();
  return (
    <SiteLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6 text-brand-dark/85 leading-relaxed">
        <h1 className="osc-heading text-3xl">{t("legal.terms.heading")}</h1>
        <p className="text-sm text-brand-dark/60">{t("legal.terms.effectiveDate")}</p>
        <p className="text-xs italic text-brand-dark/60 border-l-2 border-brand-dark/20 pl-3">
          {t("legal.bilingualNotice")}
        </p>

        <Section title={t("legal.terms.section1.title")}>
          <p>
            {t("legal.terms.section1.p1", { platform: PLATFORM_NAME, owner: PLATFORM_OWNER })}
          </p>
        </Section>

        <Section title={t("legal.terms.section2.title")}>
          <ul className="list-disc pl-6 space-y-1">
            <li>{t("legal.terms.section2.item1", { platform: PLATFORM_NAME })}</li>
            <li>{t("legal.terms.section2.item2")}</li>
            <li>{t("legal.terms.section2.item3")}</li>
            <li>{t("legal.terms.section2.item4")}</li>
            <li>{t("legal.terms.section2.item5")}</li>
            <li>{t("legal.terms.section2.item6")}</li>
            <li>{t("legal.terms.section2.item7")}</li>
            <li>{t("legal.terms.section2.item8")}</li>
            <li>{t("legal.terms.section2.item9")}</li>
            <li>{t("legal.terms.section2.item10")}</li>
          </ul>
        </Section>

        <Section title={t("legal.terms.section3.title")}>
          <p>{t("legal.terms.section3.p1")}</p>
          <p>{t("legal.terms.section3.p2")}</p>
          <p>{t("legal.terms.section3.p3")}</p>
        </Section>

        <Section title={t("legal.terms.section4.title")}>
          <p>{t("legal.terms.section4.p1")}</p>
          <p>{t("legal.terms.section4.p2")}</p>
        </Section>

        <Section title={t("legal.terms.section5.title")}>
          <p>
            {t("legal.terms.section5.p1", {
              link: "",
            })}{" "}
            <Link to="/privacy" className="underline">
              {t("legal.terms.section5.privacyLink")}
            </Link>
            .
          </p>
          <p>{t("legal.terms.section5.p2")}</p>
        </Section>

        <Section title={t("legal.terms.section6.title")}>
          <p>{t("legal.terms.section6.p1")}</p>
        </Section>

        <Section title={t("legal.terms.section7.title")}>
          <p>
            {t("legal.terms.section7.p1", { owner: PLATFORM_OWNER, link: "" })}{" "}
            <Link to="/disclaimer" className="underline">
              {t("legal.terms.section7.disclaimerLink")}
            </Link>
            .
          </p>
        </Section>

        <Section title={t("legal.terms.section8.title")}>
          <p>{IP_OWNERSHIP_STATEMENT}</p>
        </Section>

        <Section title={t("legal.terms.section9.title")}>
          <p>{t("legal.terms.section9.p1")}</p>
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
