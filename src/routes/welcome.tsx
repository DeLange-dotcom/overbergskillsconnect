import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Hammer, Search } from "lucide-react";
import i18n from "@/i18n";

export const Route = createFileRoute("/welcome")({
  ssr: false,
  head: () => ({
    meta: [
      { title: i18n.t("welcome.meta.title") },
      { name: "description", content: i18n.t("welcome.meta.description") },
      { property: "og:title", content: i18n.t("welcome.meta.title") },
      { property: "og:description", content: i18n.t("welcome.meta.description") },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WelcomeChoice,
});

function markWelcomed() {
  try {
    localStorage.setItem("osc_welcomed", "1");
    localStorage.removeItem("osc_show_welcome");
  } catch {
    /* storage unavailable */
  }
}

function WelcomeChoice() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!data.session) {
        navigate({ to: "/auth", replace: true });
        return;
      }
      setReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (!ready) {
    return (
      <SiteLayout>
        <div className="osc-container py-20 text-center text-brand-dark/60">
          <Loader2 className="size-6 animate-spin mx-auto" />
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="osc-container py-10 sm:py-14">
        <PageHeader
          eyebrow={t("welcome.eyebrow")}
          title={t("welcome.heading")}
          intro={t("welcome.intro")}
        />

        <div className="grid gap-4 sm:grid-cols-2 max-w-3xl">
          <Link
            to="/advertise"
            onClick={markWelcomed}
            className="block rounded-2xl bg-brand-primary text-white p-6 sm:p-7 hover:opacity-95 transition"
          >
            <Hammer className="size-7 mb-3" aria-hidden />
            <h2 className="font-heading text-2xl font-semibold mb-1.5">
              {t("welcome.offer.title")}
            </h2>
            <p className="text-white/85 text-sm">{t("welcome.offer.body")}</p>
          </Link>

          <Link
            to="/find-help"
            onClick={markWelcomed}
            className="block rounded-2xl border border-brand-dark/15 bg-white p-6 sm:p-7 hover:bg-brand-soft transition"
          >
            <Search className="size-7 mb-3 text-brand-primary" aria-hidden />
            <h2 className="font-heading text-2xl font-semibold mb-1.5">
              {t("welcome.find.title")}
            </h2>
            <p className="text-brand-dark/70 text-sm">{t("welcome.find.body")}</p>
          </Link>
        </div>

        <Link
          to="/profile"
          onClick={markWelcomed}
          className="inline-block mt-6 text-sm text-brand-primary hover:underline"
        >
          {t("welcome.skip")}
        </Link>
      </div>
    </SiteLayout>
  );
}
