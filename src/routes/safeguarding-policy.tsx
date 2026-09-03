import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { SiteLayout } from "@/components/site/SiteLayout";
import {
  SAFEGUARDING_CONTACT_EMAIL,
  SAFEGUARDING_LAST_UPDATED,
  SAFEGUARDING_POLICY_VERSION,
} from "@/lib/safeguarding";
import { Download, Printer, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/safeguarding-policy")({
  head: () => ({
    meta: [
      { title: "Safeguarding Policy — Hineni" },
      {
        name: "description",
        content:
          "Hineni's Safeguarding Policy covering recruitment, mentoring, apprenticeships, conduct, reporting and digital safety for young people and vulnerable adults.",
      },
    ],
  }),
  component: SafeguardingPolicy,
});

function SafeguardingPolicy() {
  const { t } = useTranslation();
  return (
    <SiteLayout>
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 print:py-0">
        <div className="flex flex-wrap items-center gap-3 mb-3 print:hidden">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-semibold">
            <ShieldCheck className="size-3.5" /> {t("legal.safeguarding.badge")}
          </span>
          <span className="text-xs uppercase tracking-widest text-brand-dark/50">
            {t("legal.safeguarding.versionLine", {
              version: SAFEGUARDING_POLICY_VERSION,
              updated: SAFEGUARDING_LAST_UPDATED,
            })}
          </span>
        </div>

        <h1 className="osc-heading text-3xl sm:text-4xl mb-4">
          {t("legal.safeguarding.heading")}
        </h1>
        <p className="text-brand-dark/70 mb-6 leading-relaxed">{t("legal.safeguarding.intro")}</p>

        <div className="flex flex-wrap gap-2 mb-10 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-white border border-brand-dark/10 text-sm inline-flex items-center gap-2 hover:bg-brand-soft"
          >
            <Printer className="size-4" /> {t("legal.safeguarding.print")}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-white border border-brand-dark/10 text-sm inline-flex items-center gap-2 hover:bg-brand-soft"
            title={t("legal.safeguarding.downloadTitle")}
          >
            <Download className="size-4" /> {t("legal.safeguarding.download")}
          </button>
        </div>

        <Section n={1} title={t("legal.safeguarding.s1.title")}>
          <p>{t("legal.safeguarding.s1.p1")}</p>
        </Section>

        <Section n={2} title={t("legal.safeguarding.s2.title")}>
          <p>{t("legal.safeguarding.s2.p1")}</p>
          <ul className="list-disc pl-5 space-y-1">
            <ListItems t={t} prefix="legal.safeguarding.s2" items={["item1", "item2", "item3", "item4"]} />
          </ul>
        </Section>

        <Section n={3} title={t("legal.safeguarding.s3.title")}>
          <p>{t("legal.safeguarding.s3.p1")}</p>
          <ul className="list-disc pl-5 space-y-1">
            <ListItems t={t} prefix="legal.safeguarding.s3" items={["item1", "item2", "item3", "item4", "item5"]} />
          </ul>
        </Section>

        <Section n={4} title={t("legal.safeguarding.s4.title")}>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>{t("legal.safeguarding.s4.item1Term")}</strong> {t("legal.safeguarding.s4.item1")}</li>
            <li><strong>{t("legal.safeguarding.s4.item2Term")}</strong> {t("legal.safeguarding.s4.item2")}</li>
            <li><strong>{t("legal.safeguarding.s4.item3Term")}</strong> {t("legal.safeguarding.s4.item3")}</li>
            <li><strong>{t("legal.safeguarding.s4.item4Term")}</strong> {t("legal.safeguarding.s4.item4")}</li>
          </ul>
        </Section>

        <Section n={5} title={t("legal.safeguarding.s5.title")}>
          <p>{t("legal.safeguarding.s5.p1")}</p>
          <ul className="list-disc pl-5 space-y-1">
            <ListItems t={t} prefix="legal.safeguarding.s5" items={["item1", "item2", "item3", "item4", "item5"]} />
          </ul>
        </Section>

        <Section n={6} title={t("legal.safeguarding.s6.title")}>
          <p>{t("legal.safeguarding.s6.p1")}</p>
          <ul className="list-disc pl-5 space-y-1">
            <ListItems t={t} prefix="legal.safeguarding.s6" items={["item1", "item2", "item3", "item4", "item5", "item6"]} />
          </ul>
        </Section>

        <Section n={7} title={t("legal.safeguarding.s7.title")}>
          <ul className="list-disc pl-5 space-y-1">
            <ListItems t={t} prefix="legal.safeguarding.s7" items={["item1", "item2", "item3", "item4", "item5"]} />
          </ul>
        </Section>

        <Section n={8} title={t("legal.safeguarding.s8.title")}>
          <ul className="list-disc pl-5 space-y-1">
            <ListItems t={t} prefix="legal.safeguarding.s8" items={["item1", "item2", "item3", "item4", "item5", "item6"]} />
          </ul>
        </Section>

        <Section n={9} title={t("legal.safeguarding.s9.title")}>
          <p>{t("legal.safeguarding.s9.p1")}</p>
          <p className="mt-2">
            {t("legal.safeguarding.s9.emailLabel")}{" "}
            <a href={`mailto:${SAFEGUARDING_CONTACT_EMAIL}`} className="underline text-brand-primary">
              {SAFEGUARDING_CONTACT_EMAIL}
            </a>
          </p>
          <p className="mt-2">{t("legal.safeguarding.s9.emergency")}</p>
        </Section>

        <Section n={10} title={t("legal.safeguarding.s10.title")}>
          <p>{t("legal.safeguarding.s10.p1")}</p>
        </Section>

        <Section n={11} title={t("legal.safeguarding.s11.title")}>
          <ul className="list-disc pl-5 space-y-1">
            <ListItems t={t} prefix="legal.safeguarding.s11" items={["item1", "item2", "item3", "item4"]} />
          </ul>
        </Section>

        <Section n={12} title={t("legal.safeguarding.s12.title")}>
          <p>{t("legal.safeguarding.s12.p1")}</p>
        </Section>

        <Section n={13} title={t("legal.safeguarding.s13.title")}>
          <p>{t("legal.safeguarding.s13.p1")}</p>
        </Section>

        <p className="text-xs text-brand-dark/50 mt-12">
          {t("legal.safeguarding.versionLine", {
            version: SAFEGUARDING_POLICY_VERSION,
            updated: SAFEGUARDING_LAST_UPDATED,
          })}
        </p>
      </article>
    </SiteLayout>
  );
}

function ListItems({
  t,
  prefix,
  items,
}: {
  t: (key: string) => string;
  prefix: string;
  items: string[];
}) {
  return (
    <>
      {items.map((item) => (
        <li key={item}>{t(`${prefix}.${item}`)}</li>
      ))}
    </>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-heading font-semibold mb-3 text-brand-dark">
        {n}. {title}
      </h2>
      <div className="text-brand-dark/80 leading-relaxed space-y-3 text-[15px]">{children}</div>
    </section>
  );
}
