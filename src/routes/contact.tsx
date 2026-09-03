import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Mail } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { PLATFORM_NAME } from "@/lib/brand";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Overberg Skills Connect" },
      { name: "description", content: "Get in touch with the Overberg Skills Connect team." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { t } = useTranslation();
  return (
    <SiteLayout>
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
        <PageHeader
          eyebrow={t("contactPage.eyebrow")}
          title={t("contactPage.title")}
          intro={t("contactPage.intro", { platform: PLATFORM_NAME })}
        />
        <div className="p-6 osc-card">
          <div className="flex items-center gap-3 mb-3">
            <Mail className="size-5 text-brand-orange" />
            <span className="font-medium">{t("contactPage.emailLabel")}</span>
          </div>
          <a
            href="mailto:hello@khulisagroup.com"
            className="text-brand-primary underline break-all"
          >
            hello@khulisagroup.com
          </a>
        </div>
      </div>
    </SiteLayout>
  );
}
