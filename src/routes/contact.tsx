import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Mail } from "lucide-react";

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
        <h1 className="text-3xl font-heading font-bold mb-3">{t("contact.title")}</h1>
        <p className="text-brand-dark/70 mb-8">{t("contact.intro")}</p>
        <div className="p-6 rounded-2xl border border-brand-dark/10 bg-white">
          <div className="flex items-center gap-3 mb-3">
            <Mail className="size-5 text-brand-primary" />
            <span className="font-medium">Email</span>
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
