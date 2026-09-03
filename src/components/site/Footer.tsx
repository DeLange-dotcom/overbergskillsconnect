import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { IP_OWNERSHIP_STATEMENT } from "@/lib/brand";
import { supabase } from "@/integrations/supabase/client";
import logoAsset from "@/assets/osc-logo-header.png.asset.json";

export function Footer() {
  const { t } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    async function check() {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid) { if (active) setIsAdmin(false); return; }
      const { data } = await supabase.rpc("has_role", { _user_id: uid, _role: "admin" });
      if (active) setIsAdmin(Boolean(data));
    }
    check();
    const { data: sub } = supabase.auth.onAuthStateChange(() => check());
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  return (
    <footer className="mt-14 bg-brand-navy text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <Link to="/" className="inline-flex flex-col items-start gap-0.5">
            <img
              src={logoAsset.url}
              alt={t("shell.brand.logoAlt")}
              className="h-9 sm:h-11 w-auto brightness-0 invert"
            />
            <span className="flex items-center gap-1 text-[8px] sm:text-[9px] uppercase tracking-[0.14em] leading-none whitespace-nowrap">
              <span className="font-semibold text-brand-green">{t("shell.brand.initiative")}</span>
              <span className="text-white/25">·</span>
              <span className="text-white/60">{t("shell.brand.poweredBy")}</span>
            </span>

          </Link>
        </div>
        <div className="text-sm md:text-right">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50 mb-2">
            {t("footer.information")}
          </div>
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-white/75 md:justify-end">
            <li><Link to="/help" className="font-semibold text-brand-green hover:underline">{t("shell.nav.help")}</Link></li>
            <li><Link to="/how-it-works" className="hover:text-white">{t("shell.nav.howItWorks")}</Link></li>

            <li><Link to="/about" className="hover:text-white">{t("footer.about")}</Link></li>
            <li><Link to="/terms" className="hover:text-white">{t("footer.terms")}</Link></li>
            <li><Link to="/privacy" className="hover:text-white">{t("footer.privacy")}</Link></li>
            <li><Link to="/disclaimer" className="hover:text-white">{t("footer.disclaimer")}</Link></li>
            <li><Link to="/contact" className="hover:text-white">{t("footer.contact")}</Link></li>
            {isAdmin && (
              <li>
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition"
                >
                  🛠 Admin
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-3 px-4 sm:px-6">
        <p className="max-w-5xl mx-auto text-[10px] leading-relaxed text-white/40 text-center">
          {IP_OWNERSHIP_STATEMENT}
        </p>
        <div className="mt-1 text-center text-[11px] text-white/50">
          {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
}
