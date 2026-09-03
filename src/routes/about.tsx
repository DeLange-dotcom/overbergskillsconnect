import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { SiteLayout } from "@/components/site/SiteLayout";
import { HINENI_DONATION_URL, PLATFORM_NAME } from "@/lib/brand";
import { PageHeader } from "@/components/site/PageHeader";
import { GraduationCap, HandHeart, Hammer, Sparkles } from "lucide-react";
import hineniLogoAsset from "@/assets/hineni-logo-mark.png.asset.json";
import khulisaLogoAsset from "@/assets/khulisa-group-logo.png.asset.json";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About — ${PLATFORM_NAME}` },
      {
        name: "description",
        content:
          "Overberg Skills Connect is a Hineni Call community initiative making it easier to share skills, find local help and connect with local opportunity.",
      },
      { property: "og:title", content: `About — ${PLATFORM_NAME}` },
      {
        property: "og:description",
        content:
          "Why Overberg Skills Connect exists, the roles of Hineni Call and Khulisa Group, and what is planned next.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

const futureCardKeys = [
  { key: "youthClub", icon: Sparkles, tone: "green" },
  { key: "apprenticeships", icon: Hammer, tone: "orange" },
  { key: "knowledgeGuardians", icon: GraduationCap, tone: "navy" },
  { key: "sponsors", icon: HandHeart, tone: "green" },
] as const;

const toneStyles = {
  green: "bg-brand-green/12 text-brand-green",
  orange: "bg-brand-orange/15 text-brand-orange",
  navy: "bg-brand-navy/10 text-brand-navy",
} as const;

export default function About() {
  const { t } = useTranslation();
  const list = (key: string): string[] => {
    const value = t(key, { returnObjects: true });
    return Array.isArray(value) ? (value as string[]) : [];
  };
  const introParas = list("aboutPage.intro");
  const hineniBody = list("aboutPage.hineni.body");
  const khulisaBody = list("aboutPage.khulisa.body");
  const platformBody = list("aboutPage.platform.body");

  const emphasisIndex = 3;

  return (
    <SiteLayout>
      {/* 1. Introduction */}
      <section className="px-4 sm:px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <PageHeader
            eyebrow={t("aboutPage.eyebrow", { platform: PLATFORM_NAME })}
            title={t("aboutPage.heroTitle")}
          />
          <div className="space-y-5 text-base sm:text-lg leading-relaxed text-brand-navy/80">
            {introParas.map((p, i) => (
              <p key={i} className={i === emphasisIndex ? "font-medium text-brand-navy" : undefined}>
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* 2 + 3. Partnership */}
      <section className="bg-brand-neutral px-4 sm:px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Hineni */}
            <div className="osc-card p-6 sm:p-8">
              <span className="osc-eyebrow">{t("aboutPage.hineni.eyebrow")}</span>
              <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-brand-navy/55">
                {t("aboutPage.hineni.role")}
              </p>
              <div className="mt-4 overflow-hidden rounded-xl">
                <img
                  src={hineniLogoAsset.url}
                  alt={t("aboutPage.hineni.logoAlt", "Hineni Call logo")}
                  className="h-24 w-full object-contain sm:h-28"
                />
              </div>
              <h2 className="osc-heading mt-5 text-2xl">{t("aboutPage.hineni.heading")}</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-brand-navy/80">
                {hineniBody.map((p, i) => (
                  <p key={i} className={i === hineniBody.length - 1 ? "font-medium text-brand-navy" : undefined}>
                    {p}
                  </p>
                ))}
              </div>
            </div>

            {/* Khulisa */}
            <div className="osc-card p-6 sm:p-8">
              <span className="osc-eyebrow">{t("aboutPage.khulisa.eyebrow")}</span>
              <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-brand-navy/55">
                {t("aboutPage.khulisa.role")}
              </p>
              {/* Approved Khulisa Group logo asset is not present in the project — position reserved. */}
              <div className="mt-4 flex h-20 items-center justify-center rounded-xl border border-dashed border-brand-navy/15 bg-brand-cream text-xs uppercase tracking-wider text-brand-navy/45">
                {t("aboutPage.khulisa.logoPlaceholder")}
              </div>
              <h2 className="osc-heading mt-5 text-2xl">{t("aboutPage.khulisa.heading")}</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-brand-navy/80">
                {khulisaBody.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border-l-4 border-brand-orange bg-brand-cream p-6 text-center">
            <p className="text-lg font-medium text-brand-navy">
              {t("aboutPage.partnership.statement")}
            </p>
            <p className="mt-3 text-sm uppercase tracking-wider text-brand-navy/55">
              {t("aboutPage.partnership.tagline")}
            </p>
          </div>
        </div>
      </section>

      {/* 5 + 6. What's coming next */}
      <section className="px-4 sm:px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <span className="osc-eyebrow">{t("aboutPage.future.eyebrow")}</span>
          <h2 className="osc-heading mt-2 text-2xl sm:text-3xl">
            {t("aboutPage.future.heading")}
          </h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-brand-navy/75">
            {t("aboutPage.future.intro")}
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {futureCardKeys.map((card) => (
              <div
                key={card.key}
                className="rounded-2xl border border-brand-navy/10 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={`grid size-12 shrink-0 place-items-center rounded-xl ${toneStyles[card.tone]}`}
                    aria-hidden="true"
                  >
                    <card.icon className="size-6" />
                  </span>
                  <span className="rounded-full bg-brand-neutral px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-navy/60">
                    {t("aboutPage.future.badge")}
                  </span>
                </div>
                <h3 className="osc-heading mt-4 text-xl">{t(`aboutPage.future.cards.${card.key}.title`)}</h3>
                <p className="mt-2 leading-relaxed text-brand-navy/75">
                  {t(`aboutPage.future.cards.${card.key}.copy`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 + 8. Support Hineni Call */}
      <section className="bg-brand-navy px-4 sm:px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-green">
            {t("aboutPage.support.eyebrow")}
          </span>
          <h2 className="mt-2 font-heading text-2xl sm:text-3xl font-semibold text-brand-cream">
            {t("aboutPage.support.heading")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-brand-cream/80">
            {t("aboutPage.support.body")}
          </p>
          <div className="mt-7">
            {HINENI_DONATION_URL ? (
              <a
                href={HINENI_DONATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="osc-btn osc-btn-primary px-7 py-3 text-base"
              >
                {t("aboutPage.support.cta")}
              </a>
            ) : (
              <>
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="osc-btn osc-btn-primary px-7 py-3 text-base opacity-60"
                >
                  {t("aboutPage.support.cta")}
                </button>
                <p className="mt-3 text-sm text-brand-cream/70">
                  {t("aboutPage.support.comingSoon")}
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 9. Community platform / safety */}
      <section className="px-4 sm:px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <span className="osc-eyebrow">{t("aboutPage.platform.eyebrow")}</span>
          <div className="mt-3 space-y-3 leading-relaxed text-brand-navy/80">
            {platformBody.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-brand-navy">
            <Link to="/terms" className="font-medium underline underline-offset-4">
              {t("aboutPage.platform.links.terms")}
            </Link>
            <Link to="/privacy" className="font-medium underline underline-offset-4">
              {t("aboutPage.platform.links.privacy")}
            </Link>
            <Link to="/disclaimer" className="font-medium underline underline-offset-4">
              {t("aboutPage.platform.links.disclaimer")}
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
