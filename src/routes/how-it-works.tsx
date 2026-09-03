import { createFileRoute } from "@tanstack/react-router";
import { useTranslation, Trans } from "react-i18next";
import { SiteLayout } from "@/components/site/SiteLayout";
import { UserPlus, Search, MessageCircle, ShieldAlert, Settings, Eye, Archive, Trash2, Bell } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PLATFORM_NAME } from "@/lib/brand";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: `How It Works — ${PLATFORM_NAME}` },
      { name: "description", content: "Three simple steps to advertise your skills or find local help in the Overberg." },
      { property: "og:title", content: `How ${PLATFORM_NAME} works` },
      { property: "og:description", content: "Advertise your skills or find local help in three simple steps." },
    ],
  }),
  component: HowItWorks,
});

function HowItWorks() {
  const { t } = useTranslation();
  return (
    <SiteLayout>
      <div className="osc-container py-12 sm:py-16">
        <h1 className="text-4xl font-heading font-bold mb-4">{t("howItWorks.title")}</h1>
        <p className="text-lg text-brand-dark/70 mb-12">
          {t("howItWorks.intro", { platform: PLATFORM_NAME })}
        </p>

        <div className="grid gap-10 md:grid-cols-2 mb-12">
          <div className="p-6 rounded-2xl bg-brand-soft border border-brand-dark/5">
            <h2 className="font-heading text-xl font-semibold mb-6">{t("howItWorks.seeking.heading")}</h2>
            <ol className="space-y-8">
              <Card icon={<UserPlus />} title={t("howItWorks.seeking.step1Title")}>
                {t("howItWorks.seeking.step1Body")}
              </Card>
              <Card icon={<Search />} title={t("howItWorks.seeking.step2Title")}>
                {t("howItWorks.seeking.step2Body")}
              </Card>
              <Card icon={<MessageCircle />} title={t("howItWorks.seeking.step3Title")}>
                {t("howItWorks.seeking.step3Body")}
              </Card>
            </ol>
          </div>

          <div className="p-6 rounded-2xl bg-brand-sky/10 border border-brand-dark/5">
            <h2 className="font-heading text-xl font-semibold mb-6">{t("howItWorks.hiring.heading")}</h2>
            <ol className="space-y-8">
              <Card icon={<Search />} title={t("howItWorks.hiring.step1Title")}>
                {t("howItWorks.hiring.step1Body")}
              </Card>
              <Card icon={<MessageCircle />} title={t("howItWorks.hiring.step2Title")}>
                {t("howItWorks.hiring.step2Body")}
              </Card>
              <Card icon={<HandshakeIcon />} title={t("howItWorks.hiring.step3Title")}>
                {t("howItWorks.hiring.step3Body")}
              </Card>
            </ol>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-brand-dark/5 mb-10">
          <h2 className="font-heading text-xl font-semibold mb-6">{t("howItWorks.managing.heading")}</h2>
          <ol className="space-y-8">
            <Card icon={<Settings />} title={t("howItWorks.managing.editTitle")}>
              <Trans i18nKey="howItWorks.managing.editBody" components={{ strong: <strong /> }} />
            </Card>
            <Card icon={<Eye />} title={t("howItWorks.managing.pauseTitle")}>
              {t("howItWorks.managing.pauseBody")}
            </Card>
            <Card icon={<Archive />} title={t("howItWorks.managing.archiveTitle")}>
              {t("howItWorks.managing.archiveBody")}
            </Card>
            <Card icon={<Trash2 />} title={t("howItWorks.managing.deleteTitle")}>
              {t("howItWorks.managing.deleteBody")}
            </Card>
            <Card icon={<MessageCircle />} title={t("howItWorks.managing.requestsTitle")}>
              <Trans i18nKey="howItWorks.managing.requestsBody" components={{ strong: <strong /> }} />
            </Card>
            <Card icon={<Bell />} title={t("howItWorks.managing.notificationsTitle")}>
              <Trans i18nKey="howItWorks.managing.notificationsBody" components={{ strong: <strong /> }} />
            </Card>
          </ol>
        </div>

        <div className="mt-8 flex items-start gap-3 p-4 rounded-2xl border border-brand-dark/10 bg-white">
          <ShieldAlert className="size-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-brand-dark/70 leading-relaxed">
            {t("howItWorks.disclaimer", { platform: PLATFORM_NAME })}{" "}
            <Link to="/disclaimer" className="underline hover:text-brand-primary">
              {t("howItWorks.disclaimerLink")}
            </Link>
            .
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <div className="size-10 rounded-full bg-brand-primary/10 text-brand-primary grid place-items-center shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-heading text-lg font-semibold mb-1">{title}</h3>
        <p className="text-sm text-brand-dark/70 leading-relaxed">{children}</p>
      </div>
    </li>
  );
}

function HandshakeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-handshake">
      <path d="m11 17 2 2a1 1 0 1 0 3-3"/>
      <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.55.47a.78.78 0 0 0 .59.18"/>
      <path d="m18.5 2.5 2.5 2.5"/>
      <path d="m2.5 2.5 2.5 2.5"/>
      <path d="m7 8 1 1"/>
      <path d="M2.5 2.5 7 7"/>
      <path d="M18.5 2.5 14 7"/>
    </svg>
  );
}
